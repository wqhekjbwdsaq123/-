import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.trim() === '') {
            return NextResponse.json([], { status: 200 });
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('posts')
            .select('id, title, created_at, category_id, categories(name)')
            .ilike('title', `%${query}%`)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error("Error searching posts:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || [], { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
