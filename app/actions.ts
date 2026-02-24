'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deletePost(postId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/');
    return { success: true };
}

export async function signOut() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/');
    return { success: true };
}
