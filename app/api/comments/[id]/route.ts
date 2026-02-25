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
        const commentId = resolvedParams.id;

        // Next.js Route handlers in 15.0.0 require params to be treated as a Promise.  We don't need params here, so I'm omitting it and getting postId from the query params if needed, or just revalidating from the DB if really needed. Wait, deleteComment needs postId for revalidatePath. Let's pass it in search params or just rely on client refresh. Let's pass it via body or search params. Using body in DELETE is allowed but non-standard. URL search params is better.
        const { searchParams } = new URL(request.url);
        const postId = searchParams.get('postId');

        if (!postId) {
            return NextResponse.json({ error: 'postId query parameter is required' }, { status: 400 });
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (error) {
            console.error('Error deleting comment:', error);
            return NextResponse.json({ error: '댓글 삭제에 실패했습니다.' }, { status: 500 });
        }

        revalidatePath(`/posts/${postId}`);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
