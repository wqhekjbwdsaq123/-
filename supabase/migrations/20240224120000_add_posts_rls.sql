-- Add author_id to public.posts
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create policy to allow authenticated users to insert posts
CREATE POLICY "Allow authenticated users to create posts" ON public.posts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

-- Create policy to allow authors to update their own posts
CREATE POLICY "Allow authors to update their own posts" ON public.posts
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- Create policy to allow authors to delete their own posts
CREATE POLICY "Allow authors to delete their own posts" ON public.posts
    FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);
