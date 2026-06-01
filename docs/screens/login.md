# 이메일 로그인 — 화면 정의서

## 메타
- 화면 ID: SCREEN-LOGIN
- 생성: 2026-06-01
- 관련 티켓: `LOGIN-FE-001` (이메일 로그인)
- 관련 REQ: `LOGIN-FE-001`, `ERROR-FE-003` / REQ 5.1 이메일 로그인 플로우, REQ 4 라우트 표(`/login` = Public only)
- 관련 이슈: #53

> 범위: **이메일 로그인만**. Steam 소셜 로그인(`LOGIN-FE-002`)·자동 로그인 체크박스(`LOGIN-FE-005`)는 본 정의서에서 **레이아웃 자리만** 언급하고 구현은 **후속**으로 분리한다.

## 목적
비로그인 사용자가 이메일·비밀번호로 인증하여 세션을 얻고, 진입 전 의도했던 경로(또는 홈)로 복귀하게 한다.

## 진입 경로
- URL: `/login`
- 진입 트리거:
  - 헤더/내비의 "로그인" 진입
  - 인증 필요 화면에서 `ProtectedRoute` 가드가 비로그인 사용자를 `/login?redirect=<원래경로>`로 보낼 때 (REQ 7번 정책: redirect 보존)
- 접근 권한: **Public only** — `src/routes/guards/PublicOnlyRoute.tsx` 적용. 이미 로그인 상태(`status === 'authenticated'`)면 홈(`/`)으로 `Navigate replace`.
- redirect 쿼리 보존: `?redirect=<경로>` 쿼리스트링을 읽어 로그인 성공 후 이동지로 사용. 값이 없으면 홈(`/`).
  - 보안: redirect 값은 **앱 내부 상대경로만** 허용(`/`로 시작, `//` 또는 절대 URL 차단)하여 오픈 리다이렉트를 막는다.

## UI 컴포넌트
DESIGN_SYSTEM.md 7장 매핑 기준 — 인증 페이지(08)는 `AuthCard`(중앙 카드 + OAuth 버튼들), 폼은 `Field` + `Input` + `Button` 조합.

- `AuthCard`: 화면 중앙 카드 컨테이너 (다크, 데스크탑 중앙 정렬). 제목 영역 + 폼 + 후속 자리표시 + 하단 회원가입 링크.
- `Field` (×2): label row + help + error 래퍼 (DESIGN_SYSTEM 2.15). `aria-required`, `aria-invalid`, `aria-describedby` 표준 적용.
  - 이메일 `Field` → `Input` (`type="email"`, `size` variant 기본)
  - 비밀번호 `Field` → `Input` (`type="password"`)
- `Button` (variant `primary`, type `submit`): "로그인". 제출 중 `loading`/`disabled` 표현.
- 폼 레벨 에러 영역: 401 등 서버 인증 실패 메시지 표시 영역 (개별 필드 에러와 분리, `role="alert"`).
- 하단 보조 링크: "회원가입" → `/signup` (`Public only`).
- **후속 자리표시(이번 구현 대상 아님)**:
  - Steam 로그인 버튼 자리 (`LOGIN-FE-002`) — `AuthCard`의 OAuth 버튼 슬롯
  - "자동 로그인" 체크박스 자리 (`LOGIN-FE-005`)
  - 정의서에는 위치만 표기하고 렌더링/동작은 후속 티켓에서 추가.

사용 primitive 경로: `src/components/ui/Input.tsx`(size variant, `aria-invalid` 소비), `src/components/ui/Button.tsx`(variant), `src/components/ui/field.tsx`(Field 래퍼).

## 입력 / 검증 규칙 (Zod 안)

스키마 위치(안): `src/lib/schemas/auth.ts` (forms.md 규칙 — 컴포넌트 인라인 정의 금지). RHF + `zodResolver` 결합. 에러 메시지는 한국어.

```typescript
// 안(案) — 구현 시 확정
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요'),
  // 가정: 로그인 화면에서는 비밀번호 형식(10자/영문+숫자)을 강제하지 않는다.
  //   형식 규칙은 회원가입(LOGIN-FE-003)에서만 적용. 로그인은 "필수" 검증만 하고
  //   잘못된 자격증명은 서버 401로 판별한다(클라가 형식으로 차단하면 기존 계정 호환성 문제).
});
export type LoginInput = z.infer<typeof loginSchema>;
```

검증 시점: `onSubmit` + 제출 후에는 `onChange` 재검증(RHF 기본 mode `onSubmit` + `reValidateMode: 'onChange'`).

## 상호작용 / 상태

| 상태 | 트리거 | UI |
|------|--------|----|
| idle | 진입 직후 | 빈 폼, 에러 없음, 제출 버튼 활성 |
| 검증 실패 | 제출 시 Zod 실패 | 해당 `Field` 하단 error 표시(`aria-invalid`), 첫 오류 필드로 focus, API 호출 안 함 |
| 제출 중(loading) | 검증 통과 후 mutation pending | 제출 버튼 `loading`+`disabled`, 입력 `disabled`, 중복 제출 차단 |
| 성공(success) | 200 응답 | 세션 스토어 갱신 후 redirect 경로(또는 홈)로 이동. 로그인 화면 자체는 별도 success UI 없이 즉시 라우팅 |
| 인증 실패(401) | 잘못된 이메일/비번 | 폼 레벨 에러 영역에 안내(`ERROR-FE-003`), 입력값 유지, 비밀번호 필드만 초기화(선택), 버튼 재활성 |
| 네트워크/서버 에러 | 4xx(401 제외)/5xx/네트워크 | 폼 레벨 에러 영역에 "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요." + 재시도(재제출) 가능 |

## 상태 분기 (Empty / Loading / Error / Success)

| 상태 | UI |
|------|----|
| Empty | 진입 직후 빈 폼 (idle). 별도 empty 일러스트 없음 |
| Loading | 제출 중: 버튼 spinner + 폼 비활성. (세션 복원 중 가드 로딩은 후속 — 현 `useAuthStore` stub엔 `loading` 상태 없음) |
| Error | 검증 실패(필드 인라인) / 401 인증 실패(폼 레벨, `ERROR-FE-003`) / 네트워크·서버 에러(폼 레벨, 재시도) |
| Success | 응답 성공 시 화면 머무르지 않고 redirect/홈으로 즉시 이동 |

## API 사용 (가정안 — 백엔드 계약 미정, MSW mock 전제)

> 백엔드 계약 확정 전까지 **MSW mock**으로 동작. 확정 후 `/api-sync`로 `src/lib/api/`·`src/types/api.ts` 자동 생성물로 교체.
> 인증은 httpOnly Cookie 전제(auth.md): 클라이언트는 토큰 문자열을 저장하지 않고 `credentials: 'include'`로 쿠키 자동 전송.

- `POST /api/auth/login` — 로그인
  - 요청 body: `{ email: string, password: string }`
  - 200: `{ user: { id, nickname, ... } }` + `Set-Cookie`(httpOnly JWT) — 스토어엔 토큰이 아닌 user/로그인 상태만 반영
  - 401: 잘못된 자격증명 → `ERROR-FE-003` 안내 메시지
  - 4xx(검증)/5xx: 폼 레벨 일반 에러 메시지
- (선택) `GET /api/auth/me` 또는 동등 엔드포인트 — 성공 직후/redirect 전 세션 사용자 확정용. 세션 복원 로직은 **auth 티켓(후속)** 소관.

데이터 패칭: TanStack Query `useMutation`(login) + 성공 콜백에서 세션 스토어 갱신 후 `navigate(redirect ?? '/')`.

## 접근성 (a11y)
- 각 `Field`의 label과 `Input`을 `htmlFor`/`id`로 연결.
- 검증 실패 시 `aria-invalid="true"`, error 메시지를 `aria-describedby`로 연결.
- 필수 입력은 `aria-required="true"`.
- 폼 레벨 에러 영역은 `role="alert"`로 스크린리더 즉시 통지.
- 제출 시 첫 오류 필드로 focus 이동.
- 제출 버튼 loading 시 `aria-busy="true"`.

## Acceptance Criteria
- [ ] 비로그인 사용자가 `/login` 진입 시 빈 로그인 폼이 보인다.
- [ ] 이미 로그인된 사용자가 `/login` 진입 시 홈(`/`)으로 즉시 리다이렉트된다(`PublicOnlyRoute`).
- [ ] 이메일이 비었거나 형식이 틀리면 제출 시 해당 필드 하단에 한국어 에러가 표시되고 API는 호출되지 않는다.
- [ ] 비밀번호가 비어 있으면 제출 시 해당 필드 하단에 한국어 에러가 표시된다.
- [ ] 검증 통과 후 제출하면 1초 내 버튼이 loading 상태로 바뀌고 입력이 비활성화되어 중복 제출이 차단된다.
- [ ] 200 응답 시 `?redirect` 경로가 있으면 그 경로로, 없으면 홈(`/`)으로 이동한다.
- [ ] `?redirect` 값이 외부 URL/`//`로 시작하면 무시하고 홈(`/`)으로 이동한다.
- [ ] 401 응답 시 폼 레벨 에러 영역에 로그인 실패 안내(`ERROR-FE-003`)가 표시되고 입력 이메일은 유지된다.
- [ ] 네트워크/5xx 에러 시 폼 레벨에 재시도 가능한 일반 오류 메시지가 표시된다.
- [ ] label-입력 연결, `aria-invalid`, `aria-describedby`, 폼 레벨 `role="alert"`가 적용된다.
- [ ] 토큰을 localStorage/sessionStorage에 저장하지 않는다(쿠키 전제).

## 와이어 (간단히)

```
            (다크 · 데스크탑 · 중앙 정렬)
        +------------------------------------+
        |              GamBTI                |
        |          이메일로 로그인           |
        |                                    |
        |  이메일 *                          |
        |  [______________________________] |
        |  (error: 올바른 이메일 형식 아님)  |
        |                                    |
        |  비밀번호 *                        |
        |  [______________________________] |
        |  (error: 비밀번호를 입력해주세요)  |
        |                                    |
        |  [! 로그인 실패 안내 (401)        ] | role=alert
        |                                    |
        |  [        로그인  (primary)       ] | loading 시 spinner
        |                                    |
        |  ----- 후속 자리표시(미구현) ----- |
        |  [ ] 자동 로그인   (LOGIN-FE-005)  |
        |  [  Steam 으로 로그인 ](LOGIN-FE-002)|
        |                                    |
        |  계정이 없으신가요?  회원가입 →    |
        +------------------------------------+
```

## 범위 밖 (후속)
- `LOGIN-FE-002` Steam 소셜 로그인 — `AuthCard` OAuth 슬롯에 자리만, 동작은 후속.
- `LOGIN-FE-005` 자동 로그인 체크박스 — 자리만, 지속 세션은 백엔드 쿠키 만료 정책 위임(auth.md).
- 세션 복원/`loading` 가드 상태 — 현 `useAuthStore`는 `'anonymous' | 'authenticated'` 2상태 stub. 복원 로직·`loading` 추가는 auth 티켓 소관.
- 실제 백엔드 로그인 계약 확정 및 `/api-sync` 생성물 교체.

## 관련 문서
- 요구사항: `../requirements/FE_REQUIREMENTS_FOR_CLAUDE_CODE.md` (`LOGIN-FE-001`, `ERROR-FE-003`, REQ 5.1)
- 아키텍처: `../architecture/auth.md`, `../architecture/forms.md`
- 디자인: `../../docs/design/DESIGN_SYSTEM.md` (08 인증 = `AuthCard`, 2.15 `Field`, 2.1 `Button`, 2.3 `Input`)
- 가드: `src/routes/guards/PublicOnlyRoute.tsx`
- 스토어: `src/lib/store/useAuthStore.ts`
