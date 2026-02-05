-- Create signals table
CREATE TABLE public.signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produce_type TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  district TEXT NOT NULL,
  harvest_deadline_days INTEGER NOT NULL,
  price_drop_severity TEXT NOT NULL CHECK (price_drop_severity IN ('low', 'medium', 'high')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create opportunities table
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL REFERENCES public.signals(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  urgency_label TEXT NOT NULL DEFAULT 'Low',
  recommended_action TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create buyer_leads table
CREATE TABLE public.buyer_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  location TEXT,
  source TEXT DEFAULT 'FullEnrich',
  enrichment_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_leads ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for MVP (no auth required)
-- Signals policies
CREATE POLICY "Allow public read on signals" ON public.signals FOR SELECT USING (true);
CREATE POLICY "Allow public insert on signals" ON public.signals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on signals" ON public.signals FOR UPDATE USING (true);

-- Opportunities policies
CREATE POLICY "Allow public read on opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Allow public insert on opportunities" ON public.opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on opportunities" ON public.opportunities FOR UPDATE USING (true);

-- Buyer leads policies
CREATE POLICY "Allow public read on buyer_leads" ON public.buyer_leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert on buyer_leads" ON public.buyer_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on buyer_leads" ON public.buyer_leads FOR UPDATE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_opportunities_signal_id ON public.opportunities(signal_id);
CREATE INDEX idx_buyer_leads_opportunity_id ON public.buyer_leads(opportunity_id);
CREATE INDEX idx_opportunities_status ON public.opportunities(status);
CREATE INDEX idx_signals_produce_type ON public.signals(produce_type);
CREATE INDEX idx_signals_district ON public.signals(district);