import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, content, category_id, image_url } = body;

        if (!title || !content) {
            return NextResponse.json({ error: "제목과 내용은 필수 항목입니다." }, { status: 400 });
        }

        if (!category_id) {
            return NextResponse.json({ error: "카테고리를 선택해 주세요." }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "포스트를 발행하려면 로그인이 필요합니다." }, { status: 401 });
        }

        const excerpt = content.substring(0, 150) + (content.length > 150 ? "..." : "");

        const { data, error } = await supabase
            .from("posts")
            .insert([
                {
                    title,
                    content,
                    excerpt,
                    category_id,
                    image_url,
                    author_id: user.id
                },
            ])
            .select()
            .single();

        if (error) {
            console.error("포스트 발행 오류:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        revalidatePath("/");
        return NextResponse.json({ success: true, post: data }, { status: 201 });

    } catch (err: any) {
        console.error('Publish error:', err);
        return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
    }
}
