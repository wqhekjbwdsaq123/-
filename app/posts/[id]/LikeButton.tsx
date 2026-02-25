'use client';

import { useOptimistic, useTransition, useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleLike } from './actions';
import { toast } from 'sonner';

interface LikeButtonProps {
    postId: string;
    initialIsLiked: boolean;
    initialLikesCount: number;
    isLoggedIn: boolean;
}

export default function LikeButton({ postId, initialIsLiked, initialLikesCount, isLoggedIn }: LikeButtonProps) {
    const [isPending, startTransition] = useTransition();

    // We maintain this state in case we need to recover from an error
    const [optimisticState, addOptimisticState] = useOptimistic(
        { isLiked: initialIsLiked, count: initialLikesCount },
        (state, newIsLiked: boolean) => ({
            isLiked: newIsLiked,
            count: state.count + (newIsLiked ? 1 : -1)
        })
    );

    const handleLikeToggle = async () => {
        if (!isLoggedIn) {
            toast.error('로그인이 필요합니다.');
            return;
        }

        const newIsLikedState = !optimisticState.isLiked;

        startTransition(async () => {
            // 1. Optimistically update the UI
            addOptimisticState(newIsLikedState);

            try {
                // 2. Perform the server action
                const response = await fetch(`/api/posts/${postId}/like`, {
                    method: 'POST',
                });
                const result = await response.json();

                // 3. Handle errors (UI will automatically revert when revalidated, or we can manually trigger a toast)
                if (!response.ok || result?.error) {
                    toast.error(result?.error || '오류가 발생했습니다.');
                    // Revert is automatic normally due to revalidation failure, but we could add manual reverting here if needed
                }
            } catch (error) {
                toast.error('오류가 발생했습니다.');
            }
        });
    };

    return (
        <button
            onClick={handleLikeToggle}
            disabled={isPending}
            className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all
                ${optimisticState.isLiked
                    ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-950/30 dark:border-red-500/50 dark:text-red-400'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }
            `}
            title={optimisticState.isLiked ? '좋아요 취소' : '좋아요'}
        >
            <Heart
                className={`w-4 h-4 ${optimisticState.isLiked ? 'fill-current' : ''}`}
            />
            <span className="text-sm font-medium">{optimisticState.count}</span>
        </button>
    );
}
