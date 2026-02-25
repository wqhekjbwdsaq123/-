import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const commentId = params.id;

        const body = await request.json();
        const { postId } = body;

        if (!postId) {
            return NextResponse.json({ error: 'postId is required in body' }, { status: 400 });
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        // Check if like exists
        const { data: existingLike } = await supabase
            .from('comment_likes')
            .select('id')
            .eq('comment_id', commentId)
            .eq('user_id', user.id)
            .single();

        if (existingLike) {
            // Unlike
            const { error } = await supabase
                .from('comment_likes')
                .delete()
                .eq('id', existingLike.id);

            if (error) {
                console.error('Error unliking comment:', error);
                return NextResponse.json({ error: '좋아요 취소에 실패했습니다.' }, { status: 500 });
            }
        } else {
            // Like
            const { error } = await supabase
                .from('comment_likes')
                .insert({
                    comment_id: commentId,
                    user_id: user.id
                });

            if (error) {
                console.error('Error liking comment:', error);
                return NextResponse.json({ error: '좋아요에 실패했습니다.' }, { status: 500 });
            }
        }

        revalidatePath(`/posts/${postId}`);
        return NextResponse.json({ success: true, isLiked: !existingLike }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
