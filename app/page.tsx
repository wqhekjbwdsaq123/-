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
  const activeSort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'latest';
  const activeQuery = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';
  const pageStr = typeof resolvedSearchParams.page === 'string' ? resolvedSearchParams.page : '1';
  const currentPage = parseInt(pageStr, 10) || 1;

  // Fetch distinct categories for the filter
  const { data: allCategories } = await supabase
    .from('categories')
    .select('name');

  let uniqueCategories: string[] = [];
  if (allCategories) {
    uniqueCategories = allCategories.map((c: any) => c.name);
  }
  const categories = ['All', ...uniqueCategories];

  // Base query: fetch from the view that has counts pre-aggregated
  let query = supabase.from('posts_with_counts').select('*', { count: 'exact' });

  // Apply category filter
  if (activeCategory !== 'All') {
    query = query.eq('category_name', activeCategory);
  }

  // Apply search query filter
  if (activeQuery) {
    query = query.ilike('title', `%${activeQuery}%`);
  }

  // Apply pagination
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;
  query = query.range(from, to);

  // Apply sorting
  if (activeSort === 'likes') {
    query = query.order('likes_count', { ascending: false }).order('created_at', { ascending: false });
  } else if (activeSort === 'comments') {
    query = query.order('comments_count', { ascending: false }).order('created_at', { ascending: false });
  } else {
    // Default: latest
    query = query.order('created_at', { ascending: false });
  }

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
          activeSort={activeSort}
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
