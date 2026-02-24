-- Set up Storage for Images
insert into storage.buckets (id, name, public) 
values ('blog-images', 'blog-images', true) 
on conflict (id) do nothing;

create policy "Images are publicly accessible."
on storage.objects for select
to public
using ( bucket_id = 'blog-images' );

create policy "Authenticated users can upload images."
on storage.objects for insert
to authenticated
with check ( bucket_id = 'blog-images' );
