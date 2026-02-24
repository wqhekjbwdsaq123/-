'use server';

import { createClient } from '@/utils/supabase/server';

export async function createCategory(name: string, slug: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: '로그인이 필요합니다.' };
    }

    if (!name.trim() || !slug.trim()) {
        return { error: '카테고리 이름과 슬러그를 입력해주세요.' };
    }

    const { data, error } = await supabase
        .from('categories')
        .insert({
            name: name.trim(),
            slug: slug.trim()
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating category:', error);

        // Handle unique constraint violation
        if (error.code === '23505') {
            return { error: '이미 존재하는 카테고리 이름이나 슬러그입니다.' };
        }

        return { error: '카테고리 생성에 실패했습니다.' };
    }

    return { success: true, category: data };
}
