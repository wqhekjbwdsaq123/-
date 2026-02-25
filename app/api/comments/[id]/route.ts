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

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = profile?.role === 'admin';

        let query = supabase.from('comments').delete().eq('id', commentId);

        if (!isAdmin) {
            // Let RLS handle the post_author check, but since we are executing via API, we can explicitly add 
            // author_id = user.id or rely on RLS. Relying on RLS is safer. Let's just execute it.
            // Actually, the previous implementation relied solely on RLS and executed `.delete().eq('id', commentId)`.
        }

        const { data: deletedData, error } = await query.select();

        if (error || !deletedData || deletedData.length === 0) {
            console.error('Error deleting comment (blocked by RLS or not found):', error);
            return NextResponse.json({ error: '댓글 삭제 권한이 없거나 댓글이 존재하지 않습니다.' }, { status: 403 });
        }

        revalidatePath(`/posts/${postId}`);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
