import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, slug } = body;

        if (!name?.trim() || !slug?.trim()) {
            return NextResponse.json({ error: '카테고리 이름과 슬러그를 입력해주세요.' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
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
                return NextResponse.json({ error: '이미 존재하는 카테고리 이름이나 슬러그입니다.' }, { status: 409 });
            }

            return NextResponse.json({ error: '카테고리 생성에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, category: data }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
