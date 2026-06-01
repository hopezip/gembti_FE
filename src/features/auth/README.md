# features/auth

인증 도메인(로그인/회원가입/세션). LOGIN-FE-001(이메일 로그인)에서 생성, LOGIN-FE-001b(Figma auth-modal 재구성)에서 보조 컴포넌트 추가, LOGIN-FE-003(이메일 회원가입 STEP1)에서 회원가입 폼/약관/비밀번호 규칙 추가.

## 구조

```
features/auth/
├── components/
│   ├── AuthCard.tsx        인증 모달 스타일 카드 컨테이너(Figma auth-modal).
│   │                       슬롯: tabs(상단 세그먼트) / eyebrow(STEP) / heading / subtitle / children
│   ├── AuthTabs.tsx        [로그인 | 회원가입] 세그먼트 토글(active 강조 + 비활성은 Link 이동)
│   ├── AuthDivider.tsx     "— 또는 이메일로 가입/로그인 —" 구분선(로그인/회원가입 공용)
│   ├── SteamButton.tsx     Steam 비활성 자리 버튼(label prop, 후속 LOGIN-FE-002, 동작 없음)
│   ├── PasswordInput.tsx   공유 Input + 👁 표시/숨김 토글 래퍼(forwardRef로 id/aria-*/ref forward)
│   ├── PasswordRules.tsx   비밀번호 강도바 + 규칙 체크리스트(순수 파생 표시, 검증 출처는 schema)
│   ├── Checkbox.tsx        토큰 기반 로컬 체크박스(visually-hidden input + 시각 박스)
│   ├── TermsAgreement.tsx  약관 동의 그룹(전체동의 파생 제어 + 필수3 + 선택1, RHF Controller)
│   ├── LoginForm.tsx       RHF + Zod 로그인 폼(Field×2 + Button), useMutation으로 제출
│   └── SignupForm.tsx      RHF + Zod 회원가입 폼(이메일/비번/비번확인 + PasswordRules + 약관), mock 제출
└── lib/
    └── safeRedirect.ts     redirect 쿼리 정규화(오픈 리다이렉트 방어 — 앱 내부 상대경로만)
```

페이지 엔트리:
- `src/routes/LoginPage.tsx` — AuthCard 슬롯에 AuthTabs/SteamButton/AuthDivider/LoginForm 조립, 성공 시 authStore 갱신 + redirect 이동.
- `src/routes/SignupPage.tsx` — AuthCard(eyebrow="STEP 1 / 2 · 계정 정보")에 AuthTabs/SteamButton/AuthDivider/SignupForm 조립(STEP1 계정정보).

### 보조 컴포넌트 규칙

- **PasswordInput**: 공유 `Input`(primitive)을 무편집 재사용하기 위한 래퍼다. `Field`가 `cloneElement`로 주입하는 id/aria-*를 `{...props}`로 받아 안쪽 `Input`으로 forward하고, `type`만 password↔text로 토글한다. 비밀번호 `Field`의 children에는 `Input`이 아니라 `PasswordInput`을 넣는다. 👁 버튼은 `aria-label`(표시/숨기기) + `aria-pressed`로 상태를 전달한다.
- **AuthTabs**: 실제 탭 위젯이 아니라 라우트 이동 링크(`/login`·`/signup`)다. 현재 화면 탭은 active 강조(`bg.surfaceRaised`/`fg.default`), 비활성 탭은 `Link`(`fg.subtle`).
- **SteamButton**: 비활성(disabled) 자리 버튼. `label` prop으로 문구 변경(로그인="Steam으로 계속하기", 회원가입="Steam 계정으로 가입하기"). Steam 브랜드색(`#1b2838` 등)을 쓰지 않고 semantic 토큰(`bg.subtle`/`border.default`/`fg.subtle` + opacity)으로만 스타일한다. 브랜드 정확색은 LOGIN-FE-002에서 토큰 추가 후 적용.
- **PasswordRules**(LOGIN-FE-003): 비밀번호 강도/규칙을 **표시만** 한다. 검증의 출처(SSOT)는 `signupSchema`이며 같은 헬퍼(`hasLetter`/`hasDigit`/`hasSpecial`/`PASSWORD_MIN_LENGTH`)를 공유한다. 규칙: 10자↑·영문·숫자=필수, 특수문자=선택.
- **Checkbox / TermsAgreement**(LOGIN-FE-003): Park UI/공유 primitive에 체크박스가 없어 auth 로컬 토큰 기반으로 둔다(전역 recipe 신설 안 함). "전체 동의"는 폼 필드가 아닌 파생 제어로 하위 4개를 일괄 토글한다. 필수3은 `boolean().refine(true)`로 강제.

## 인증 규칙 (auth.md)

- 토큰은 **httpOnly Cookie만** 사용한다. localStorage/sessionStorage에 토큰을 저장하지 않는다.
- ky 인스턴스(`src/lib/ky.ts`)가 `credentials: 'include'`로 쿠키를 자동 전송한다. Authorization 헤더를 직접 조립하지 않는다.
- 세션 스토어(`src/lib/store/useAuthStore.ts`)에는 토큰이 아닌 user/세션 상태만 보관한다.
- auth 관련 변경은 항상 **cross 흐름**이다.

## 데이터 흐름

- 폼 검증: `src/lib/schemas/auth.ts`의 `loginSchema`/`signupSchema`(RHF + zodResolver).
- 서버 호출: `src/services/auth.ts`의 `login()`/`signupWithEmail()`. **Swagger 미완 동안 한시적으로 lib/ky 직접 호출**.
  `/api-sync` 후 `src/lib/api/` 생성물 조합으로 교체한다.
- mock: `src/mocks/handlers/auth.ts`가 `POST /api/auth/login`(200/401)과 `POST /api/auth/signup`(200, 기존 mock 이메일이면 409)을 가로챈다.

## 범위 밖(후속 티켓)

- Steam 소셜 로그인(LOGIN-FE-002) — `SteamButton`이 비활성 자리 버튼으로 존재하며 실제 OAuth 동작·브랜드색 토큰은 후속.
- 이메일 인증 STEP2(LOGIN-FE-004) — 회원가입 "인증 코드 받기" 이후 인증 코드 발송/검증 + 이메일 실시간 중복확인(백엔드 의존). 현재 SignupForm 제출은 mock 성공 처리만 한다.
- 닉네임/생년월일/성별 — 선택한 Figma STEP1 프레임에 없어 후속 단계로 미룸.
- 자동 로그인(LOGIN-FE-005) — 미구현.
- 세션 복원(`GET /api/auth/me`)과 가드 `loading` 상태 — auth 인프라 티켓.
