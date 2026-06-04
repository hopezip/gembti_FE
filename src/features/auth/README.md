# features/auth

인증 도메인(로그인/회원가입/세션). LOGIN-FE-001(이메일 로그인)에서 생성, LOGIN-FE-001b(Figma auth-modal 재구성)에서 보조 컴포넌트 추가, LOGIN-FE-003(이메일 회원가입 STEP1)에서 회원가입 폼/비밀번호 규칙 추가, LOGIN-FE-004(이메일 인증 STEP2)에서 인증 코드 폼/카운트다운/재전송 쿨다운 추가, **LOGIN-FE-005(백엔드 API 명세 전면 정합화)에서 토큰 방식 전환(access 메모리 + refresh localStorage + Bearer) · 회원가입 STEP2 재구성(6칸 OTP + 닉네임 실시간확인 + 생년월일 + 성별) · 약관 그룹 폐지(만 14세 한 줄) · 세션 복원 추가**.

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
│   ├── OtpInput.tsx        6칸 OTP 인증코드 입력(LOGIN-FE-005). 셀별 1자리, 자동이동/백스페이스/화살표 이동/6자리 붙여넣기. value/onChange 제어(RHF Controller).
│   ├── GenderSelect.tsx    성별 select(LOGIN-FE-005). 공유 Input recipe 재사용, 남성/여성/선택안함. value/onChange 제어.
│   ├── LoginForm.tsx       RHF + Zod 로그인 폼(Field×2 + Button), useMutation으로 제출. 성공 시 {user, tokens}를 onSuccess로 전달.
│   ├── SignupForm.tsx      RHF + Zod 회원가입 STEP1 폼(이메일/비번/비번확인 + [필수] 만 14세 한 줄 체크).
│   │                       onSubmitStep1(values)/isSubmitting/formError props(제출·send-code는 페이지가 담당).
│   ├── EmailVerificationForm.tsx  STEP2 "인증 + 프로필" 폼(LOGIN-FE-005, Figma node 4003:2117).
│   │                       안내배너 + OtpInput + CountdownTimer/재전송 + 닉네임(useNicknameAvailability) + 생년월일(date) + GenderSelect.
│   │                       "가입 완료" = verify-code→signup 순차, onSignedUp 콜백.
│   └── CountdownTimer.tsx  유효시간 MM:SS 카운트다운(순수 표시, role=timer/aria-live). 0 도달 시 onExpire.
├── hooks/
│   ├── useResendCooldown.ts        재전송 쿨다운(기본 30초) 상태 + start() + 남은 초(재전송 버튼 disable 제어).
│   ├── useNicknameAvailability.ts  닉네임 debounce 후 중복확인(check-nickname, TanStack Query). idle/checking/available/taken/error. (LOGIN-FE-005)
│   └── useSessionRestore.ts        앱 부팅 시 localStorage refresh_token으로 access 재발급·세션 복원. ready 플래그 노출. (LOGIN-FE-005)
└── lib/
    └── safeRedirect.ts     redirect 쿼리 정규화(오픈 리다이렉트 방어 — 앱 내부 상대경로만)
```

페이지 엔트리:
- `src/routes/LoginPage.tsx` — AuthCard 슬롯에 AuthTabs/SteamButton/AuthDivider/LoginForm 조립, 성공 시 `setSession`(user+토큰) + redirect 이동. 가입 완료 후 진입 시 location.state 안내 표시.
- `src/routes/SignupPage.tsx` — AuthCard에 step 상태(1|2)를 들고 내부 전환한다. step1=SignupForm(계정정보), step2=EmailVerificationForm(인증+프로필). 비밀번호는 STEP1에서 받아 STEP2 최종 signup까지 페이지 state로 보관한다. STEP1 제출 시 `send-code`로 expires_in을 받아 step2로, STEP2 가입 완료 시 `/login`으로 이동(완료 안내 location.state). `/signup` 라우트는 무변경(라우팅 SSOT), 새로고침 시 step1로 리셋(딥링크 미요구).

### 보조 컴포넌트 규칙

- **PasswordInput**: 공유 `Input`(primitive)을 무편집 재사용하기 위한 래퍼다. `Field`가 `cloneElement`로 주입하는 id/aria-*를 `{...props}`로 받아 안쪽 `Input`으로 forward하고, `type`만 password↔text로 토글한다. 비밀번호 `Field`의 children에는 `Input`이 아니라 `PasswordInput`을 넣는다. 👁 버튼은 `aria-label`(표시/숨기기) + `aria-pressed`로 상태를 전달한다.
- **AuthTabs**: 실제 탭 위젯이 아니라 라우트 이동 링크(`/login`·`/signup`)다. 현재 화면 탭은 active 강조(`bg.surfaceRaised`/`fg.default`), 비활성 탭은 `Link`(`fg.subtle`).
- **SteamButton**: 비활성(disabled) 자리 버튼. `label` prop으로 문구 변경. Steam 브랜드색을 쓰지 않고 semantic 토큰(`bg.subtle`/`border.default`/`fg.subtle` + opacity)으로만 스타일한다. 브랜드 정확색은 LOGIN-FE-002에서 토큰 추가 후 적용.
- **PasswordRules**(LOGIN-FE-003, 005에서 8자로): 비밀번호 강도/규칙을 **표시만** 한다. 검증의 출처(SSOT)는 `signupSchema`이며 같은 헬퍼(`hasLetter`/`hasDigit`/`PASSWORD_MIN_LENGTH`)를 공유한다. 규칙: 8자↑·영문·숫자=필수, 특수문자=선택.
- **OtpInput**(LOGIN-FE-005): 6칸 분리 셀 인증코드 입력. 6자리 문자열을 value로 제어하고, 숫자 입력 시 다음 칸 자동 이동·백스페이스 이전 칸·좌우 화살표 이동·6자리 붙여넣기 일괄 채움을 처리한다. 형식 검증의 출처는 `verifyCodeSchema`다(셀은 표시/입력만).
- **GenderSelect**(LOGIN-FE-005): 공유 Input recipe를 재사용한 `<select>` 래퍼(남성/여성/선택안함). RHF Controller로 value/onChange를 제어한다.
- **Checkbox**(LOGIN-FE-003): Park UI/공유 primitive에 체크박스가 없어 auth 로컬 토큰 기반으로 둔다(전역 recipe 신설 안 함). **약관 그룹/전체동의(TermsAgreement)는 LOGIN-FE-005에서 폐지**되고, STEP1은 `[필수] 만 14세 이상이에요` 단일 체크만 둔다(boolean refine(true)로 강제).
- **CountdownTimer**(LOGIN-FE-004): 인증 코드 유효시간을 MM:SS로 표시만 한다(만료 판별의 SSOT는 서버 verify-code 410). `seconds` 초기값 + `restartKey`(재전송 시 리셋) + `onExpire`(0 도달 1회). `role="timer"`/`aria-live="polite"`.
- **useResendCooldown**(LOGIN-FE-004): 재전송 쿨다운(클라 제어 — 서버는 동일 send-code 엔드포인트 재호출).
- **useNicknameAvailability**(LOGIN-FE-005): 닉네임 debounce 후 `check-nickname` 조회. 보조 표시라 실패 시 'error'로 degrade하고 가입을 막지 않는다(서버 signup의 NICKNAME_DUPLICATED가 최종 안전망). 'available'일 때 "✓ 사용 가능한 닉네임이에요"를 표시한다.
- **EmailVerificationForm**(LOGIN-FE-004 → 005 재구성): STEP2 "인증 + 프로필" 폼. 6자리 코드는 `verifyCodeSchema`, 닉네임은 닉네임 스키마로 형식 검증한다. "가입 완료"는 ① `verifyEmailCode`(code)→signup_token, ② `signup`(signup_token+password+nickname; birth/gender는 mock에만) 순차다. 코드 오류(invalid-code/expired)는 OTP 영역, 닉네임 중복(NICKNAME_DUPLICATED)은 닉네임 필드에 표시한다.

## 인증 규칙 (auth.md — LOGIN-FE-005에서 갱신)

- 토큰은 **access(메모리) + refresh(localStorage)** 방식이다(httpOnly 쿠키 전제 폐기). access_token은 Zustand 메모리에만 보관하고, refresh_token만 localStorage(`gambti_refresh_token`)에 영속화한다.
- ky 인스턴스(`src/lib/ky.ts`)가 `Authorization: Bearer <access>`를 부착하고, 401 시 `/api/v1/auth/refresh`로 access를 **1회만** 재발급·재시도한다(분리 인스턴스 + `x-retried` 헤더로 무한루프 차단). 컴포넌트는 토큰을 직접 만지지 않는다.
- 세션 스토어(`src/lib/store/useAuthStore.ts`)는 user/status + 토큰을 보관하고, ky boundary용 모듈 레벨 게터/세터(`getAccessToken`/`getRefreshToken`/`applyRefreshedTokens`/`clearAuthSession`)를 노출한다(ky↔store 순환 회피).
- 앱 부팅 시 `useSessionRestore`가 localStorage refresh_token으로 access를 재발급해 세션을 복원한다.
- auth 관련 변경은 항상 **cross 흐름**이다.

## 데이터 흐름

- 폼 검증: `src/lib/schemas/auth.ts`의 `loginSchema`/STEP1·STEP2 회원가입 스키마/`verifyCodeSchema`/닉네임 스키마(RHF + zodResolver). 비번 최소 8자.
- 서버 호출: `src/services/auth.ts`의 `login()`/`sendEmailCode()`/`verifyEmailCode()`(→signup_token)/`checkNicknameAvailability()`/`signup()`/(refresh는 ky·useSessionRestore 내부). 응답은 `{status,data,message,error_code}` 래퍼/토큰 바디로 매핑. **Swagger 미완 동안 한시적으로 lib/ky 직접 호출**, `/api-sync` 후 `src/lib/api/` 생성물 조합으로 교체한다.
- mock: `src/mocks/handlers/auth.ts`가 `/api/v1/auth/*`를 가로챈다 — `login`(200 래퍼+토큰 / 401), `refresh`(access 재발급+user), `email/send-code`(expires_in), `email/verify-code`(123456=signup_token / 000000=410 / 그 외=400), `check-nickname`("테스트유저"=false), `signup`(NICKNAME_DUPLICATED 데모 + 토큰/user).

## 범위 밖(후속 티켓)

- Steam 소셜 로그인(LOGIN-FE-002) — `SteamButton`이 비활성 자리 버튼으로 존재하며 실제 OAuth 동작·브랜드색 토큰은 후속.
- Steam 연동 안내 화면(STEAM-INTER-FE-001, `/onboarding/steam`) — 화면 미구현이라 현재 공통 PlaceholderPage로 degrade.
- 생년월일/성별 백엔드 수용 — signup body 미포함이라 mock에만 전송, `docs/03-api/backend-requests.md` REQ-002로 추가 요청.
- providers 부팅 견고성 — mock 초기화 실패 시 빈 화면 방지(`.catch`)는 별도 개선 후보.
