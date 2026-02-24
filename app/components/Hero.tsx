import Link from 'next/link';

interface HeroProps {
    user: any;
}

export default function Hero({ user }: HeroProps) {
    return (
        <section className="py-20 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4">
                개발 블로그
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
                웹 개발, 최신 기술 트렌드, 그리고 다양한 인사이트를 공유하는 공간입니다.
            </p>

            {user && (
                <Link
                    href="/write"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:-translate-y-0.5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    새 글 작성하기
                </Link>
            )}
        </section>
    );
}
