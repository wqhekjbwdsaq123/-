-- Create a secure view for public user data
CREATE OR REPLACE VIEW public.users AS
SELECT 
    id,
    email
FROM auth.users;

-- Grant permissions to access the view
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- Update the comments view to use the new view (if necessary)
-- We'll adjust our query in Next.js to join against public.users instead of auth.users
