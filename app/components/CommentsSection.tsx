'use client';

import { useState } from 'react';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { MessageSquare } from 'lucide-react';

import { CommentType } from './CommentItem';

interface CommentsSectionProps {
    postId: string;
    comments: CommentType[];
    currentUserId?: string;
    isPostAuthor: boolean;
}

export default function CommentsSection({ postId, comments, currentUserId, isPostAuthor }: CommentsSectionProps) {
    // Build the comment tree
    const buildCommentTree = (flatComments: CommentType[]) => {
        const commentMap = new Map<string, CommentType>();
        const tree: CommentType[] = [];

        // First pass: create map of all comments and initialize children arrays
        flatComments.forEach(comment => {
            commentMap.set(comment.id, { ...comment, children: [] });
        });

        // Second pass: attach children to parents, or to root tree
        flatComments.forEach(comment => {
            const commentWithChildren = commentMap.get(comment.id)!;
            if (comment.parent_id && commentMap.has(comment.parent_id)) {
                // Attach to parent
                commentMap.get(comment.parent_id)!.children!.push(commentWithChildren);
            } else {
                // Top level comment
                tree.push(commentWithChildren);
            }
        });

        return tree;
    };

    const topLevelComments = buildCommentTree(comments || []);

    return (
        <section className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-8">
                <MessageSquare className="w-5 h-5 text-zinc-900 dark:text-white" />
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    댓글 <span className="text-blue-600 dark:text-blue-400 text-lg ml-1">{comments.length}</span>
                </h3>
            </div>

            {currentUserId ? (
                <CommentForm postId={postId} />
            ) : (
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center mb-10">
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">로그인하고 댓글을 남겨보세요.</p>
                    <a
                        href="/login"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        로그인하기
                    </a>
                </div>
            )}

            <div className="space-y-2">
                {topLevelComments.length > 0 ? (
                    topLevelComments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            postId={postId}
                            currentUserId={currentUserId}
                            postAuthorId={isPostAuthor ? currentUserId : undefined} // Pass postAuthorId directly. If current user is author, pass their ID.
                        />
                    ))
                ) : (
                    <div className="py-10 text-center text-zinc-500 dark:text-zinc-400 italic">
                        첫 번째 댓글을 남겨보세요!
                    </div>
                )}
            </div>
        </section>
    );
}
