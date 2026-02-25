"use client";

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchPosts } from '@/app/actions/search';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const qParam = searchParams.get('q') || '';

    // Sync URL parameter to the input when page loads or parameter changes via back navigation
    useEffect(() => {
        setQuery(qParam);
    }, [qParam]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim().length === 0) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/posts/search?q=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    setResults(data);
                } else {
                    setResults([]);
                }
            } catch (error) {
                console.error("Failed to search:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchResults();
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setIsFocused(false);
            // Navigate to main page with search query
            if (query.trim()) {
                router.push(`/?q=${encodeURIComponent(query.trim())}`);
            } else {
                router.push(`/`);
            }
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto z-50">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={handleKeyDown}
                    className="block w-full pl-11 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                    placeholder="주제,코드,작성자 검색..."
                />
            </div>

            {/* Autocomplete Dropdown */}
            {isFocused && query.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg overflow-hidden flex flex-col max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-sm text-zinc-500 text-center">검색 중...</div>
                    ) : results.length > 0 ? (
                        <ul className="py-2">
                            {results.map((post) => (
                                <li key={post.id}>
                                    <Link
                                        href={`/posts/${post.id}`}
                                        className="block px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
                                        onClick={() => setIsFocused(false)}
                                    >
                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium truncate">
                                            {post.title}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-sm text-zinc-500 text-center">검색 결과가 없습니다.</div>
                    )}
                </div>
            )}
        </div>
    );
}
