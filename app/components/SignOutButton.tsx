'use client';

import { useRouter } from 'next/navigation';
import { signOut } from '@/app/actions';

export default function SignOutButton() {
    const router = useRouter();
    const handleSignOut = async () => {
        await signOut();
        router.refresh();
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
