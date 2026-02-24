-- Create a view that aggregats likes and comments counts for easy sorting and pagination
CREATE OR REPLACE VIEW public.posts_with_counts AS
SELECT 
    p.id, 
    p.title, 
    p.content, 
    p.excerpt, 
    p.created_at, 
    p.author_id, 
    p.image_url, 
    p.category_id,
    c.name as "category_name",
    COALESCE(l.likes_count, 0) as likes_count,
    COALESCE(cm.comments_count, 0) as comments_count
FROM public.posts p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN (
    SELECT post_id, COUNT(*) as likes_count 
    FROM public.likes 
    GROUP BY post_id
) l ON p.id = l.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as comments_count 
    FROM public.comments 
    GROUP BY post_id
) cm ON p.id = cm.post_id;

-- Grant access to the view
GRANT SELECT ON public.posts_with_counts TO authenticated;
GRANT SELECT ON public.posts_with_counts TO anon;
