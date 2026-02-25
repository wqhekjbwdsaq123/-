import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file || file.size === 0) {
            return NextResponse.json({ error: '파일이 제공되지 않았습니다.' }, { status: 400 });
        }

        // 파일 크기 제한: 10MB (10 * 1024 * 1024 바이트)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: '파일 크기가 10MB를 초과합니다.' }, { status: 400 });
        }

        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: '이미지를 업로드하려면 로그인이 필요합니다.' }, { status: 401 });
        }

        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // 서버 사이드 업로드를 위해 File을 ArrayBuffer로 변환
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from('blog-images')
            .upload(filePath, buffer, {
                contentType: file.type || 'image/jpeg',
                upsert: false
            });

        if (uploadError) {
            console.error('[uploadImage] Supabase 스토리지 오류:', uploadError);
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        const { data: publicUrlData } = supabase.storage
            .from('blog-images')
            .getPublicUrl(filePath);

        return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 201 });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
    }
}
