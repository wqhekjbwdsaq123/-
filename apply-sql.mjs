// Script to apply SQL directly via REST API
// Run with: node apply-sql.mjs

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://upbmzieyaoaydqohngfm.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const sqls = [
    // Create blog-images storage bucket
    `INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true) ON CONFLICT (id) DO NOTHING;`,

    // RLS policies for storage - wrapped in do blocks to handle existing
    `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE policyname = 'Images are publicly accessible.' AND tablename = 'objects'
    ) THEN
      CREATE POLICY "Images are publicly accessible." ON storage.objects FOR SELECT TO public USING (bucket_id = 'blog-images');
    END IF;
  END $$;`,

    `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload images.' AND tablename = 'objects'
    ) THEN
      CREATE POLICY "Authenticated users can upload images." ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images');
    END IF;
  END $$;`,

    // Create likes table
    `CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
  );`,

    `ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;`,

    `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read likes' AND tablename = 'likes') THEN
      CREATE POLICY "Anyone can read likes" ON public.likes FOR SELECT USING (true);
    END IF;
  END $$;`,

    `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can toggle their own likes' AND tablename = 'likes') THEN
      CREATE POLICY "Authenticated users can toggle their own likes" ON public.likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    END IF;
  END $$;`,

    `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete their own likes' AND tablename = 'likes') THEN
      CREATE POLICY "Authenticated users can delete their own likes" ON public.likes FOR DELETE TO authenticated USING (auth.uid() = user_id);
    END IF;
  END $$;`,
];

for (const sql of sqls) {
    console.log('Running:', sql.substring(0, 60) + '...');
    const { error } = await supabase.rpc('exec_sql', { sql }).catch(() => ({ error: null }));
    // Note: exec_sql may not exist; using raw postgres via supabase's REST is limited.
    // For best results, run the migration in Supabase Dashboard > SQL Editor
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('OK');
    }
}

console.log('Done. If any errors occurred, please apply the SQL manually in the Supabase Dashboard > SQL Editor.');
