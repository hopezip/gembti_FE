# features/auth

인증 도메인(로그인/회원가입/세션). LOGIN-FE-001(이메일 로그인)에서 생성, LOGIN-FE-001b(Figma auth-modal 재구성)에서 보조 컴포넌트 추가, LOGIN-FE-003(이메일 회원가입 STEP1)에서 회원가입 폼/약관/비밀번호 규칙 추가, LOGIN-FE-004(이메일 인증 STEP2)에서 인증 코드 폼/카운트다운/재전송 쿨다운/이메일 실시간 중복확인 추가.

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
│   ├── SignupForm.tsx      RHF + Zod 회원가입 폼(STEP1). 성공 시 인증 코드 발송 후 (email, ttlSeconds)를 onSuccess로 전달.
│   │                       이메일 실시간 중복확인(useEmailAvailability) 상태 표시 + taken 시 제출 차단.
│   ├── EmailVerificationForm.tsx  RHF + Zod 인증 코드 폼(STEP2). 6자리 코드 verify + CountdownTimer + 재전송(useResendCooldown).
│   │                       에러 분기(invalid-code/expired/generic, role=alert), onVerified 콜백.
│   └── CountdownTimer.tsx  유효시간 MM:SS 카운트다운(순수 표시, role=timer/aria-live). 0 도달 시 onExpire.
├── hooks/
│   ├── useResendCooldown.ts   재전송 쿨다운(기본 30초) 상태 + start() + 남은 초(재전송 버튼 disable 제어).
│   └── useEmailAvailability.ts 이메일 debounce(400ms) 후 중복확인(TanStack Query). idle/checking/available/taken/error.
└── lib/
    └── safeRedirect.ts     redirect 쿼리 정규화(오픈 리다이렉트 방어 — 앱 내부 상대경로만)
```

페이지 엔트리:
- `src/routes/LoginPage.tsx` — AuthCard 슬롯에 AuthTabs/SteamButton/AuthDivider/LoginForm 조립, 성공 시 authStore 갱신 + redirect 이동.
- `src/routes/SignupPage.tsx` — AuthCard에 step 상태(1|2)를 들고 내부 전환한다. step1=SignupForm(계정정보), step2=EmailVerificationForm(이메일 인증). eyebrow/subtitle을 step에 따라 전환하며, `/signup` 라우트는 무변경(라우팅 SSOT)이다. STEP1 성공 시 (email, ttlSeconds)를 받아 step2로, STEP2 성공 시 `/onboarding/steam`(STEAM-INTER-FE-001, 현재 PlaceholderPage)로 이동. 새로고침 시 step1로 리셋(딥링크 미요구).

### 보조 컴포넌트 규칙

- **PasswordInput**: 공유 `Input`(primitive)을 무편집 재사용하기 위한 래퍼다. `Field`가 `cloneElement`로 주입하는 id/aria-*를 `{...props}`로 받아 안쪽 `Input`으로 forward하고, `type`만 password↔text로 토글한다. 비밀번호 `Field`의 children에는 `Input`이 아니라 `PasswordInput`을 넣는다. 👁 버튼은 `aria-label`(표시/숨기기) + `aria-pressed`로 상태를 전달한다.
- **AuthTabs**: 실제 탭 위젯이 아니라 라우트 이동 링크(`/login`·`/signup`)다. 현재 화면 탭은 active 강조(`bg.surfaceRaised`/`fg.default`), 비활성 탭은 `Link`(`fg.subtle`).
- **SteamButton**: 비활성(disabled) 자리 버튼. `label` prop으로 문구 변경(로그인="Steam으로 계속하기", 회원가입="Steam 계정으로 가입하기"). Steam 브랜드색(`#1b2838` 등)을 쓰지 않고 semantic 토큰(`bg.subtle`/`border.default`/`fg.subtle` + opacity)으로만 스타일한다. 브랜드 정확색은 LOGIN-FE-002에서 토큰 추가 후 적용.
- **PasswordRules**(LOGIN-FE-003): 비밀번호 강도/규칙을 **표시만** 한다. 검증의 출처(SSOT)는 `signupSchema`이며 같은 헬퍼(`hasLetter`/`hasDigit`/`hasSpecial`/`PASSWORD_MIN_LENGTH`)를 공유한다. 규칙: 10자↑·영문·숫자=필수, 특수문자=선택.
- **Checkbox / TermsAgreement**(LOGIN-FE-003): Park UI/공유 primitive에 체크박스가 없어 auth 로컬 토큰 기반으로 둔다(전역 recipe 신설 안 함). "전체 동의"는 폼 필드가 아닌 파생 제어로 하위 4개를 일괄 토글한다. 필수3은 `boolean().refine(true)`로 강제.
- **CountdownTimer**(LOGIN-FE-004): 인증 코드 유효시간을 MM:SS로 표시만 한다(검증 책임 없음 — 만료 판별의 SSOT는 서버 verify 410이다). `seconds` 초기값 + `restartKey`(동일 seconds 재전송 시에도 리셋) + `onExpire`(0 도달 1회). `role="timer"`/`aria-live="polite"`.
- **useResendCooldown / useEmailAvailability**(LOGIN-FE-004): 재전송 쿨다운(클라 제어 — 서버는 동일 발송 엔드포인트 재호출)과 이메일 중복확인 hook. 중복확인은 보조 표시라 실패 시 'error'로 degrade하고 가입을 막지 않는다(서버 409가 최종 안전망). 'taken'일 때만 SignupForm 제출을 보조 차단한다.
- **EmailVerificationForm**(LOGIN-FE-004): STEP2 인증 폼. 6자리 코드는 `verifyCodeSchema`로 형식 검증, 코드 유효성(만료/오답)은 서버 verify가 판별한다. 에러 분기는 LoginForm/SignupForm과 동일하게 `VerifyError` instanceof로 kind(invalid-code/expired/generic)를 읽어 매핑한다.

## 인증 규칙 (auth.md)

- 토큰은 **httpOnly Cookie만** 사용한다. localStorage/sessionStorage에 토큰을 저장하지 않는다.
- ky 인스턴스(`src/lib/ky.ts`)가 `credentials: 'include'`로 쿠키를 자동 전송한다. Authorization 헤더를 직접 조립하지 않는다.
- 세션 스토어(`src/lib/store/useAuthStore.ts`)에는 토큰이 아닌 user/세션 상태만 보관한다.
- auth 관련 변경은 항상 **cross 흐름**이다.

## 데이터 흐름

- 폼 검증: `src/lib/schemas/auth.ts`의 `loginSchema`/`signupSchema`/`verifyCodeSchema`(RHF + zodResolver).
- 서버 호출: `src/services/auth.ts`의 `login()`/`signupWithEmail()`/`requestEmailVerification()`/`verifyEmailCode()`/`checkEmailAvailability()`. **Swagger 미완 동안 한시적으로 lib/ky 직접 호출**.
  `/api-sync` 후 `src/lib/api/` 생성물 조합으로 교체한다.
- mock: `src/mocks/handlers/auth.ts`가 `POST /api/auth/login`(200/401), `POST /api/auth/signup`(200, 기존 mock 이메일이면 409),
  `POST /api/auth/email/verification`(200 + ttlSeconds), `POST /api/auth/email/verify`(123456=200 / 000000=410 / 그 외=400),
  `GET /api/auth/email/check`(기존 mock 이메일이면 available:false)을 가로챈다.

## 범위 밖(후속 티켓)

- Steam 소셜 로그인(LOGIN-FE-002) — `SteamButton`이 비활성 자리 버튼으로 존재하며 실제 OAuth 동작·브랜드색 토큰은 후속.
- Steam 연동 안내 화면(STEAM-INTER-FE-001, `/onboarding/steam`) — STEP2 인증 성공 후 이동 대상. 화면 자체는 미구현이라 현재 공통 PlaceholderPage로 degrade(이번 범위 밖).
- 닉네임/생년월일/성별 — 선택한 Figma STEP1 프레임에 없어 후속 단계로 미룸.
- 자동 로그인(LOGIN-FE-005) — 미구현.
- 세션 복원(`GET /api/auth/me`)과 가드 `loading` 상태 — auth 인프라 티켓.
