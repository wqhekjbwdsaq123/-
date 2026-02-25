import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageSquare } from 'lucide-react';
import BookmarkButton from './BookmarkButton';

interface Post {
    id: string;
    title: string;
    excerpt: string;
    category_name?: string;
    image_url: string | null;
    created_at: string;
    likes_count?: number;
    comments_count?: number;
    isBookmarked?: boolean;
}

export default function PostCard({ post, isLoggedIn = false }: { post: Post, isLoggedIn?: boolean }) {
    const formattedDate = new Date(post.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const likesCount = post.likes_count || 0;
    const commentsCount = post.comments_count || 0;

    return (
        <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] text-left group relative">
            <Link href={`/posts/${post.id}`} className="flex flex-col h-full">
                {/* Thumbnail - only shown if image_url exists */}
                {post.image_url ? (
                    <div className="relative w-full flex-1 min-h-[40%]">
                        <Image
                            src={post.image_url}
                            alt={post.title}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                ) : (
                    <div className="w-full flex-1 min-h-[40%] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                <div className="p-4 flex flex-col flex-1 shrink-0 bg-white dark:bg-zinc-900 z-10">
                    <div className="mb-2 w-full">
                        <span className="inline-flex items-center rounded-sm bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/20 whitespace-nowrap max-w-full truncate uppercase tracking-wider">
                            {post.category_name || 'All'}
                        </span>
                    </div>
                    <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white mb-1.5 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                        {post.title}
                    </h2>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 break-words mb-2 flex-1 leading-relaxed">
                        {post.excerpt}
                    </p>
                    <div className="mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                            {formattedDate}
                        </span>
                        <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-500">
                            <div className="flex items-center gap-1">
                                <Heart className="w-3.5 h-3.5" />
                                <span className="text-xs">{likesCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span className="text-xs">{commentsCount}</span>
                            </div>
                            <div className="z-10 relative ml-1 pl-3 border-l border-zinc-200 dark:border-zinc-800 flex items-center">
                                <BookmarkButton
                                    postId={post.id}
                                    initialIsBookmarked={post.isBookmarked || false}
                                    isLoggedIn={isLoggedIn}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
}
