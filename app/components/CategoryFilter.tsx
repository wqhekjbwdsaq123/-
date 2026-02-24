'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface CategoryFilterProps {
    categories: string[];
    activeCategory: string;
    activeSort: string;
}

export default function CategoryFilter({
    categories,
    activeCategory,
    activeSort
}: CategoryFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown component when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleSelectSort = (sort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (sort === 'latest') {
            params.delete('sort');
        } else {
            params.set('sort', sort);
        }
        params.delete('page'); // Reset page when sort changes
        params.delete('page'); // Reset page when sort changes
        router.push(`/?${params.toString()}`);
    };

    const sortOptions = [
        { value: 'latest', label: '최신순' },
        { value: 'likes', label: '좋아요순' },
        { value: 'comments', label: '댓글순' },
    ];
    const activeSortLabel = sortOptions.find(opt => opt.value === activeSort)?.label || '최신순';

    return (
        <div className="flex flex-col gap-4 mb-8">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
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

            {/* Custom Animated Sort Dropdown */}
            <div className="flex justify-end relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 text-sm font-medium rounded-full px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900/50 dark:focus:ring-zinc-100/50"
                >
                    {activeSortLabel}
                    <svg className={`fill-current h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                </button>

                {/* Dropdown Menu Content */}
                <div
                    className={`absolute right-0 top-full mt-2 w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-200 origin-top-right z-10 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                        }`}
                >
                    <div className="py-1">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    handleSelectSort(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${activeSort === option.value
                                        ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
