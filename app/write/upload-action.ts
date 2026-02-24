'use server';

import { createClient } from '@/utils/supabase/server';

export async function uploadImage(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
        return { error: 'No file provided' };
    }

    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return { error: 'You must be logged in to upload images.' };
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Convert File to ArrayBuffer for reliable server-side upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, buffer, {
            contentType: file.type || 'image/jpeg',
            upsert: false
        });

    if (uploadError) {
        console.error('[uploadImage] Supabase storage error:', uploadError);
        return { error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl };
}
