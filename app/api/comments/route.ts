import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const postId = searchParams.get('postId');

        if (!postId) {
            return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
        }

        const supabase = await createClient();

        const { data: comments, error } = await supabase
            .from('comments')
            .select(`
                id,
                content,
                created_at,
                user_id,
                parent_id,
                user:users!user_id(
                    email
                ),
                likes:comment_likes(user_id)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching comments:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(comments || [], { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { postId, content, parentId } = body;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        if (!content || !content.trim()) {
            return NextResponse.json({ error: '내용을 입력해주세요.' }, { status: 400 });
        }

        const { error } = await supabase
            .from('comments')
            .insert({
                post_id: postId,
                user_id: user.id,
                content: content.trim(),
                parent_id: parentId || null
            });

        if (error) {
            console.error('Error adding comment:', error);
            return NextResponse.json({ error: '댓글 작성에 실패했습니다.' }, { status: 500 });
        }

        revalidatePath(`/posts/${postId}`);
        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
