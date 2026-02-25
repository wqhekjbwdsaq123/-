import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: '이메일과 비밀번호를 모두 입력해주세요.' }, { status: 400 });
        }

        const supabase = await createClient();

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        revalidatePath('/', 'layout');
        return NextResponse.json({ success: true, user: data.user }, { status: 200 });

    } catch (err: any) {
        console.error('Signup error:', err);
        return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
    }
}
