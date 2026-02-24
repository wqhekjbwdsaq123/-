export default function Footer() {
    return (
        <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 mt-auto">
            <div className="max-w-5xl mx-auto px-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                &copy; {new Date().getFullYear()} 개발 블로그. All rights reserved.
            </div>
        </footer>
    );
}
