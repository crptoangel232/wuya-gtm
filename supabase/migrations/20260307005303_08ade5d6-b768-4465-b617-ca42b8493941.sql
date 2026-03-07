-- Drop all public policies and replace with authenticated-user policies

-- === signals ===
DROP POLICY IF EXISTS "Allow public insert on signals" ON public.signals;
DROP POLICY IF EXISTS "Allow public read on signals" ON public.signals;
DROP POLICY IF EXISTS "Allow public update on signals" ON public.signals;

CREATE POLICY "Authenticated users can insert signals"
  ON public.signals FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read signals"
  ON public.signals FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update signals"
  ON public.signals FOR UPDATE TO authenticated
  USING (true);

-- === opportunities ===
DROP POLICY IF EXISTS "Allow public insert on opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Allow public read on opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Allow public update on opportunities" ON public.opportunities;

CREATE POLICY "Authenticated users can insert opportunities"
  ON public.opportunities FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read opportunities"
  ON public.opportunities FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update opportunities"
  ON public.opportunities FOR UPDATE TO authenticated
  USING (true);

-- === buyer_leads ===
DROP POLICY IF EXISTS "Allow public insert on buyer_leads" ON public.buyer_leads;
DROP POLICY IF EXISTS "Allow public read on buyer_leads" ON public.buyer_leads;
DROP POLICY IF EXISTS "Allow public update on buyer_leads" ON public.buyer_leads;

CREATE POLICY "Authenticated users can insert buyer_leads"
  ON public.buyer_leads FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read buyer_leads"
  ON public.buyer_leads FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update buyer_leads"
  ON public.buyer_leads FOR UPDATE TO authenticated
  USING (true);

-- === action_plan_items ===
DROP POLICY IF EXISTS "Allow public delete on action_plan_items" ON public.action_plan_items;
DROP POLICY IF EXISTS "Allow public insert on action_plan_items" ON public.action_plan_items;
DROP POLICY IF EXISTS "Allow public read on action_plan_items" ON public.action_plan_items;
DROP POLICY IF EXISTS "Allow public update on action_plan_items" ON public.action_plan_items;

CREATE POLICY "Authenticated users can insert action_plan_items"
  ON public.action_plan_items FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read action_plan_items"
  ON public.action_plan_items FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update action_plan_items"
  ON public.action_plan_items FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete action_plan_items"
  ON public.action_plan_items FOR DELETE TO authenticated
  USING (true);

-- === signal_images ===
DROP POLICY IF EXISTS "Allow public delete on signal_images" ON public.signal_images;
DROP POLICY IF EXISTS "Allow public insert on signal_images" ON public.signal_images;
DROP POLICY IF EXISTS "Allow public read on signal_images" ON public.signal_images;

CREATE POLICY "Authenticated users can insert signal_images"
  ON public.signal_images FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read signal_images"
  ON public.signal_images FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete signal_images"
  ON public.signal_images FOR DELETE TO authenticated
  USING (true);

-- === crm_exports ===
DROP POLICY IF EXISTS "Allow public insert on crm_exports" ON public.crm_exports;
DROP POLICY IF EXISTS "Allow public read on crm_exports" ON public.crm_exports;
DROP POLICY IF EXISTS "Allow public update on crm_exports" ON public.crm_exports;

CREATE POLICY "Authenticated users can insert crm_exports"
  ON public.crm_exports FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read crm_exports"
  ON public.crm_exports FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update crm_exports"
  ON public.crm_exports FOR UPDATE TO authenticated
  USING (true);