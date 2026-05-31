# features/auth

인증 도메인(로그인/회원가입/세션). LOGIN-FE-001(이메일 로그인)에서 생성.

## 구조

```
features/auth/
├── components/
│   ├── AuthCard.tsx    인증 화면 중앙 카드 컨테이너(DESIGN_SYSTEM 08 인증)
│   └── LoginForm.tsx   RHF + Zod 로그인 폼(Field×2 + Button), useMutation으로 제출
└── lib/
    └── safeRedirect.ts redirect 쿼리 정규화(오픈 리다이렉트 방어 — 앱 내부 상대경로만)
```

페이지 엔트리는 `src/routes/LoginPage.tsx`(AuthCard + LoginForm 조합, 성공 시 authStore 갱신 + redirect 이동).

## 인증 규칙 (auth.md)

- 토큰은 **httpOnly Cookie만** 사용한다. localStorage/sessionStorage에 토큰을 저장하지 않는다.
- ky 인스턴스(`src/lib/ky.ts`)가 `credentials: 'include'`로 쿠키를 자동 전송한다. Authorization 헤더를 직접 조립하지 않는다.
- 세션 스토어(`src/lib/store/useAuthStore.ts`)에는 토큰이 아닌 user/세션 상태만 보관한다.
- auth 관련 변경은 항상 **cross 흐름**이다.

## 데이터 흐름

- 폼 검증: `src/lib/schemas/auth.ts`의 `loginSchema`(RHF + zodResolver).
- 서버 호출: `src/services/auth.ts`의 `login()`. **Swagger 미완 동안 한시적으로 lib/ky 직접 호출**.
  `/api-sync` 후 `src/lib/api/` 생성물 조합으로 교체한다.
- mock: `src/mocks/handlers/auth.ts`가 `POST /api/auth/login`을 가로챈다(정상 자격증명 200, 그 외 401).

## 범위 밖(후속 티켓)

- Steam 소셜 로그인(LOGIN-FE-002), 자동 로그인(LOGIN-FE-005) — AuthCard에 자리표시만.
- 세션 복원(`GET /api/auth/me`)과 가드 `loading` 상태 — auth 인프라 티켓.
