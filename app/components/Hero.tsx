import Link from 'next/link';
import { Search } from 'lucide-react';

interface HeroProps {
    user: any;
}

export default function Hero({ user }: HeroProps) {
    return (
        <section className="py-20 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl sm:leading-tight font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6">
                개발의{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-500">
                    최신 트렌드
                </span>
                를 만나보세요
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 px-4 sm:px-0">
                웹 개발과 아키텍처, 그리고 다양한 기술 인사이트를 나눕니다.
            </p>

            <div className="relative max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                    placeholder="주제,코드,작성자 검색..."
                />
            </div>
        </section>
    );
}
