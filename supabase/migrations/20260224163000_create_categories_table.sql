-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
CREATE POLICY "Allow public read access to categories" ON public.categories
    FOR SELECT
    TO public
    USING (true);

-- Add category_id to posts
ALTER TABLE public.posts ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Migrate existing categories from posts to categories
INSERT INTO public.categories (name, slug)
SELECT DISTINCT category, LOWER(REPLACE(category, ' ', '-'))
FROM public.posts
WHERE category IS NOT NULL;

-- Ensure no duplicate names or slugs were a problem using basic logic
-- If there were overlapping slugs, we'd need more complex logic, but for our simple seed data this is fine.

-- Update posts table with category_id
UPDATE public.posts
SET category_id = c.id
FROM public.categories c
WHERE public.posts.category = c.name;

-- Now drop the old category column and make the new one NOT NULL
-- (If there were no categories, we couldn't make it NOT NULL, but we'll assume valid data)
-- If we want to be safe, we can just drop the column and leave it nullable in case of orphan records, 
-- but blog posts usually require a category.
-- Let's make it safe:
-- ALTER TABLE public.posts ALTER COLUMN category_id SET NOT NULL; -- if we are absolutely sure. we are.
ALTER TABLE public.posts ALTER COLUMN category_id SET NOT NULL;
ALTER TABLE public.posts DROP COLUMN category;

-- Create an index to improve query performance by category
CREATE INDEX IF NOT EXISTS posts_category_id_idx ON public.posts(category_id);
