# features/onboarding

스팀 연동 온보딩 도메인(STEAM-INTER-FE-001). 이메일/스팀 가입 직후 Steam 라이브러리를 연동해
보유 게임·플레이 시간을 가져오고, 6대 성향 추정 → 설문으로 이어지는 6화면 흐름을 담는다.

다크·데스크탑 전용. 색은 semantic token만 사용한다.

## 구조

```
features/onboarding/
├── types.ts                      도메인 타입 SSOT(데이터·프리젠테이션·호스트 공유)
├── components/                    순수 프리젠테이션 6개(내부 fetch/navigate/useQuery 금지)
│   ├── SteamBenefitList.tsx       하단 benefits 3열(index/title/desc)
│   ├── SteamLinkInvite.tsx        화면1·2 연동 유도. origin('emailSignup'|'steamSignup')별 카피/배지/benefits 분기
│   ├── SteamSyncLoading.tsx       화면3 동기화 진행. accent 스피너 + 경과초 + 취소
│   ├── SteamSyncSuccess.tsx       화면4 성공. 가져온 게임 수 + 설문 시작(주)/메인(보조)
│   ├── SteamSyncPrivate.tsx       화면5 라이브러리 비공개. 공개 가이드 4스텝 + 다시 시도/설문 진행
│   └── SteamSyncError.tsx         화면6 실패·타임아웃 공용. 원인 3박스 + 다시 시도/설문 진행
└── api/                           데이터레이어(TanStack Query 훅 3개)
    ├── steamSyncStatus.ts         useSteamSyncStatus(enabled, scenario?, runId?) — 2초 폴링, 종료상태 시 중단, 40s 타임아웃, runId nonce로 세션별 캐시 분리
    ├── steamSkip.ts               useSteamSkip() — POST skip 뮤테이션(navigate는 호출부)
    └── steamLink.ts               useSteamLink() — POST link 뮤테이션(REQ-003 A안이라 미사용 스켈레톤)
```

연동 서비스/설정/mock은 도메인 밖에 있다:
- `src/services/steam.ts` — getSyncStatus / skipSteam / steamLink(snake→camel 매핑, SteamSyncError)
- `src/config/steam.ts` — STEAM_AUTH_START_URL(REQ-003 가설정) · STEAM_POLL_INTERVAL_MS(2s) · STEAM_POLL_TIMEOUT_MS(40s)
- `src/mocks/handlers/steam.ts` — sync-status/skip/link mock(`/api-sync` 후 교체 예정)

## 라우트 호스트(진입 배선)

페이지 엔트리(`src/routes/`)가 위 컴포넌트·훅을 조립한다. 라우트 SSOT는 `routing.md`.
회원가입 완료(`SignupPage`) → `setSession`(자동 로그인) 후 `/onboarding/steam`(origin='steamSignup')로 진입한다.

| 라우트 | 권한 | 호스트 | 역할 |
|---|---|---|---|
| `/onboarding/steam` | Auth | `SteamOnboardingPage` | **단일 플로우** step('intro'\|'syncing'\|'result'). intro=SteamLinkInvite, syncing=SteamSyncLoading+폴링, result=Success/Private/Error inline 분기. 종료상태 도달 시 navigate 없이 step만 전환한다. |
| `/auth/steam/callback` | Technical | `SteamCallbackPage` | 정상 복귀=`/onboarding/steam`로 startPolling=true 이동(replace). ?error=`/onboarding/steam`에 합성 failed 결과(state.result) 전달 |

> `/onboarding/steam/result` 라우트는 **제거**됨 — 결과는 별도 라우트가 아니라 같은 페이지의 result step으로 렌더한다.
> 이전의 result↔로딩 cross-route 왕복이 냈던 "되돌이 버그"를 단일 페이지 + `runId` nonce로 구조적으로 제거했다.

### 화면 전이 요약

```
[가입 완료] ──▶ /onboarding/steam (intro, steamSignup 카피)

SteamLinkInvite ──onLink──▶ SteamSyncLoading ──(종료상태)──▶ (result step · 같은 페이지)
       │                          │
    onSkip(skip)              onCancel(→intro)
       ▼
   /survey/intro

result step:
  success → SteamSyncSuccess  ──설문/메인──▶ /survey/intro · /
  private → SteamSyncPrivate  ──다시시도(runId++ 재폴링)/설문──▶ syncing · /survey/intro
  failed  → SteamSyncError    ──동일──
  timeout → SteamSyncError
```

## mock 시나리오(?scenario)

`useSteamSyncStatus`/호스트에 `?scenario=`로 종료상태를 골라 검증한다(대소문자 무시).
mock은 0~2회 `IN_PROGRESS` 후 3회째부터 시나리오 종료상태를 돌려준다(카운터 자동 리셋).

| scenario | 결과 |
|---|---|
| (없음)·`SUCCESS` | 성공 · 147게임 · `My_Steam_ID` |
| `PRIVATE` | 라이브러리 비공개 |
| `FAILED` | 실패 |
| `TIMEOUT` | 타임아웃 |

예) `/onboarding/steam?scenario=private` → 잠깐 로딩 후 비공개 결과 화면.

## REQ 갭 / 보류 메모

진입 배선은 mock 개발용으로만 닫혀 있고, 아래 항목은 백엔드 계약 확정 시 채운다.

- **REQ-003 (스팀 인증 시작 방식)**: A안(백엔드 OpenID 위임) 가정. `handleLink`는 현재 즉시 폴링을 켜지만,
  운영에선 `STEAM_AUTH_START_URL`로 브라우저를 이동시키고 콜백(`/auth/steam/callback`)이 복귀하며 폴링을 시작하는 자리다.
  B안(FE가 steamId 직접 전달)으로 확정되면 `steamLink`/`useSteamLink`를 배선한다.
- **REQ-004 (폴링 타임아웃)**: 잠정 40초. 백엔드 평균 동기화 시간 확정 시 `STEAM_POLL_TIMEOUT_MS` 조정.
- **REQ-005 (link 응답 형태)**: mock(`steam_linked`/`steam_id`)과 service 파서를 통일해 둠. 미사용.
- **REQ-006 (sync-status 계약)**: `IN_PROGRESS|SUCCESS|PRIVATE|FAILED|TIMEOUT` 가정으로 매핑. 알 수 없는 값은 `failed`.
- **REQ-008**: (요구사항 문서 항목) 확정 시 반영.
- **진입 배선(가입→온보딩)**: ✅ 적용됨. `SignupPage` 가입 완료 시 `setSession`(자동 로그인 — `/onboarding/steam`이
  Auth 가드라 세션 선설정 필수) 후 `/onboarding/steam`(origin='steamSignup')로 이동한다.
  ⚠️ 이는 LOGIN-FE-005의 "가입 후 /login 수동 로그인" 결정을 자동 로그인으로 전환한 것이다(auth 영역 변경).
