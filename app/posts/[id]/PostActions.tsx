'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Share2, Twitter, Facebook, Link as LinkIcon } from 'lucide-react';
import { deletePost } from '@/app/actions';

interface PostActionsProps {
    postId: string;
    isAuthor: boolean;
}

export default function PostActions({ postId, isAuthor }: PostActionsProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleDeletePost = async () => {
        const confirmed = window.confirm("정말로 이 글을 삭제하시겠습니까?");
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            const { error } = await deletePost(postId);

            if (error) throw new Error(error);
            router.push('/');
        } catch (error: any) {
            console.error('Error deleting post:', error);
            alert(`글 삭제에 실패했습니다: ${error.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <div className="flex items-center gap-2">
            {isAuthor && (
                <button
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                    className="text-sm font-medium px-3 py-1.5 rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50 mr-4"
                >
                    {isDeleting ? "삭제 중..." : "삭제"}
                </button>
            )}
            <span className="text-sm font-medium mr-2 text-zinc-500 dark:text-zinc-400">공유하기</span>
            <button
                onClick={handleCopyLink}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white relative group"
                aria-label="링크 복사"
            >
                <LinkIcon className="w-5 h-5" />
                {copySuccess && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap dark:bg-zinc-800 dark:text-zinc-300">
                        복사됨
                    </span>
                )}
            </button>
            <button
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400 hover:text-[#1DA1F2]"
                aria-label="Twitter 공유"
            >
                <Twitter className="w-5 h-5" />
            </button>
            <button
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400 hover:text-[#1877F2]"
                aria-label="Facebook 공유"
            >
                <Facebook className="w-5 h-5" />
            </button>
        </div>
    );
}
