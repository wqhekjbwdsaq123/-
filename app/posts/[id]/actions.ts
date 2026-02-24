'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleLike(postId: string) {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return { error: '로그인이 필요합니다.' };
    }

    // Check if like exists
    const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

    if (existingLike) {
        // Unlike: delete the row
        const { error } = await supabase
            .from('likes')
            .delete()
            .eq('id', existingLike.id);

        if (error) return { error: error.message };
    } else {
        // Like: insert a new row
        const { error } = await supabase
            .from('likes')
            .insert([{ post_id: postId, user_id: user.id }]);

        if (error) return { error: error.message };
    }

    revalidatePath(`/posts/${postId}`);
    revalidatePath('/'); // Need to revalidate if likes are shown on home
    return { success: true };
}
