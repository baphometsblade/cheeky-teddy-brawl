-- Create the terrible_teddies table
CREATE TABLE IF NOT EXISTS public.terrible_teddies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  special_move TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add an index for faster queries
CREATE INDEX IF NOT EXISTS idx_terrible_teddies_name ON public.terrible_teddies(name);

-- Enable Row Level Security (RLS)
ALTER TABLE public.terrible_teddies ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow read access to all authenticated users
CREATE POLICY "Allow read access for all authenticated users" ON public.terrible_teddies
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create a policy to allow insert/update/delete for authenticated users with specific role (e.g., 'admin')
CREATE POLICY "Allow full access for admins" ON public.terrible_teddies
  USING (auth.jwt() ->> 'role' = 'admin');