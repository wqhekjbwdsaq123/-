import Link from 'next/link';
import SearchBar from './SearchBar';
import { Edit3 } from 'lucide-react';

interface HeroProps {
    user: any;
}

export default function Hero({ user }: HeroProps) {
    return (
        <section className="relative py-20 text-center">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none flex items-center justify-center">
                {/* Subtle Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

                {/* Floating Code Symbols */}
                <div className="absolute top-10 left-[10%] text-zinc-300/40 dark:text-zinc-700/40 text-4xl font-mono opacity-50 -rotate-12 blur-[1px]">{'< />'}</div>
                <div className="absolute top-32 right-[15%] text-zinc-300/40 dark:text-zinc-700/40 text-5xl font-mono opacity-50 rotate-12 blur-[1px]">{'{}'}</div>
                <div className="absolute bottom-16 left-[20%] text-zinc-300/40 dark:text-zinc-700/40 text-3xl font-mono opacity-50 -rotate-6 blur-[1px]">{'//'}</div>
                <div className="absolute bottom-24 right-[10%] text-zinc-300/40 dark:text-zinc-700/40 text-2xl font-mono opacity-40 rotate-6 blur-[1px]">{'() =>'}</div>
                <div className="absolute top-5 left-[30%] text-zinc-300/30 dark:text-zinc-700/30 text-xl font-mono opacity-30 rotate-45 blur-[2px]">{'const'}</div>
                <div className="absolute bottom-10 right-[30%] text-zinc-300/30 dark:text-zinc-700/30 text-xl font-mono opacity-30 -rotate-12 blur-[2px]">{'async'}</div>
            </div>

            <div className="relative z-50">
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

                <SearchBar />

                {user && (
                    <div className="mt-8 flex justify-center">
                        <Link
                            href="/write"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium hover:scale-105 transition-transform shadow-lg shadow-zinc-900/20 dark:shadow-white/20"
                        >
                            <Edit3 className="w-4 h-4" />
                            새 글 작성하기
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
