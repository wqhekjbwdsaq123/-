-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read comments
CREATE POLICY "Anyone can read comments" 
ON public.comments 
FOR SELECT 
USING (true);

-- Policy: Authenticated users can insert comments
CREATE POLICY "Authenticated users can create comments" 
ON public.comments 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can delete their own comments
CREATE POLICY "Authenticated users can delete their own comments" 
ON public.comments 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy: Post authors can delete any comment on their post
CREATE POLICY "Post authors can delete any comment on their post"
ON public.comments
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.posts
        WHERE posts.id = comments.post_id
        AND posts.author_id = auth.uid()
    )
);

-- Policy: Authenticated users can update their own comments
CREATE POLICY "Authenticated users can update their own comments" 
ON public.comments 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
