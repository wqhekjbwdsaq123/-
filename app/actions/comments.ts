'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getComments(postId: string) {
    const supabase = await createClient();

    const { data: comments, error } = await supabase
        .from('comments')
        .select(`
            id,
            content,
            created_at,
            user_id,
            parent_id,
            user:users!user_id(
                email
            ),
            likes:comment_likes(user_id)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', error);
        return [];
    }

    return comments;
}

export async function addComment(postId: string, content: string, parentId?: string | null) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: '로그인이 필요합니다.' };
    }

    if (!content.trim()) {
        return { error: '내용을 입력해주세요.' };
    }

    const { error } = await supabase
        .from('comments')
        .insert({
            post_id: postId,
            user_id: user.id,
            content: content.trim(),
            parent_id: parentId || null
        });

    if (error) {
        console.error('Error adding comment:', error);
        return { error: '댓글 작성에 실패했습니다.' };
    }

    revalidatePath(`/posts/${postId}`);
    return { success: true };
}

export async function deleteComment(commentId: string, postId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: '로그인이 필요합니다.' };
    }

    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

    if (error) {
        console.error('Error deleting comment:', error);
        return { error: '댓글 삭제에 실패했습니다.' };
    }

    revalidatePath(`/posts/${postId}`);
    return { success: true };
}

export async function toggleCommentLike(commentId: string, postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: '로그인이 필요합니다.' };
    }

    // Check if like exists
    const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

    if (existingLike) {
        // Unlike
        const { error } = await supabase
            .from('comment_likes')
            .delete()
            .eq('id', existingLike.id);

        if (error) {
            console.error('Error unliking comment:', error);
            return { error: '좋아요 취소에 실패했습니다.' };
        }
    } else {
        // Like
        const { error } = await supabase
            .from('comment_likes')
            .insert({
                comment_id: commentId,
                user_id: user.id
            });

        if (error) {
            console.error('Error liking comment:', error);
            return { error: '좋아요에 실패했습니다.' };
        }
    }

    revalidatePath(`/posts/${postId}`);
    return { success: true, isLiked: !existingLike };
}
