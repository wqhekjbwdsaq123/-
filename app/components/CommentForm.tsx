'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface CommentFormProps {
    postId: string;
    parentId?: string;
    onSuccess?: () => void;
}

export default function CommentForm({ postId, parentId, onSuccess }: CommentFormProps) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId,
                    content,
                    parentId,
                }),
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                setError(result.error || '댓글 작성 중 오류가 발생했습니다.');
            } else {
                setContent('');
                if (onSuccess) onSuccess();
                window.location.reload();
            }
        } catch (err) {
            setError('댓글 작성 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={parentId ? "답글을 남겨보세요..." : "댓글을 남겨보세요..."}
                    disabled={isSubmitting}
                    className="w-full min-h-[100px] p-4 pb-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="absolute bottom-3 right-3 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </form>
    );
}
