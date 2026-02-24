-- Create policy to allow authenticated users to create categories
CREATE POLICY "Allow authenticated users to create categories" 
ON public.categories
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
