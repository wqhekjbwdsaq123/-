'use client';

import { useRouter } from 'next/navigation';

export default function SignOutButton() {
    const router = useRouter();
    const handleSignOut = async () => {
        try {
            await fetch('/api/auth/signout', { method: 'POST' });
            router.refresh();
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <button
            onClick={handleSignOut}
            className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
        >
            로그아웃
        </button>
    );
}
