-- Add export_status to buyer_leads table
ALTER TABLE public.buyer_leads 
ADD COLUMN IF NOT EXISTS export_status text DEFAULT 'not_exported',
ADD COLUMN IF NOT EXISTS exported_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS export_error text;

-- Create crm_exports table to track export history
CREATE TABLE public.crm_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id),
  crm_type text NOT NULL CHECK (crm_type IN ('hubspot', 'salesforce', 'pipedrive')),
  leads_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  error_message text,
  webhook_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on crm_exports
ALTER TABLE public.crm_exports ENABLE ROW LEVEL SECURITY;

-- Allow public access for MVP (no auth)
CREATE POLICY "Allow public insert on crm_exports" ON public.crm_exports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on crm_exports" ON public.crm_exports FOR SELECT USING (true);
CREATE POLICY "Allow public update on crm_exports" ON public.crm_exports FOR UPDATE USING (true);

-- Enable realtime for opportunities table
ALTER PUBLICATION supabase_realtime ADD TABLE public.opportunities;

-- Enable realtime for buyer_leads table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.buyer_leads;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_crm_exports_opportunity ON public.crm_exports(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_buyer_leads_export_status ON public.buyer_leads(export_status);