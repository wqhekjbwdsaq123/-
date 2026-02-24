'use client'

import { useState, useTransition } from 'react'
import { Mail, Key, Loader2, LogIn, UserPlus } from 'lucide-react'
import { login, signup } from '../actions'

interface AuthFormProps {
    initialMode?: 'login' | 'signup';
}

export function AuthForm({ initialMode = 'login' }: AuthFormProps) {
    const [isLogin, setIsLogin] = useState(initialMode === 'login')
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    async function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            const action = isLogin ? login : signup
            const result = await action(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 dark:bg-zinc-950 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white dark:bg-zinc-900 p-8 shadow-xl ring-1 ring-gray-900/5 dark:ring-white/10">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {isLogin ? '환영합니다' : '계정 만들기'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {isLogin ? '계정에 로그인하여 계속하세요' : '새로운 계정을 생성하여 시작하세요'}
                    </p>
                </div>

                <form action={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div className="relative">
                            <label htmlFor="email" className="sr-only">이메일 주소</label>
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-lg border-0 py-3 pl-10 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-zinc-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-transparent transition-all duration-200"
                                placeholder="이메일 주소"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">비밀번호</label>
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Key className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full rounded-lg border-0 py-3 pl-10 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-zinc-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-transparent transition-all duration-200"
                                placeholder="비밀번호"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                {isPending ? (
                                    <Loader2 className="h-5 w-5 text-blue-300 animate-spin" aria-hidden="true" />
                                ) : isLogin ? (
                                    <LogIn className="h-5 w-5 text-blue-300 group-hover:text-blue-200 transition-colors" aria-hidden="true" />
                                ) : (
                                    <UserPlus className="h-5 w-5 text-blue-300 group-hover:text-blue-200 transition-colors" aria-hidden="true" />
                                )}
                            </span>
                            {isPending ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-zinc-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white dark:bg-zinc-900 px-2 text-gray-500">
                                {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center space-x-4">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin)
                                setError(null)
                            }}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                            {isLogin ? '새로운 계정 만들기' : '기존 계정으로 로그인하기'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
