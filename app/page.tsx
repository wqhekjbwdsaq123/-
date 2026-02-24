import Header from './components/Header';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import PostCard from './components/PostCard';
import Pagination from './components/Pagination';
import Footer from './components/Footer';
import { createClient } from '@/utils/supabase/server';

const POSTS_PER_PAGE = 6;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const resolvedSearchParams = await searchParams;
  const activeCategory = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : 'All';
  const pageStr = typeof resolvedSearchParams.page === 'string' ? resolvedSearchParams.page : '1';
  const currentPage = parseInt(pageStr, 10) || 1;

  // Fetch distinct categories for the filter
  const { data: allPosts } = await supabase
    .from('posts')
    .select('category');

  let uniqueCategories: string[] = [];
  if (allPosts) {
    uniqueCategories = Array.from(new Set(allPosts.map((p) => p.category)));
  }
  const categories = ['All', ...uniqueCategories];

  // Base query
  let query = supabase.from('posts').select('*', { count: 'exact' });

  // Apply category filter
  if (activeCategory !== 'All') {
    query = query.eq('category', activeCategory);
  }

  // Apply pagination
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;
  query = query.range(from, to).order('created_at', { ascending: false });

  const { data: posts, count, error } = await query;
  const totalPosts = count || 0;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
      <Header user={user} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 flex flex-col pt-8 pb-16">
        <Hero user={user} />

        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
        />

        {posts && posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </>
        ) : (
          <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">
            게시글이 없습니다.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
