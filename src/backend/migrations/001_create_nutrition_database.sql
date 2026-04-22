-- Create nutrition_database table
CREATE TABLE IF NOT EXISTS public.nutrition_database (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  calories numeric NOT NULL,
  protein numeric NOT NULL,
  carbs numeric NOT NULL,
  fat numeric NOT NULL,
  fiber numeric DEFAULT 0,
  price numeric NOT NULL,
  category character varying NOT NULL,
  serving_size numeric DEFAULT 100,
  unit character varying DEFAULT 'g',
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT nutrition_database_pkey PRIMARY KEY (id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_nutrition_database_category ON public.nutrition_database(category);
CREATE INDEX IF NOT EXISTS idx_nutrition_database_name ON public.nutrition_database(name);
