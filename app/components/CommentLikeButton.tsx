'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleCommentLike } from '../actions/comments';
import { useRouter } from 'next/navigation';

interface CommentLikeButtonProps {
    commentId: string;
    postId: string;
    initialIsLiked: boolean;
    initialLikesCount: number;
    isLoggedIn: boolean;
}

export default function CommentLikeButton({
    commentId,
    postId,
    initialIsLiked,
    initialLikesCount,
    isLoggedIn
}: CommentLikeButtonProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLike = async () => {
        if (!isLoggedIn) {
            alert('로그인이 필요합니다.');
            router.push('/login');
            return;
        }

        if (isLoading) return;

        // Optimistic UI update
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        setIsLoading(true);

        try {
            const result = await toggleCommentLike(commentId, postId);
            if (result.error) {
                // Revert on error
                setIsLiked(isLiked);
                setLikesCount(initialLikesCount);
                alert(result.error);
            } else if (result.isLiked !== undefined) {
                // Sync with server result just in case
                setIsLiked(result.isLiked);
            }
        } catch (error) {
            console.error('Like toggle failed:', error);
            // Revert on error
            setIsLiked(isLiked);
            setLikesCount(initialLikesCount);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center gap-1 text-xs font-medium transition-colors ${isLiked
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400'
                }`}
            title={isLiked ? "좋아요 취소" : "좋아요"}
        >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            {likesCount > 0 && <span>{likesCount}</span>}
        </button>
    );
}
