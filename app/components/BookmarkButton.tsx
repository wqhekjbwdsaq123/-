'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
    postId: string;
    initialIsBookmarked: boolean;
    isLoggedIn: boolean;
}

export default function BookmarkButton({ postId, initialIsBookmarked, isLoggedIn }: BookmarkButtonProps) {
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
    const [isLoading, setIsLoading] = useState(false);

    const handleBookmark = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if wrapped in a Link
        e.stopPropagation();

        if (!isLoggedIn) {
            alert('로그인이 필요합니다.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/bookmarks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ post_id: postId }),
            });

            if (!response.ok) {
                throw new Error('북마크 처리에 실패했습니다.');
            }

            const data = await response.json();
            setIsBookmarked(data.isBookmarked);
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            alert('북마크 처리에 실패했습니다. 다시 시도해 주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleBookmark}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors flex items-center justify-center
                ${isBookmarked
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 scale-110'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}
                ${isLoading ? 'opacity-50 pointer-events-none' : ''}
                active:scale-95
            `}
            title={isBookmarked ? "저장 취소" : "저장하기"}
        >
            <Bookmark
                className={`w-5 h-5 transition-transform ${isBookmarked ? 'fill-current' : ''}`}
            />
        </button>
    );
}
