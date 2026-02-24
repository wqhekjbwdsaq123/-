-- 1. Add parent_id to public.comments for nested replies
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

-- 2. Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- 3. Enable RLS on comment_likes
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read comment likes
CREATE POLICY "Anyone can read comment likes" 
ON public.comment_likes 
FOR SELECT 
USING (true);

-- Policy: Authenticated users can insert comment likes
CREATE POLICY "Authenticated users can toggle their own comment likes" 
ON public.comment_likes 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can delete their own comment likes
CREATE POLICY "Authenticated users can delete their own comment likes" 
ON public.comment_likes 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
