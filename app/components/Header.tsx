import Link from 'next/link';
import SignOutButton from './SignOutButton';

export default function Header({ user }: { user: any }) {
    return (
        <header className="border-b border-zinc-200 dark:border-zinc-800">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold tracking-tight">
                    Blog
                </Link>
                <nav className="flex items-center gap-3">
                    {user && (
                        <Link
                            href="/write"
                            className="text-sm font-medium px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors flex items-center gap-1.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            새 글 작성하기
                        </Link>
                    )}
                    {user ? (
                        <>
                            <SignOutButton />
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login?mode=signup"
                                className="text-sm font-medium px-4 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                회원가입
                            </Link>
                            <Link
                                href="/login"
                                className="text-sm font-medium px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                            >
                                로그인
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
