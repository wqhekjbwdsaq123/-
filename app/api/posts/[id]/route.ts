import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const resolvedParams = await params;
        const postId = resolvedParams.id;

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId)
            // Ensure the user deleting the post is the author (optional but recommended for security)
            .eq('author_id', user.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        revalidatePath('/');
        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const resolvedParams = await params;
        const postId = resolvedParams.id;

        const body = await request.json();
        const { title, content, category_id, image_url } = body;

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const { error } = await supabase
            .from('posts')
            .update({
                title,
                content,
                category_id,
                image_url,
                updated_at: new Date().toISOString()
            })
            .eq('id', postId)
            .eq('author_id', user.id);

        if (error) {
            console.error('Error updating post:', error);
            return NextResponse.json({ error: '게시물 수정에 실패했습니다.' }, { status: 500 });
        }

        revalidatePath('/');
        revalidatePath(`/posts/${postId}`);
        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
