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

---

## REQ-003 · Steam OpenID 인증 시작/콜백 흐름 명세 누락

- 요청자: 프론트엔드 (STEAM-INTER-FE-001 스팀 연동)
- 일자: 2026-06-04
- 상태: 요청 대기

### 배경
Figma 연동 화면과 요구사항(`STEAM-INTER-FE-001`)은 **Steam OpenID 인증**을 전제로 한다.
- 요구사항: "스팀 소셜 가입/로그인 유저는 로그인 즉시 스팀 OpenID 인증 페이지로 자동 리다이렉트", 콜백 라우트 `/auth/steam/callback` 존재.
- 그러나 제공된 API `POST /api/v1/steam/link`는 `steam_id`(64비트)를 **이미 알고 있다는 전제로** body에 직접 받는다.
- FE는 사용자의 `steam_id`를 알 방법이 없다(Steam OpenID 인증을 거쳐야 발급됨). 즉 **"OpenID 인증 시작 → Steam 로그인 → 콜백에서 steam_id 획득"** 구간의 엔드포인트가 명세에 없다.

### 질문/요청
아래 둘 중 어떤 흐름인지 확정해 주세요.

- **(A) 백엔드 처리형 (FE 잠정 추천)**: 백엔드가 OpenID 인증 시작 URL을 제공(예: `GET /api/v1/steam/auth/login` → 302 to Steam). Steam 인증 후 백엔드 콜백(`/auth/steam/callback`)에서 백엔드가 `steam_id`를 추출하고 **link까지 서버에서 완료**한다. FE는 콜백 복귀 후 `GET /steam/sync-status` 폴링만 한다.
  - 이 경우 `POST /steam/link`는 FE가 직접 호출하지 않는다(서버 내부용) → FE 플로우에서 제외 가능.
- **(B) FE 처리형**: 콜백이 FE로 `steam_id`를 전달(쿼리스트링 등)하고, FE가 받은 `steam_id`로 `POST /steam/link`를 호출한다.
  - 이 경우 콜백이 FE에 `steam_id`를 어떤 형식으로 넘기는지 명세 필요.

### FE 잠정 결정 (확정 전까지 이 가정으로 구현)
- **(A) 백엔드 처리형**으로 가정한다. FE는 "연동하기" 클릭 시 OpenID 시작 URL로 이동시키고, 콜백 복귀 후 `sync-status` 폴링으로 결과를 판정한다.
- 시작 URL 엔드포인트가 확정되기 전에는 `STEAM_AUTH_START_URL` 상수 1곳으로 가설정해 두고, 확정 시 교체한다.

### 누락 시 FE 동작
- 시작 URL 미확정이면 실제 Steam 인증으로 못 넘어감 → mock 환경에서는 즉시 `sync-status` 폴링으로 우회(개발 진행 가능), 운영 연결 불가.

---

## REQ-004 · Steam sync-status 폴링 정책 (간격/타임아웃/TIMEOUT 판정 주체)

- 요청자: 프론트엔드 (STEAM-INTER-FE-002 / 로딩 화면)
- 일자: 2026-06-04
- 상태: 요청 대기

### 배경
연동 로딩 화면은 `GET /api/v1/steam/sync-status`를 폴링하며 `sync_status`로 분기한다(IN_PROGRESS/SUCCESS/PRIVATE/FAILED/TIMEOUT). Figma 안내 문구는 "평균 10~30초".

### 질문/요청
1. 권장 **폴링 간격**과 **최대 폴링 시간**이 있나요?
2. `TIMEOUT`은 **서버가 내려주는 상태값**인가요, 아니면 **FE가 자체 판정**해야 하나요? (코드표에 `TIMEOUT`이 있어 서버값으로 보이나, FE 클라 타임아웃과 중복될 수 있어 확인 필요)

### FE 잠정 결정 (확정 전까지 이 가정으로 구현)
- 폴링 간격 **2초**, 최대 **40초(20회)**.
- `TIMEOUT`은 **서버값 우선** 처리하되, 서버 응답 없이 40초 경과 시 FE가 `FAILED` 동일 화면(연결 실패, `4077:1351`)으로 폴백.
- `IN_PROGRESS`면 계속 폴링, 그 외 종료 상태(SUCCESS/PRIVATE/FAILED/TIMEOUT)면 폴링 중단.

---

## REQ-005 · 응답 envelope 형식 통일 (`POST /steam/link`)

- 요청자: 프론트엔드 (api.ts 타입 생성 일관성)
- 일자: 2026-06-04
- 상태: 요청 대기

### 배경
대부분 API는 `{ "status": "SUCCESS", "data": { … } }` envelope를 쓰는데, `POST /api/v1/steam/link`만 envelope 없이 `{ "steam_linked": true, "steam_id": "…" }`를 평면으로 반환한다.

### 요청 내용
`/steam/link` 응답도 동일 envelope로 통일해 주세요.

```jsonc
{
  "status": "SUCCESS",
  "data": { "steam_linked": true, "steam_id": "76561198012345678" }
}
```

- 누락(통일 안 됨) 시 FE 동작: FE에서 link 응답만 별도 파서로 처리하면 동작은 함. 단 `src/lib/api` 자동 생성 타입이 갈려 유지보수 비용↑.
- ※ REQ-003 (A)안으로 확정되면 `/steam/link`를 FE가 직접 호출하지 않으므로 본 요청은 무의미해질 수 있음.

---

## REQ-006 · `ONLY_SURVEY` 모드와 `POST /steam/skip` (`next_step=SURVEY`)의 관계

- 요청자: 프론트엔드 (STEAM-INTER-FE-003 비공개 / ERROR-FE-001 실패)
- 일자: 2026-06-04
- 상태: 요청 대기

### 배경
- Figma 비공개 화면(`4074:1202`)에 **`ONLY_SURVEY` 모드** 문구가 등장한다("ONLY_SURVEY 모드에서는 설문 응답 기반으로 추천").
- API에는 `POST /api/v1/steam/skip` → `{ "next_step": "SURVEY" }`만 있다.
- 요구사항의 상태값은 `steamPrivateOrFailed`(비공개/실패), `surveyIncomplete`(설문 미완).

### 질문/요청
1. 비공개/실패 화면의 "설문으로 진행" 버튼이 호출하는 API가 `POST /steam/skip`이 맞나요?
2. `ONLY_SURVEY`는 별도 사용자 모드 플래그인가요, 아니면 단순히 "Steam 데이터 없이 설문만 한 상태"를 가리키는 표현인가요? (별도 플래그라면 어디서 조회/저장되는지)

### FE 잠정 결정 (확정 전까지 이 가정으로 구현)
- 비공개·실패 화면의 **"설문으로 진행" = `POST /steam/skip` 호출** → 성공 시 `/survey/intro`로 이동.
- `ONLY_SURVEY`는 **별도 플래그가 아닌 표현**으로 간주하고, FE는 "Steam 미연동 + 설문으로 진행" 상태로만 다룬다(전용 모드 변수 만들지 않음).

---

## REQ-007 · 설문 문항 형식 불일치 (척도형 vs 선택형)

- 요청자: 프론트엔드 (SURVEY-FE-002 설문 응답 진행)
- 일자: 2026-06-04
- 상태: 요청 대기

### 배경
설문 문항 형식이 요구사항과 API 명세 간 다르다.
- 요구사항 5.4 / `SURVEY-FE-002`: **"1~5점 척도, 선택 시 다음 문항으로 자동 이동"**.
- API `GET /api/v1/surveys/questions`: `type: "SINGLE_SELECT" | "MULTI_SELECT"` + `options` 문자열 배열 (척도 아님).

### 질문/요청
확정 형식이 **선택형(SINGLE/MULTI_SELECT)** 이 맞나요? (그렇다면 요구사항의 "1~5점 척도" 문구는 폐기된 것으로 간주)
- 추가로 `MULTI_SELECT`의 **최소/최대 선택 개수** 제약이 있으면 알려주세요(없으면 1개 이상으로 가정).

### ⚠️ 소유: 설문 담당 파트 (스팀 연동 담당 범위 밖 · 참고용)
Figma 실제 설문 화면(node `387:10942`)은 **5점 리커트 척도형**(진술문 + 1~5 동의도, 양끝 "전혀 아니다"↔"매우 그렇다")이다. API 7-1의 선택형(`SINGLE_SELECT`/`MULTI_SELECT` + `options`)과 정면 충돌한다.
- 어느 형식이 최종인지(척도형이면 제출 body의 `selected` 표현 포함)는 **설문 담당이 결정**한다. 스팀 연동 구현에서는 미결로 둔다.
- 스팀 연동 화면의 "설문 시작 / 설문으로 진행" 버튼은 **설문 라우트로 이동(라우팅)만** 한다(설문 UI는 만들지 않음).

---

## REQ-008 · 가입경로/Steam 연동여부 판단 필드 (`steam_linked` / `signup_source`)

- 요청자: 프론트엔드 (STEAM-INTER-FE-001 온보딩 진입 분기)
- 일자: 2026-06-04
- 상태: 요청 대기

### 배경
가입/로그인 완료 후 사용자를 Steam 온보딩(`/onboarding/steam`)으로 보낼지 판단하려면 "이미 Steam을 연동했는지"와 "가입 경로(이메일 vs 스팀)"를 FE가 알아야 한다. 현재 `AuthUser`에는 `hasCompletedSurvey`만 있고 연동/경로 정보가 없다. 없으면 매 로그인마다 온보딩으로 보내거나(중복 진입) 분기 자체가 불가능하다.

### 요청 내용
로그인/회원가입/세션복원(`GET /api/auth/me`) 응답의 `user`에 아래 두 필드를 추가해 주세요.

```jsonc
{
  "user": {
    "id": "u_1",
    "nickname": "테스트유저",
    "has_completed_survey": false,
    "steam_linked": false,      // ← 추가 (boolean) Steam 라이브러리 연동 완료 여부
    "signup_source": "email"    // ← 추가 (enum: 'email' | 'steam') 가입 경로
  }
}
```

- `steam_linked`: 동기화 성공(`sync_status=SUCCESS`) 시 `true`. **온보딩 재진입 차단** + 마이페이지 연동상태(STEAM-INTER-FE-004) 분기 근거.
- `signup_source`: 스팀 소셜 가입이면 `'steam'`(로그인 즉시 OpenID 자동 연동 유도), 이메일 가입이면 `'email'`(선택적 안내 화면).
- FE 도메인 매핑(camelCase): `steamLinked: boolean`, `signupSource: 'email' | 'steam'`.
- 누락 시 FE 동작: **진입 배선 보류**(매 로그인 온보딩 강제 진입 방지). 개발 중에는 `/onboarding/steam` 직접 접근으로 화면 확인. 두 필드 확정 후 `LoginPage`/`SignupPage`에서 분기 활성화.

### FE 현재 처리 위치 (예정)
- 타입/매핑: `src/services/auth.ts` (`AuthUser.steamLinked` / `AuthUser.signupSource`)
- 진입 분기: `src/routes/LoginPage.tsx`(로그인 성공 후), `src/routes/SignupPage.tsx`
