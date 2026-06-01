# features/auth

인증 도메인(로그인/회원가입/세션). LOGIN-FE-001(이메일 로그인)에서 생성, LOGIN-FE-001b(Figma auth-modal 재구성)에서 보조 컴포넌트 추가.

## 구조

```
features/auth/
├── components/
│   ├── AuthCard.tsx       인증 모달 스타일 카드 컨테이너(Figma auth-modal 335:7434).
│   │                      슬롯: tabs(상단 세그먼트) / heading / subtitle / children
│   ├── AuthTabs.tsx       [로그인 | 회원가입] 세그먼트 토글(active 강조 + 비활성은 Link 이동)
│   ├── SteamButton.tsx    "Steam으로 계속하기" 비활성 자리 버튼(후속 LOGIN-FE-002, 동작 없음)
│   ├── PasswordInput.tsx  공유 Input + 👁 표시/숨김 토글 래퍼(forwardRef로 id/aria-*/ref forward)
│   └── LoginForm.tsx      RHF + Zod 로그인 폼(Field×2 + Button), useMutation으로 제출
└── lib/
    └── safeRedirect.ts    redirect 쿼리 정규화(오픈 리다이렉트 방어 — 앱 내부 상대경로만)
```

페이지 엔트리는 `src/routes/LoginPage.tsx`(AuthCard 슬롯에 AuthTabs/SteamButton/구분선/LoginForm 조립, 성공 시 authStore 갱신 + redirect 이동).

### 보조 컴포넌트 규칙 (LOGIN-FE-001b)

- **PasswordInput**: 공유 `Input`(primitive)을 무편집 재사용하기 위한 래퍼다. `Field`가 `cloneElement`로 주입하는 id/aria-*를 `{...props}`로 받아 안쪽 `Input`으로 forward하고, `type`만 password↔text로 토글한다. 비밀번호 `Field`의 children에는 `Input`이 아니라 `PasswordInput`을 넣는다. 👁 버튼은 `aria-label`(표시/숨기기) + `aria-pressed`로 상태를 전달한다.
- **AuthTabs**: 실제 탭 위젯이 아니라 라우트 이동 링크(`/login`·`/signup`)다. 현재 화면 탭은 active 강조(`bg.surfaceRaised`/`fg.default`), 비활성 탭은 `Link`(`fg.subtle`).
- **SteamButton**: 비활성(disabled) 자리 버튼. Steam 브랜드색(`#1b2838` 등)을 쓰지 않고 semantic 토큰(`bg.subtle`/`border.default`/`fg.subtle` + opacity)으로만 스타일한다. 브랜드 정확색은 LOGIN-FE-002에서 토큰 추가 후 적용.

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

- Steam 소셜 로그인(LOGIN-FE-002) — `SteamButton`이 비활성 자리 버튼으로 존재하며 실제 OAuth 동작·브랜드색 토큰은 후속.
- 자동 로그인(LOGIN-FE-005) — 미구현.
- 세션 복원(`GET /api/auth/me`)과 가드 `loading` 상태 — auth 인프라 티켓.
