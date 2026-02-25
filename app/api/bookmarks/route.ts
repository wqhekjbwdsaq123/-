import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { post_id } = await request.json();

        if (!post_id) {
            return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if bookmark exists
        const { data: existingBookmark, error: fetchError } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', post_id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching bookmark:', fetchError);
            return NextResponse.json({ error: 'Failed to verify bookmark status' }, { status: 500 });
        }

        if (existingBookmark) {
            // Delete bookmark
            const { error: deleteError } = await supabase
                .from('bookmarks')
                .delete()
                .eq('id', existingBookmark.id);

            if (deleteError) {
                console.error('Error deleting bookmark:', deleteError);
                return NextResponse.json({ error: 'Failed to remove bookmark' }, { status: 500 });
            }

            return NextResponse.json({ isBookmarked: false });
        } else {
            // Create bookmark
            const { error: insertError } = await supabase
                .from('bookmarks')
                .insert({ user_id: user.id, post_id });

            if (insertError) {
                console.error('Error creating bookmark:', insertError);
                return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
            }

            return NextResponse.json({ isBookmarked: true });
        }
    } catch (error) {
        console.error('Unexpected error in bookmark API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
