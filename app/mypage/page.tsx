import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MessageSquare, Heart, FileText, ChevronRight, Bookmark } from 'lucide-react';

export const metadata = {
    title: '마이페이지 | Agora',
};

export default async function MyPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user's posts
    const { data: myPosts } = await supabase
        .from('posts_with_counts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch user's comments
    const { data: myComments } = await supabase
        .from('comments')
        .select(`
            *,
            posts (
                id,
                title
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch user's saved posts (bookmarks)
    const { data: bookmarkData } = await supabase
        .from('bookmarks')
        .select('post_id')
        .eq('user_id', user.id);

    let savedPosts: any[] = [];
    if (bookmarkData && bookmarkData.length > 0) {
        const postIds = bookmarkData.map(b => b.post_id);
        const { data: posts } = await supabase
            .from('posts_with_counts')
            .select('*')
            .in('id', postIds)
            .order('created_at', { ascending: false });
        savedPosts = posts || [];
    }

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
            <Header user={user} />

            <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">마이페이지</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">내가 작성한 글과 댓글을 확인하고 관리하세요.</p>
                </div>

                <div className="space-y-12">
                    {/* Posts Section */}
                    <section>
                        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-6">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <h2 className="text-xl font-bold">내가 쓴 글</h2>
                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
                                {myPosts?.length || 0}
                            </span>
                        </div>

                        {myPosts && myPosts.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {myPosts.map((post) => (
                                    <Link
                                        href={`/posts/${post.id}`}
                                        key={post.id}
                                        className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                                                    {post.title}
                                                </h3>
                                                <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                                                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Heart className="w-3.5 h-3.5" />
                                                        {post.likes_count || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                        {post.comments_count || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-xl text-zinc-500">
                                아직 작성한 글이 없습니다.
                            </div>
                        )}
                    </section>

                    {/* Saved Posts Section */}
                    <section>
                        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-6">
                            <Bookmark className="w-5 h-5 text-emerald-500" />
                            <h2 className="text-xl font-bold">저장한 글</h2>
                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
                                {savedPosts.length}
                            </span>
                        </div>

                        {savedPosts && savedPosts.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {savedPosts.map((post) => (
                                    <Link
                                        href={`/posts/${post.id}`}
                                        key={post.id}
                                        className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2">
                                                    {post.title}
                                                </h3>
                                                <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                                                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Heart className="w-3.5 h-3.5" />
                                                        {post.likes_count || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                        {post.comments_count || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-xl text-zinc-500">
                                저장한 글이 없습니다.
                            </div>
                        )}
                    </section>

                    {/* Comments Section */}
                    <section>
                        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-6">
                            <MessageSquare className="w-5 h-5 text-violet-500" />
                            <h2 className="text-xl font-bold">내가 쓴 댓글</h2>
                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
                                {myComments?.length || 0}
                            </span>
                        </div>

                        {myComments && myComments.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {myComments.map((comment) => (
                                    <Link
                                        href={`/posts/${comment.post_id}`}
                                        key={comment.id}
                                        className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-violet-500 dark:hover:border-violet-500 transition-colors"
                                    >
                                        <div className="mt-1 flex-1 min-w-0">
                                            <p className="text-sm text-zinc-800 dark:text-zinc-200 line-clamp-2 mb-3 leading-relaxed">
                                                {comment.content}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-zinc-500 flex items-center gap-2 truncate">
                                                    <span className="font-medium px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 truncate max-w-[200px] sm:max-w-xs">
                                                        {comment.posts?.title || '원문이 삭제됨'}
                                                    </span>
                                                    <span>
                                                        · {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
                                                    </span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-violet-500 transition-colors shrink-0 ml-4" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-xl text-zinc-500">
                                아직 작성한 댓글이 없습니다.
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
