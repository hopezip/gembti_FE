# 백엔드 추가 요청 (FE → BE)

> Swagger 미완 동안 FE가 가정하고 진행한 계약 항목 모음. 백엔드 구현/Swagger 반영을 요청한다.
> ⚠️ 이 파일은 `openapi.json`(자동 생성물)과 별개의 수동 요청 메모다. 직접 편집 가능.

## REQ-001 · 로그인/회원가입 응답에 설문 완료 플래그 추가

- 요청자: 프론트엔드 (MAIN-FE-006 개인화 메인 홈)
- 일자: 2026-06-03
- 상태: 요청 대기

### 배경
메인(`/`)은 두 상태로 분기한다.
- 게스트 홈: 비로그인 **또는** 설문 미완 → `GET /api/v1/home/guest`
- 개인화 홈: 로그인 **AND** 설문완료 → `GET /api/v1/home/personalized`

이 분기를 판단하려면 "현재 로그인 사용자가 설문을 완료했는지"를 FE가 알아야 한다.
현재 로그인(`POST /api/auth/login`)·회원가입(`POST /api/auth/signup`) 응답의 `user`에는 해당 정보가 없다.

### 요청 내용
로그인/회원가입(및 향후 세션 복원 `GET /api/auth/me`) 응답의 `user` 객체에 아래 필드를 추가해 주세요.

```jsonc
{
  "user": {
    "id": "u_1",
    "nickname": "테스트유저",
    "has_completed_survey": true   // ← 추가 요청 (boolean)
  }
}
```

- 필드명(snake_case): `has_completed_survey`
- FE 도메인 매핑(camelCase): `hasCompletedSurvey: boolean`
- 누락 시 FE 동작: `false`로 기본 처리(게스트 홈으로 폴백). 즉 미구현이어도 깨지지 않으나, 개인화 홈 진입이 불가능하다.

### FE 현재 처리 위치
- 타입/매핑: `src/services/auth.ts` (`AuthUser.hasCompletedSurvey`, `mapAuthUser`)
- 진입 분기: `src/routes/MainPage.tsx` (`status==='authenticated' && user?.hasCompletedSurvey`)
- mock 데모: `src/mocks/handlers/auth.ts` (`survey@gambti.com` 로그인 시 `has_completed_survey:true`)

### 비고
- 인증은 토큰 바디 방식(access_token/refresh_token)이므로 `has_completed_survey`는 토큰 페이로드가 아니라 응답 `data.user`에 실어 주세요.
- 설문 완료 여부가 런타임에 바뀌는 경우(설문 도중/완료 직후) 세션 복원(refresh) 응답에서도 동일 필드를 내려주면 새로고침 후에도 분기가 정확합니다.

---

## REQ-002 · 회원가입(signup) body에 birth(생년월일)/gender(성별) 추가

- 요청자: 프론트엔드 (LOGIN-FE-005 회원가입 STEP2 프로필)
- 일자: 2026-06-04
- 상태: 요청 대기

### 배경
회원가입 STEP2(인증 + 프로필)에서 닉네임과 함께 **생년월일·성별**을 입력받는다(Figma auth-modal node 4003:2117).
현재 확정 백엔드 명세의 `POST /api/v1/auth/signup` body는 `signup_token` + `password` + `nickname`만 받는다.

### 요청 내용
signup body에 아래 두 필드를 추가로 수용해 주세요(저장/프로필 반영).

```jsonc
{
  "signup_token": "…",
  "password": "…",
  "nickname": "…",
  "birth": "2000-01-01",   // ← 추가 요청 (YYYY-MM-DD, ISO date)
  "gender": "unspecified"  // ← 추가 요청 (enum: 'male' | 'female' | 'unspecified')
}
```

- `birth`: 생년월일. `<input type=date>` 값(YYYY-MM-DD).
- `gender`: 성별 enum. 'male'(남성) / 'female'(여성) / 'unspecified'(선택 안 함).
- 누락(미수용) 시 FE 동작: signup은 정상 진행된다(FE는 두 필드를 항상 전송하나 백엔드가 무시해도 가입은 성공). 단, 프로필에 생년월일·성별이 비게 된다.

### FE 현재 처리 위치
- 타입/전송: `src/services/auth.ts` (`SignupPayload.birth`/`gender`, `signup`이 `birth`/`gender`를 body에 포함)
- 입력 UI: `src/features/auth/components/EmailVerificationForm.tsx` (STEP2 생년월일/성별 2열)
- mock 수용: `src/mocks/handlers/auth.ts` (`/api/v1/auth/signup`가 birth/gender 수용)
