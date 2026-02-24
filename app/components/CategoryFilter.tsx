'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface CategoryFilterProps {
    categories: string[];
    activeCategory: string;
}

export default function CategoryFilter({
    categories,
    activeCategory,
}: CategoryFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSelectCategory = (category: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (category === 'All') {
            params.delete('category');
        } else {
            params.set('category', category);
        }
        params.delete('page'); // Reset page when category changes
        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap gap-2 mb-8 justify-center sm:justify-start">
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => handleSelectCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                        }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}
