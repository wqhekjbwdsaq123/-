-- Run this SQL in the Supabase Dashboard > SQL Editor to apply all missing changes.

-- 1. Create blog-images storage bucket (for image uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage: public read access for uploaded images
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Images are publicly accessible.' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Images are publicly accessible."
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'blog-images');
  END IF;
END $$;

-- 3. Storage: authenticated users can upload images
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload images.' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Authenticated users can upload images."
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'blog-images');
  END IF;
END $$;

-- 4. Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 5. Enable RLS on likes
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 6. Likes: public read
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read likes' AND tablename = 'likes') THEN
    CREATE POLICY "Anyone can read likes" ON public.likes FOR SELECT USING (true);
  END IF;
END $$;

-- 7. Likes: insert own
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can toggle their own likes' AND tablename = 'likes') THEN
    CREATE POLICY "Authenticated users can toggle their own likes" ON public.likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 8. Likes: delete own
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete their own likes' AND tablename = 'likes') THEN
    CREATE POLICY "Authenticated users can delete their own likes" ON public.likes FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;
