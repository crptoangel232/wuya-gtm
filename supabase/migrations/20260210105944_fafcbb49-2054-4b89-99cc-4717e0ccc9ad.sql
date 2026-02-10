-- Add buyer targeting fields to opportunities table
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS buyer_type text,
ADD COLUMN IF NOT EXISTS target_city text,
ADD COLUMN IF NOT EXISTS buyer_keywords text;

-- Create table for signal images (photos of produce)
CREATE TABLE IF NOT EXISTS public.signal_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signal_id uuid NOT NULL REFERENCES public.signals(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on signal_images
ALTER TABLE public.signal_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for signal_images (public access for MVP)
CREATE POLICY "Allow public read on signal_images" 
ON public.signal_images FOR SELECT USING (true);

CREATE POLICY "Allow public insert on signal_images" 
ON public.signal_images FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete on signal_images" 
ON public.signal_images FOR DELETE USING (true);

-- Create table for 48-hour action plan items
CREATE TABLE IF NOT EXISTS public.action_plan_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  task_text text NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on action_plan_items
ALTER TABLE public.action_plan_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for action_plan_items (public access for MVP)
CREATE POLICY "Allow public read on action_plan_items" 
ON public.action_plan_items FOR SELECT USING (true);

CREATE POLICY "Allow public insert on action_plan_items" 
ON public.action_plan_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on action_plan_items" 
ON public.action_plan_items FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on action_plan_items" 
ON public.action_plan_items FOR DELETE USING (true);

-- Create storage bucket for produce images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('produce-images', 'produce-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for produce images bucket
CREATE POLICY "Allow public read on produce-images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'produce-images');

CREATE POLICY "Allow public upload on produce-images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'produce-images');

CREATE POLICY "Allow public delete on produce-images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'produce-images');

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.signal_images;
ALTER PUBLICATION supabase_realtime ADD TABLE public.action_plan_items;