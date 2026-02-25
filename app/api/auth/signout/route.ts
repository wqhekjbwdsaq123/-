import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST() {
    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/');
        return NextResponse.json({ success: true }, { status: 200 });

    } catch (err: any) {
        console.error('Signout error:', err);
        return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
    }
}
