# features/auth

인증 도메인(로그인/회원가입/세션). LOGIN-FE-001(이메일 로그인)에서 생성, 001b(Figma auth-modal 재구성)·003(STEP1)·004(STEP2)에서 확장, LOGIN-FE-005(추정 계약 정합)에 이어 **LOGIN-FE-006(실서버 GEMBTI_API 계약 재정합)에서 토큰 방식 재전환(access 메모리 Bearer + refresh httpOnly 쿠키) · 응답 envelope 폐기 · signup_token 흐름 폐기(전체 필드 직접 전송) · 닉네임 실시간 중복확인 제거 · 비번 10자+특수문자 · 닉 2~8자 · 약관 2개(이용약관/개인정보) · 성별 male/female/other**.

## 구조

```
features/auth/
├── components/
│   ├── AuthCard.tsx        인증 모달 스타일 카드 컨테이너(Figma auth-modal).
│   ├── AuthTabs.tsx        [로그인 | 회원가입] 세그먼트 토글(active 강조 + 비활성은 Link 이동)
│   ├── AuthDivider.tsx     "— 또는 이메일로 가입/로그인 —" 구분선(공용)
│   ├── SteamButton.tsx     Steam 비활성 자리 버튼(label prop, 후속 LOGIN-FE-002)
│   ├── PasswordInput.tsx   공유 Input + 👁 표시/숨김 토글 래퍼(forwardRef로 id/aria-*/ref forward)
│   ├── PasswordRules.tsx   비밀번호 강도바 + 규칙 체크리스트(순수 파생 표시, 검증 출처는 schema)
│   ├── Checkbox.tsx        토큰 기반 로컬 체크박스(visually-hidden input + 시각 박스)
│   ├── OtpInput.tsx        6칸 OTP 인증코드 입력. 자동이동/백스페이스/화살표/붙여넣기. RHF Controller 제어.
│   ├── GenderSelect.tsx    성별 select(남성/여성/선택안함=other). 공유 Input recipe 재사용.
│   ├── LoginForm.tsx       RHF + Zod 로그인 폼. useMutation 제출. 성공 시 {user, accessToken}을 onSuccess로 전달.
│   ├── SignupForm.tsx      STEP1 폼(이메일/비번/비번확인 + [필수] 만 15세 이상 확인 1개).
│   │                       onSubmitStep1({email,password,ageConfirmed})/isSubmitting/formError.
│   ├── EmailVerificationForm.tsx  STEP2 "인증 + 프로필" 폼(Figma node 4003:2117).
│   │                       안내배너 + OtpInput + CountdownTimer(상수 TTL)/재전송 + 닉네임 + 생년월일(date) + GenderSelect.
│   │                       "가입 완료" = verify(검증만)→signup(전체 필드) 순차, onSignedUp(AuthSession) 콜백.
│   └── CountdownTimer.tsx  유효시간 MM:SS 카운트다운(순수 표시, role=timer/aria-live). 0 도달 시 onExpire.
├── hooks/
│   ├── useResendCooldown.ts   재전송 쿨다운(기본 30초) 상태 + start() + 남은 초.
│   └── useSessionRestore.ts   앱 부팅 시 쿠키 refresh로 access 재발급 → /me로 사용자 복원. ready 플래그. (LOGIN-FE-006)
└── lib/
    └── safeRedirect.ts     redirect 쿼리 정규화(오픈 리다이렉트 방어 — 앱 내부 상대경로만)
```

페이지 엔트리:
- `src/routes/LoginPage.tsx` — AuthCard에 AuthTabs/SteamButton/AuthDivider/LoginForm 조립, 성공 시 `setSession({user, accessToken})` + redirect 이동. 가입 완료 후 진입 시 location.state 안내 표시.
- `src/routes/SignupPage.tsx` — AuthCard에 step 상태(1|2)를 들고 내부 전환. step1=SignupForm(계정정보+약관), step2=EmailVerificationForm(인증+프로필). 비밀번호/약관은 STEP1에서 받아 STEP2 최종 signup까지 페이지 state로 보관. STEP1 제출 시 `send-code` 후 step2로. **가입 완료 시 `setSession`만 호출 → PublicOnlyRoute가 미리 심어둔 redirect(`/onboarding/steam?origin=steamSignup`)로 보낸다**(STEAM-INTER-FE-001 진입 배선·가드 race 픽스 보존). `/signup` 라우트 무변경(라우팅 SSOT), 새로고침 시 step1 리셋.

### 보조 컴포넌트 규칙

- **PasswordInput**: 공유 `Input`을 무편집 재사용하는 래퍼. `Field`가 주입하는 id/aria-*를 안쪽 `Input`으로 forward하고 `type`만 password↔text로 토글. 👁 버튼은 `aria-label`(표시/숨기기)+`aria-pressed`.
- **AuthTabs**: 라우트 이동 링크(`/login`·`/signup`). 현재 탭 active 강조, 비활성 탭은 `Link`.
- **SteamButton**: 비활성 자리 버튼. semantic 토큰만 사용. 브랜드 정확색은 LOGIN-FE-002.
- **PasswordRules**(LOGIN-FE-006: 10자+특수문자): 강도/규칙을 **표시만** 한다. 검증 SSOT는 `signupStep1Schema`이며 같은 헬퍼(`hasSpecial`/`PASSWORD_MIN_LENGTH`)를 공유. 규칙: **10자↑·특수문자=필수, 영문·숫자=권장(선택)**.
- **OtpInput**: 6칸 분리 셀. 형식 검증 출처는 `verifyCodeSchema`(셀은 표시/입력만).
- **GenderSelect**(LOGIN-FE-006): 공유 Input recipe 재사용 `<select>`(남성/여성/**선택안함=other**). RHF Controller 제어. GEMBTI_API Gender enum과 1:1.
- **Checkbox**(LOGIN-FE-003): auth 로컬 토큰 기반 체크박스(전역 recipe 신설 안 함). **STEP1은 [필수] 만 15세 이상 확인 1개 체크**(boolean refine(true)). 서버 `age_confirmed`로 전송(LOGIN-FE-008).
- **CountdownTimer**(LOGIN-FE-004): 유효시간 MM:SS 표시만. 만료 판별 SSOT는 서버 verify(410). `seconds`(상수 TTL `EMAIL_CODE_TTL_SECONDS`) + `restartKey` + `onExpire`. ⚠️ 백엔드 send-code에 expires_in이 없어 초기값은 FE 상수(`src/config/auth.ts`)다.
- **useResendCooldown**(LOGIN-FE-004): 재전송 쿨다운(클라 제어 — 동일 send-code 재호출).
- **EmailVerificationForm**(LOGIN-FE-006 재구성): STEP2 "인증 + 프로필" 폼. 6자리 코드는 `verifyCodeSchema`, 닉네임은 닉네임 스키마로 형식 검증. "가입 완료"는 ① `verifyEmail`(email, code — 검증만), ② `signup`(email/password/password_confirm/nickname/gender/birth_date/약관 2개 전체 전송) 순차. verify 미통과 시 signup 403. 코드 오류(invalid-code/expired)는 OTP 영역, 닉네임 중복은 닉네임 필드에 표시(닉네임 실시간 중복확인 엔드포인트는 백엔드에 없어 제거됨).

## 인증 규칙 (auth.md SSOT — LOGIN-FE-006에서 갱신)

- 토큰은 **access(메모리 Bearer) + refresh(httpOnly 쿠키)** 방식이다. access_token은 Zustand 메모리에만 보관하고, refresh_token은 백엔드가 httpOnly 쿠키로 발급/관리한다(FE가 읽거나 저장하지 않는다). ⚠️ LOGIN-FE-005의 refresh=localStorage 결정을 뒤집음(team 공지).
- ky 인스턴스(`src/lib/ky.ts`)가 `credentials:'include'`로 쿠키를 주고받고, `Authorization: Bearer <access>`를 부착하고, 401 시 `/api/v1/auth/refresh`(쿠키, 바디 없음)로 access를 **1회만** 재발급·재시도한다(분리 인스턴스 + `x-retried`로 무한루프 차단). 실패 시 세션 클리어(anonymous).
- 세션 스토어(`src/lib/store/useAuthStore.ts`)는 user/status + access를 보관하고, ky boundary용 모듈 레벨 게터/세터(`getAccessToken`/`applyRefreshedTokens`/`clearAuthSession`)를 노출한다(ky↔store 순환 회피).
- 앱 부팅 시 `useSessionRestore`가 쿠키 refresh로 access를 재발급하고 `/api/v1/auth/me`로 사용자를 받아 세션을 복원한다(localStorage refresh 게이트 없음 — 무조건 시도).
- auth 관련 변경은 항상 **cross 흐름**이다.

## 데이터 흐름

- 폼 검증: `src/lib/schemas/auth.ts`의 `loginSchema`/STEP1·STEP2 회원가입 스키마/`verifyCodeSchema`/닉네임 스키마(RHF + zodResolver). 비번 10자↑+특수문자, 닉 2~8자, 성별 male/female/other.
- 서버 호출: `src/services/auth.ts`의 `login()`/`sendEmailCode()`/`verifyEmail()`/`signup()`/`refresh()`/`logout()`/`getMe()`. 응답 envelope 없음 — `AuthResponse`/`AccessTokenResponse`/`UserResponse`(자동생성물 `src/types/api.ts`)를 도메인(camel)으로 매핑. 에러는 `{detail}`(string | 검증배열) 파싱.
- mock: **auth(`/api/v1/auth/*`)는 실서버(gembti.cloud)로 passthrough**(핸들러 미등록, `onUnhandledRequest:'bypass'`). steam/games/home은 계속 MSW mock. 환경: `VITE_API_BASE_URL=https://gembti.cloud`.

## 범위 밖(후속/별개 갭)

- Steam 소셜 로그인(LOGIN-FE-002) — `SteamButton` 비활성 자리 버튼만 존재.
- `has_completed_survey` 미제공(개인화 플래그 갭, `project_personalized_home`) — AuthUser.hasCompletedSurvey는 항상 false로 격리(LOGIN-FE-006 범위 밖, R4).
- 프로덕션 Origin CORS allowlist 등록 — 쿠키 인증이 배포에서 동작하려면 백엔드 협의 필요(R1, 현재 실측 `http://localhost:3000`만).
