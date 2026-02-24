import { AuthForm } from './components/AuthForm'

export const metadata = {
    title: '로그인 및 회원가입',
    description: '계정 인증 허브입니다.',
}

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ mode?: string }>
}) {
    const resolved = await searchParams;
    const initialMode = resolved.mode === 'signup' ? 'signup' : 'login';
    return <AuthForm initialMode={initialMode} />
}
