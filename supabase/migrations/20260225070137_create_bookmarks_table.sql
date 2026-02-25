-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own bookmarks
CREATE POLICY "Users can read their own bookmarks" 
ON public.bookmarks 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their own bookmarks
CREATE POLICY "Authenticated users can create bookmarks" 
ON public.bookmarks 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can delete their own bookmarks
CREATE POLICY "Authenticated users can delete their own bookmarks" 
ON public.bookmarks 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
