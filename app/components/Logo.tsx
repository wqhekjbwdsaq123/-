export default function Logo() {
    return (
        <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
                A
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                Agora
            </span>
        </div>
    );
}
