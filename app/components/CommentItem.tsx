'use client';

import { useState } from 'react';
import { MessageSquareReply, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import CommentLikeButton from './CommentLikeButton';
import CommentForm from './CommentForm';

export interface CommentType {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    parent_id?: string | null;
    user: { email: string } | { email: string }[] | null;
    likes?: { user_id: string }[];
    children?: CommentType[];
}

interface CommentProps {
    comment: CommentType;
    postId: string;
    currentUserId: string | undefined;
    postAuthorId: string | undefined;
    depth?: number;
}

export default function CommentItem({ comment, postId, currentUserId, postAuthorId, depth = 0 }: CommentProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReplying, setIsReplying] = useState(false);

    // Safety check - handle both single object and array formats from join
    const userEmail = comment.user
        ? (Array.isArray(comment.user) ? comment.user[0]?.email : comment.user.email)
        : 'Unknown User';

    // Get display name (part before @ in email)
    const displayName = userEmail?.split('@')[0] || 'User';

    const isCommentAuthorPostAuthor = comment.user_id === postAuthorId;
    const isCurrentUserPostAuthor = currentUserId === postAuthorId;

    // Can delete if: user is comment author OR current user is post author
    const canDelete = currentUserId === comment.user_id || isCurrentUserPostAuthor;

    const initialLikesCount = comment.likes?.length || 0;
    const initialIsLiked = currentUserId ? comment.likes?.some(like => like.user_id === currentUserId) || false : false;

    const handleDelete = async () => {
        if (!confirm('댓글을 삭제하시겠습니까?')) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/comments/${comment.id}`, {
                method: 'DELETE',
            });
            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.error || '삭제 실패');
            }
            window.location.reload();
        } catch (error) {
            console.error('Failed to delete comment:', error);
            setIsDeleting(false);
        }
    };

    return (
        <div className={`py-4 ${depth === 0 ? 'border-b border-zinc-100 dark:border-zinc-800/50' : 'mt-2'} last:border-0 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0 mt-1">
                    {displayName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center flex-wrap gap-2">
                            <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                                {displayName}
                            </span>
                            {isCommentAuthorPostAuthor && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                                    작성자
                                </span>
                            )}
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
                            </span>
                        </div>

                        {canDelete && (
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors shrink-0"
                                title="댓글 삭제"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed mb-3">
                        {comment.content}
                    </p>

                    <div className="flex items-center gap-4 mb-2">
                        <CommentLikeButton
                            commentId={comment.id}
                            postId={postId}
                            initialIsLiked={initialIsLiked}
                            initialLikesCount={initialLikesCount}
                            isLoggedIn={!!currentUserId}
                        />

                        {/* Only allow max 2 levels of nesting to avoid UI crunch */}
                        {depth < 2 && (
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                            >
                                <MessageSquareReply className="w-3.5 h-3.5" />
                                답글 달기
                            </button>
                        )}
                    </div>

                    {isReplying && currentUserId && (
                        <div className="mt-4 mb-6">
                            <CommentForm
                                postId={postId}
                                parentId={comment.id}
                                onSuccess={() => setIsReplying(false)}
                            />
                        </div>
                    )}
                    {isReplying && !currentUserId && (
                        <div className="mt-4 mb-6 text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            답글을 달려면 <a href="/login" className="text-blue-500 hover:underline">로그인</a>이 필요합니다.
                        </div>
                    )}

                    {/* Render child comments recursive */}
                    {comment.children && comment.children.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-zinc-100 dark:border-zinc-800 space-y-4">
                            {comment.children.map(child => (
                                <CommentItem
                                    key={child.id}
                                    comment={child}
                                    postId={postId}
                                    currentUserId={currentUserId}
                                    postAuthorId={postAuthorId}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
