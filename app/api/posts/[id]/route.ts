import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function DELETE(
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
