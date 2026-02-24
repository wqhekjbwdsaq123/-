-- Create the likes table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read likes
CREATE POLICY "Anyone can read likes" 
ON public.likes 
FOR SELECT 
USING (true);

-- Policy: Only authenticated users can insert likes
CREATE POLICY "Authenticated users can toggle their own likes" 
ON public.likes 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy: Only authenticated users can delete their own likes
CREATE POLICY "Authenticated users can delete their own likes" 
ON public.likes 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
