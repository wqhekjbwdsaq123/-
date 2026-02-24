"use server";

import { createClient } from '@/utils/supabase/server';

export async function searchPosts(query: string) {
    if (!query || query.trim() === '') {
        return [];
    }

    const supabase = await createClient();

    // Using ilike to search in titles or content.
    const { data, error } = await supabase
        .from('posts')
        .select('id, title, created_at, category_id, categories(name)')
        .ilike('title', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error searching posts:", error);
        return [];
    }

    return data || [];
}
