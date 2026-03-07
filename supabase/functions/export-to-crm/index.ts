import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type CrmType = 'hubspot' | 'salesforce' | 'pipedrive';

interface Lead {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  location: string | null;
}

interface OpportunityContext {
  produce_type: string;
  district: string;
  quantity: number;
  unit: string;
  urgency_score: number;
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof str === "string" && uuidRegex.test(str);
}

function isValidCrmType(str: unknown): str is CrmType {
  return str === 'hubspot' || str === 'salesforce' || str === 'pipedrive';
}

function isValidUrl(str: unknown): boolean {
  if (typeof str !== 'string') return false;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Format leads for CRM webhook payload
function formatCrmPayload(leads: Lead[], opportunity: OpportunityContext, crmType: CrmType) {
  return {
    crm_type: crmType,
    exported_at: new Date().toISOString(),
    opportunity_context: {
      produce_type: opportunity.produce_type,
      district: opportunity.district,
      quantity: `${opportunity.quantity} ${opportunity.unit}`,
      urgency_score: opportunity.urgency_score,
    },
    contacts: leads.map(lead => ({
      id: lead.id,
      name: lead.name,
      company: lead.company,
      role: lead.role,
      email: lead.email,
      phone: lead.phone,
      linkedin_url: lead.linkedin_url,
      location: lead.location,
    })),
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
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
    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    const { opportunityId, crmType, webhookUrl } = body as Record<string, unknown>;

    // Validate inputs
    if (!opportunityId || !isValidUUID(String(opportunityId))) {
      return new Response(
        JSON.stringify({ error: "Valid opportunityId (UUID) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isValidCrmType(crmType)) {
      return new Response(
        JSON.stringify({ error: "crmType must be 'hubspot', 'salesforce', or 'pipedrive'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // webhookUrl is optional - if not provided, we just record the export intent
    if (webhookUrl && !isValidUrl(webhookUrl)) {
      return new Response(
        JSON.stringify({ error: "Invalid webhookUrl format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch opportunity with signal data
    const { data: opportunity, error: opError } = await supabase
      .from("opportunities")
      .select(`
        id,
        score,
        signals (
          produce_type,
          district,
          quantity,
          unit
        )
      `)
      .eq("id", opportunityId)
      .single();

    if (opError || !opportunity) {
      return new Response(
        JSON.stringify({ error: "Opportunity not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch leads for this opportunity
    const { data: leads, error: leadsError } = await supabase
      .from("buyer_leads")
      .select("id, name, company, role, email, phone, linkedin_url, location")
      .eq("opportunity_id", opportunityId);

    if (leadsError) {
      throw leadsError;
    }

    if (!leads || leads.length === 0) {
      return new Response(
        JSON.stringify({ error: "No leads found for this opportunity" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create export record
    const { data: exportRecord, error: exportInsertError } = await supabase
      .from("crm_exports")
      .insert({
        opportunity_id: opportunityId,
        crm_type: crmType,
        leads_count: leads.length,
        status: 'pending',
        webhook_url: webhookUrl || null,
      })
      .select()
      .single();

    if (exportInsertError) {
      throw exportInsertError;
    }

    // Prepare payload
    const opportunityContext: OpportunityContext = {
      produce_type: opportunity.signals?.produce_type || 'unknown',
      district: opportunity.signals?.district || 'unknown',
      quantity: opportunity.signals?.quantity || 0,
      unit: opportunity.signals?.unit || 'kg',
      urgency_score: opportunity.score,
    };

    const payload = formatCrmPayload(leads as Lead[], opportunityContext, crmType);

    let exportStatus = 'success';
    let errorMessage: string | null = null;

    // If webhookUrl provided, send to webhook
    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl as string, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          exportStatus = 'failed';
          errorMessage = `Webhook returned status ${response.status}`;
        }
      } catch (webhookError) {
        console.error("Webhook error:", webhookError);
        exportStatus = 'failed';
        errorMessage = webhookError instanceof Error ? webhookError.message : "Webhook connection failed";
      }
    }

    // Update export record with final status
    await supabase
      .from("crm_exports")
      .update({ 
        status: exportStatus, 
        error_message: errorMessage 
      })
      .eq("id", exportRecord.id);

    // Update lead export statuses
    const leadIds = leads.map(l => l.id);
    const exportTimestamp = new Date().toISOString();

    if (exportStatus === 'success') {
      await supabase
        .from("buyer_leads")
        .update({ 
          export_status: `exported_to_${crmType}`,
          exported_at: exportTimestamp,
          export_error: null,
        })
        .in("id", leadIds);
    } else {
      await supabase
        .from("buyer_leads")
        .update({ 
          export_status: 'failed',
          export_error: errorMessage,
        })
        .in("id", leadIds);
    }

    return new Response(
      JSON.stringify({
        success: exportStatus === 'success',
        exportId: exportRecord.id,
        crmType,
        leadsExported: leads.length,
        status: exportStatus,
        error: errorMessage,
        message: exportStatus === 'success' 
          ? `Successfully exported ${leads.length} leads to ${crmType.charAt(0).toUpperCase() + crmType.slice(1)}`
          : `Export failed: ${errorMessage}`,
        payload: webhookUrl ? undefined : payload, // Return payload if no webhook (for manual copy)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in export-to-crm function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});