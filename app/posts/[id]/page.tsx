import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { createClient } from '@/utils/supabase/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PostActions from './PostActions';
import LikeButton from './LikeButton';
import CommentsSection from '@/app/components/CommentsSection';
import { getComments } from '@/app/actions/comments';

export default async function PostDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: post, error } = await supabase
        .from('posts')
        .select('*, categories!inner(name)')
        .eq('id', id)
        .single();

    // Fetch total likes
    const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', id);

    // Check if the current user liked the post
    let isLiked = false;
    if (user) {
        const { data: userLike } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', id)
            .eq('user_id', user.id)
            .single();
        isLiked = !!userLike;
    }

    // Fetch comments
    const comments = await getComments(id);

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
                <Header user={user} />
                <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-20 text-center">
                    <h1 className="text-2xl font-bold mb-4">게시글을 찾을 수 없습니다.</h1>
                    <Link
                        href="/"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        홈으로 돌아가기
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const formattedDate = new Date(post.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const isAuthor = user && user.id === post.author_id;

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
            <Header user={user} />

            <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 flex flex-col">
                {/* Back navigation */}
                <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    목록으로 돌아가기
                </Link>

                {/* Header section: Category & Title */}
                <div className="mb-8">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/20 mb-4">
                        {post.categories?.name}
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6 leading-tight">
                        {post.title}
                    </h1>
                </div>

                {/* Meta data row: Author, Date, Share */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-y border-zinc-200 dark:border-zinc-800 mb-10 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400">A</span>
                        </div>
                        <div>
                            <p className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-white">Author</p>
                            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">{formattedDate}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <LikeButton
                            postId={post.id}
                            initialIsLiked={isLiked}
                            initialLikesCount={likesCount || 0}
                            isLoggedIn={!!user}
                        />
                        <a
                            href="#comments"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>댓글 {comments.length || 0}개</span>
                        </a>
                        <PostActions postId={post.id} isAuthor={!!isAuthor} />
                    </div>
                </div>

                {/* Thumbnail */}
                {post.image_url && (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-12 border border-zinc-200 dark:border-zinc-800">
                        <Image
                            src={post.image_url}
                            alt={post.title}
                            fill
                            priority
                            sizes="(max-width: 896px) 100vw, 896px"
                            className="object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <article className="max-w-none text-base sm:text-lg text-zinc-800 dark:text-zinc-200">
                    {post.content ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h2: ({ node, ...props }) => <h2 className="text-2xl sm:text-3xl font-bold mt-12 mb-6 text-zinc-900 dark:text-white" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-xl sm:text-2xl font-bold mt-8 mb-4 text-zinc-900 dark:text-white" {...props} />,
                                p: ({ node, ...props }) => <p className="leading-loose mb-6" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-6 space-y-2" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-6 space-y-2" {...props} />,
                                li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-700 pl-5 py-1 italic text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-r-lg my-8" {...props} />,
                                a: ({ node, ...props }) => <a className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-4" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-semibold text-zinc-900 dark:text-white" {...props} />
                            }}
                        >
                            {post.content.replace(/\\n/g, '\n')}
                        </ReactMarkdown>
                    ) : (
                        <p className="text-zinc-500 dark:text-zinc-400 italic">내용이 없습니다.</p>
                    )}
                </article>

                {/* Comments Section */}
                <div id="comments">
                    <CommentsSection
                        postId={post.id}
                        comments={comments || []}
                        currentUserId={user?.id}
                        isPostAuthor={!!isAuthor}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
