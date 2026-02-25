import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const postId = params.id;

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        // Check if like exists
        const { data: existingLike } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();

        if (existingLike) {
            // Unlike
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('id', existingLike.id);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        } else {
            // Like
            const { error } = await supabase
                .from('likes')
                .insert([{ post_id: postId, user_id: user.id }]);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }

        revalidatePath(`/posts/${postId}`);
        revalidatePath('/');
        return NextResponse.json({ success: true, isLiked: !existingLike }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
