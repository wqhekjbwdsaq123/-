# 📝 Next.js 블로그

[![배포 사이트](https://img.shields.io/badge/🚀_라이브_데모-바로가기-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://my-blog-seven-gold.vercel.app/)

개인 블로그입니다.  

---

## 🛠 기술 스택

| 역할            | 기술                                                             |
| --------------- | ---------------------------------------------------------------- |
| 프레임워크      | [Next.js 16](https://nextjs.org) (App Router)                    |
| 언어            | TypeScript                                                       |
| 스타일          | Tailwind CSS v4                                                  |
| 데이터베이스    | [Supabase](https://supabase.com) (PostgreSQL)                    |
| 인증            | Supabase Auth (이메일)                                           |
| 마크다운 에디터 | [@uiw/react-md-editor](https://github.com/uiwjs/react-md-editor) |
| 마크다운 렌더링 | react-markdown + remark-gfm                                      |
| 아이콘          | [Lucide React](https://lucide.dev)                               |
| 날짜 처리       | date-fns                                                         |
| 토스트 알림     | [Sonner](https://sonner.emilkowal.ski)                           |
| 배포            | [Vercel](https://vercel.com)                                     |

---

## 📁 프로젝트 구조

```
blog/
├── app/                    # Next.js App Router 페이지 & API
│   ├── page.tsx            # 홈 (글 목록)
│   ├── posts/[id]/         # 글 상세 페이지
│   ├── write/              # 글 작성 페이지
│   ├── login/              # 로그인 페이지
│   ├── api/                # REST API 라우트
│   └── actions/            # 서버 액션
├── utils/
│   └── supabase/           # Supabase 클라이언트 설정
├── supabase/
│   ├── migrations/         # DB 마이그레이션 SQL
│   └── seed.sql            # 초기 데이터
└── public/                 # 정적 파일
```

---

## ✨ 주요 기능

- **글 작성 / 수정 / 삭제** — 마크다운 에디터로 글 작성, 이미지 업로드 지원
- **카테고리 분류** — 카테고리별 글 필터링
- **좋아요 & 댓글** — 로그인한 사용자만 좋아요 및 댓글 작성 가능
- **이메일 인증** — Supabase Auth 기반 회원가입 / 로그인
- **다크 모드** — next-themes를 이용한 라이트/다크 전환

---

## 🚀 로컬 실행 방법

### 1단계 — 패키지 설치

```bash
npm install
```

### 2단계 — 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 채워넣으세요.

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

> Supabase 대시보드 → **Settings → API** 탭에서 값을 확인할 수 있습니다.

### 3단계 — DB 마이그레이션 실행

Supabase 대시보드의 **SQL Editor**에서 `supabase/migrations/` 폴더 안의 파일들과  
`supabase/seed.sql`을 순서대로 실행합니다.

### 4단계 — 개발 서버 시작

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열면 됩니다.

---

## 📦 주요 스크립트

| 명령어          | 설명                       |
| --------------- | -------------------------- |
| `npm run dev`   | 개발 서버 실행 (핫 리로드) |
| `npm run build` | 프로덕션 빌드              |
| `npm run start` | 프로덕션 서버 실행         |
| `npm run lint`  | ESLint 코드 검사           |

---

## ☁️ Vercel 배포 방법

1. [Vercel](https://vercel.com)에 로그인 후 이 저장소를 import 합니다.
2. **Environment Variables** 항목에 위 `.env.local` 값들을 입력합니다.
3. **Deploy** 버튼을 누르면 자동으로 빌드 및 배포됩니다.

> 자세한 내용: [Next.js 배포 공식 문서](https://nextjs.org/docs/app/building-your-application/deploying)
