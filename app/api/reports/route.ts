import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { post_id, comment_id, reason } = body;

        // Either post_id or comment_id must be provided
        if (!post_id && !comment_id) {
            return NextResponse.json({ error: 'post_id 또는 comment_id가 필요합니다.' }, { status: 400 });
        }

        if (!reason || reason.trim() === '') {
            return NextResponse.json({ error: '신고 사유가 필요합니다.' }, { status: 400 });
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const { error } = await supabase
            .from('reports')
            .insert({
                reporter_id: user.id,
                post_id: post_id || null,
                comment_id: comment_id || null,
                reason: reason.trim()
            });

        if (error) {
            console.error('Error creating report:', error);
            return NextResponse.json({ error: '신고 접수에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
