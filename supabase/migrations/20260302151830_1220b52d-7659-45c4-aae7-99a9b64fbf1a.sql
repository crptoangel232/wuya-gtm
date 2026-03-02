
ALTER TABLE public.signals
  ADD COLUMN country TEXT NOT NULL DEFAULT '',
  ADD COLUMN region TEXT,
  ADD COLUMN city TEXT;

-- Migrate existing data: copy district into city for backward compat
UPDATE public.signals SET city = district WHERE district IS NOT NULL AND district != '';
