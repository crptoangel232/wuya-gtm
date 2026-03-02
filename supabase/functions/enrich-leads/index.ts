import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof str === "string" && uuidRegex.test(str);
}

function sanitizeString(str: unknown, maxLength: number): string | null {
  if (str === null || str === undefined) return null;
  if (typeof str !== "string") return null;
  return str.replace(/[\x00-\x1F\x7F]/g, "").trim().slice(0, maxLength);
}

function buildStringFilter(value: string, exactMatch = false) {
  return [{ value, exact_match: exactMatch, exclude: false }];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ error: "Request body must be an object" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { opportunityId, produceType, district, buyerType, targetCity, buyerKeywords } = body as Record<string, unknown>;

    if (!opportunityId || !isValidUUID(String(opportunityId))) {
      return new Response(
        JSON.stringify({ error: "Valid opportunityId (UUID) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedProduceType = sanitizeString(produceType, 100);
    const sanitizedDistrict = sanitizeString(district, 100);
    const sanitizedBuyerType = sanitizeString(buyerType, 100);
    const sanitizedTargetCity = sanitizeString(targetCity, 100);
    const sanitizedKeywords = sanitizeString(buyerKeywords, 200);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify opportunity exists
    const { data: opportunity, error: opError } = await supabase
      .from("opportunities")
      .select("id")
      .eq("id", opportunityId)
      .single();

    if (opError || !opportunity) {
      return new Response(
        JSON.stringify({ error: "Opportunity not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullEnrichApiKey = Deno.env.get("FULLENRICH_API_KEY");
    if (!fullEnrichApiKey) {
      return new Response(
        JSON.stringify({ 
          error: "FullEnrich API key not configured",
          message: "No API key found. Please add your FullEnrich API key in the admin settings."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build FullEnrich /people/search request body per API docs
    const searchBody: Record<string, unknown> = {
      limit: 10,
      offset: 0,
    };

    // Industry filter based on buyer type
    const industryValues: string[] = [];
    if (sanitizedBuyerType) {
      const typeMap: Record<string, string[]> = {
        "Distributor": ["Wholesale", "Food and Beverage Services"],
        "Restaurant": ["Restaurants", "Hospitality"],
        "Supermarket": ["Retail", "Retail Groceries"],
        "Exporter": ["International Trade and Development", "Import and Export"],
        "NGO Procurement": ["Non-profit Organizations"],
        "Aggregator": ["Wholesale", "Farming"],
      };
      if (typeMap[sanitizedBuyerType]) {
        industryValues.push(...typeMap[sanitizedBuyerType]);
      }
    }
    if (industryValues.length === 0) {
      industryValues.push("Food and Beverage Services", "Farming");
    }
    searchBody.current_company_industries = industryValues.map(v => ({
      value: v, exact_match: false, exclude: false,
    }));

    // Location filter
    const locationFilters: Array<{value: string; exact_match: boolean; exclude: boolean}> = [];
    if (sanitizedTargetCity) {
      locationFilters.push({ value: sanitizedTargetCity, exact_match: false, exclude: false });
    }
    if (sanitizedDistrict && sanitizedDistrict !== sanitizedTargetCity) {
      locationFilters.push({ value: sanitizedDistrict, exact_match: false, exclude: false });
    }
    if (locationFilters.length > 0) {
      searchBody.person_locations = locationFilters;
    }

    // Title filter from keywords or produce type
    const titleFilters: Array<{value: string; exact_match: boolean; exclude: boolean}> = [];
    if (sanitizedKeywords) {
      titleFilters.push({ value: sanitizedKeywords, exact_match: false, exclude: false });
    }
    if (sanitizedBuyerType) {
      titleFilters.push({ value: sanitizedBuyerType, exact_match: false, exclude: false });
    }
    if (titleFilters.length > 0) {
      searchBody.current_position_titles = titleFilters;
    }

    // Company specialties from produce type
    if (sanitizedProduceType) {
      searchBody.current_company_specialties = buildStringFilter(sanitizedProduceType);
    }

    console.log("FullEnrich /people/search request:", JSON.stringify(searchBody));

    interface EnrichedLead {
      name: string;
      company: string | null;
      role: string | null;
      email: string | null;
      phone: string | null;
      linkedin_url: string | null;
      location: string | null;
      source: string;
    }

    let enrichedLeads: EnrichedLead[] = [];

    try {
      const response = await fetch("https://app.fullenrich.com/api/v2/people/search", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${fullEnrichApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.log("FullEnrich API error:", response.status, errorBody);

        const statusText = response.status === 403 
          ? "Invalid API key or insufficient permissions"
          : response.status === 429
          ? "Rate limit exceeded — wait a few minutes and try again"
          : `FullEnrich returned error ${response.status}: ${errorBody}`;

        return new Response(
          JSON.stringify({ error: "FullEnrich search failed", message: statusText }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      console.log("FullEnrich response metadata:", JSON.stringify(data.metadata));

      if (data.people && data.people.length > 0) {
        enrichedLeads = data.people.map((person: Record<string, unknown>) => {
          const employment = person.employment as Record<string, unknown> | null;
          const current = employment?.current as Record<string, unknown> | null;
          const company = current?.company as Record<string, unknown> | null;
          const socialProfiles = person.social_profiles as Record<string, unknown> | null;
          const linkedin = socialProfiles?.linkedin as Record<string, unknown> | null;
          const loc = person.location as Record<string, unknown> | null;

          return {
            name: person.full_name || "Unknown",
            company: company?.name || null,
            role: current?.title || null,
            email: null, // People search doesn't return contact info directly
            phone: null,
            linkedin_url: linkedin?.url || null,
            location: loc ? [loc.city, loc.region, loc.country].filter(Boolean).join(", ") : null,
            source: "FullEnrich",
          };
        });
      } else {
        return new Response(
          JSON.stringify({ 
            success: true,
            leadsAdded: 0,
            message: "No matching buyers found. Try different search criteria — change buyer type, city, or add keywords."
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (apiError) {
      console.error("FullEnrich API error:", apiError);
      return new Response(
        JSON.stringify({ 
          error: "FullEnrich API connection failed",
          message: "Could not connect to FullEnrich. Please try again later."
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for existing leads to avoid duplicates
    const { data: existingLeads } = await supabase
      .from("buyer_leads")
      .select("linkedin_url, name")
      .eq("opportunity_id", opportunityId);

    const existingLinkedins = new Set(existingLeads?.map((l) => l.linkedin_url).filter(Boolean) || []);
    const existingNames = new Set(existingLeads?.map((l) => l.name) || []);

    const newLeads = enrichedLeads.filter(
      (lead) => {
        if (lead.linkedin_url && existingLinkedins.has(lead.linkedin_url)) return false;
        if (existingNames.has(lead.name)) return false;
        return true;
      }
    );

    if (newLeads.length > 0) {
      const leadsToInsert = newLeads.map((lead) => ({
        opportunity_id: opportunityId,
        name: lead.name,
        company: lead.company,
        role: lead.role,
        email: lead.email,
        phone: lead.phone,
        linkedin_url: lead.linkedin_url,
        location: lead.location,
        source: lead.source,
        enrichment_json: lead,
        export_status: 'not_exported',
      }));

      const { error: insertError } = await supabase
        .from("buyer_leads")
        .insert(leadsToInsert);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        leadsAdded: newLeads.length,
        message: newLeads.length > 0 
          ? `Found ${newLeads.length} verified buyer contacts`
          : "No new contacts found (they may already exist for this opportunity)",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in enrich-leads function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
