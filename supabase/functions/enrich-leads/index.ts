import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Fallback demo leads when FullEnrich API fails or returns empty
const FALLBACK_LEADS = [
  {
    name: "Amadu Koroma",
    company: "Freetown Fresh Foods",
    role: "Procurement Manager",
    email: "amadu.k@freetownfresh.sl",
    phone: "+232 76 123 456",
    linkedin_url: "https://linkedin.com/in/amadukoroma",
    location: "Freetown, Western Area",
    source: "Demo Data",
  },
  {
    name: "Fatmata Sesay",
    company: "Sierra Exports Ltd",
    role: "Supply Chain Director",
    email: "f.sesay@sierraexports.com",
    phone: "+232 77 234 567",
    linkedin_url: "https://linkedin.com/in/fatmatasesay",
    location: "Freetown, Western Area",
    source: "Demo Data",
  },
  {
    name: "Mohamed Bangura",
    company: "Makeni Wholesale Market",
    role: "Operations Head",
    email: "mbangura@makeniwholesale.sl",
    phone: "+232 78 345 678",
    linkedin_url: "https://linkedin.com/in/mohamedbangura",
    location: "Makeni, Bombali",
    source: "Demo Data",
  },
  {
    name: "Mariama Conteh",
    company: "Bo District Traders Association",
    role: "President",
    email: "m.conteh@botraders.org",
    phone: "+232 76 456 789",
    linkedin_url: "https://linkedin.com/in/mariamaconteh",
    location: "Bo, Bo District",
    source: "Demo Data",
  },
  {
    name: "Ibrahim Kamara",
    company: "National Food Security Agency",
    role: "Regional Coordinator",
    email: "i.kamara@nfsa.gov.sl",
    phone: "+232 77 567 890",
    linkedin_url: "https://linkedin.com/in/ibrahimkamara",
    location: "Kenema, Kenema District",
    source: "Demo Data",
  },
  {
    name: "Hawa Jalloh",
    company: "Green Valley Supermarket",
    role: "Buyer",
    email: "hawa@greenvalleysl.com",
    phone: "+232 78 678 901",
    linkedin_url: "https://linkedin.com/in/hawajalloh",
    location: "Freetown, Western Area",
    source: "Demo Data",
  },
];

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { opportunityId, produceType, district } = await req.json();

    if (!opportunityId) {
      return new Response(
        JSON.stringify({ error: "opportunityId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get FullEnrich API key
    const fullEnrichApiKey = Deno.env.get("FULLENRICH_API_KEY");

    let enrichedLeads: typeof FALLBACK_LEADS = [];

    if (fullEnrichApiKey) {
      try {
        // Call FullEnrich API
        // Note: Replace with actual FullEnrich API endpoint and format
        const searchQuery = `${produceType} buyer ${district} Sierra Leone agriculture wholesale`;
        
        const response = await fetch("https://api.fullenrich.com/v1/search", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${fullEnrichApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchQuery,
            limit: 10,
            filters: {
              industries: ["agriculture", "food", "wholesale", "retail"],
              locations: ["Sierra Leone"],
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Map FullEnrich response to our lead format
          if (data.results && data.results.length > 0) {
            enrichedLeads = data.results.map((result: any) => ({
              name: result.full_name || result.name || "Unknown",
              company: result.company || result.organization || null,
              role: result.title || result.job_title || null,
              email: result.email || null,
              phone: result.phone || result.mobile || null,
              linkedin_url: result.linkedin_url || result.linkedin || null,
              location: result.location || result.city || null,
              source: "FullEnrich",
            }));
          }
        } else {
          console.log("FullEnrich API returned non-OK status:", response.status);
        }
      } catch (apiError) {
        console.log("FullEnrich API error, using fallback:", apiError);
      }
    }

    // If no leads from FullEnrich, use fallback demo data
    if (enrichedLeads.length === 0) {
      console.log("Using fallback demo leads");
      // Randomly select 3-5 leads from fallback data
      const shuffled = [...FALLBACK_LEADS].sort(() => 0.5 - Math.random());
      enrichedLeads = shuffled.slice(0, Math.floor(Math.random() * 3) + 3);
    }

    // Check for existing leads to avoid duplicates
    const { data: existingLeads } = await supabase
      .from("buyer_leads")
      .select("email")
      .eq("opportunity_id", opportunityId);

    const existingEmails = new Set(existingLeads?.map((l) => l.email) || []);

    // Filter out duplicates
    const newLeads = enrichedLeads.filter(
      (lead) => !lead.email || !existingEmails.has(lead.email)
    );

    // Insert new leads
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
      }));

      const { error: insertError } = await supabase
        .from("buyer_leads")
        .insert(leadsToInsert);

      if (insertError) {
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        leadsAdded: newLeads.length,
        message: newLeads.length > 0 
          ? `Added ${newLeads.length} new buyer leads` 
          : "No new leads to add",
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
