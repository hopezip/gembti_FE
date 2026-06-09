# features/onboarding

스팀 연동 온보딩 도메인(STEAM-INTER-FE-001, 006 실계약 정합). 이메일/스팀 가입 직후
Steam 라이브러리를 연동해 플레이 데이터를 가져오고, 설문으로 이어지는 흐름을 담는다.

다크·데스크탑 전용. 색은 semantic token만 사용한다.

## 구조

```
features/onboarding/
├── types.ts                      도메인 타입 SSOT(데이터·프리젠테이션·호스트 공유)
├── components/                    순수 프리젠테이션(내부 fetch/navigate/useQuery 금지)
│   ├── SteamBenefitList.tsx       하단 benefits 3열(index/title/desc)
│   ├── SteamLinkInvite.tsx        화면1·2 연동 유도. origin('emailSignup'|'steamSignup')별 카피/배지/benefits 분기
│   ├── SteamSyncLoading.tsx       화면3 동기화 진행. accent 스피너 + 경과초 + 취소
│   ├── SteamSyncSuccess.tsx       화면4 성공. 연동 완료(+아바타) + 설문 시작(주)/메인(보조)
│   ├── SteamSyncEmpty.tsx         보유 게임 0개(sync_status='empty'). 게임 없음 안내 + 설문 시작(주)/메인(보조)
│   ├── SteamSyncPrivate.tsx       화면5 라이브러리 비공개. 공개 가이드 4스텝 + 다시 시도/설문 진행
│   └── SteamSyncError.tsx         화면6 실패 공용(클라 타임아웃도 failed로 합성). 원인 3박스 + 다시 시도/설문 진행
└── api/                           데이터레이어(TanStack Query 훅)
    └── steamSyncStatus.ts         useSteamSyncStatus(enabled, scenario?, runId?) — 2초 폴링, 종료상태 시 중단, 40s 타임아웃(→failed 합성), runId nonce로 세션별 캐시 분리
```

연동 서비스/설정/mock은 도메인 밖에 있다:
- `src/services/steam.ts` — getSyncStatus(SteamStatusResponse→도메인 매핑, sync_status=null→'syncing', SteamSyncError)
- `src/lib/api/steam.ts` — getSteamStatus/linkSteam 저수준 thin wrapper(/api-sync 산출물, 단발 호출용)
- `src/config/steam.ts` — STEAM_AUTH_START_URL(API 베이스+/api/v1/auth/steam) · STEAM_POLL_INTERVAL_MS(2s) · STEAM_POLL_TIMEOUT_MS(40s)
- `src/mocks/handlers/steam.ts` — auth/steam·steam/link·steam/status mock(status는 폴링 시뮬)

## 백엔드 계약 (실계약, STEAM-INTER-FE-006 정합)

`GET /api/v1/steam/status` → `steam_linked`/`steam_id_64?`/`steam_avatar_url?`/`steam_sync_status?`/`last_synced_at?`
- `SteamSyncStatus` enum = `success | private | failed | empty`
- `steam_sync_status === null` → 도메인 `'syncing'`(폴링 지속). 그 외는 종료 상태.
- 백엔드는 보유 게임 수(found_games)·닉네임·timeout·skip을 제공하지 않는다.

## 라우트 호스트(진입 배선)

페이지 엔트리(`src/routes/`)가 위 컴포넌트·훅을 조립한다. 라우트 SSOT는 `routing.md`.
회원가입 완료(`SignupPage`) → `setSession`(자동 로그인) 후 `/onboarding/steam`(origin='steamSignup')로 진입한다.

| 라우트 | 권한 | 호스트 | 역할 |
|---|---|---|---|
| `/onboarding/steam` | Auth | `SteamOnboardingPage` | **단일 플로우** step('intro'\|'syncing'\|'result'). intro=SteamLinkInvite, syncing=SteamSyncLoading+폴링, result=Success/Empty/Private/Error inline 분기. 종료상태 도달 시 navigate 없이 step만 전환한다. |
| `/auth/steam/callback` | Technical | `SteamCallbackPage` | 정상 복귀=`/onboarding/steam`로 startPolling=true 이동(replace). ?error=`/onboarding/steam`에 합성 failed 결과(state.result) 전달 |

> `/onboarding/steam/result` 라우트는 **제거**됨 — 결과는 별도 라우트가 아니라 같은 페이지의 result step으로 렌더한다.
> 이전의 result↔로딩 cross-route 왕복이 냈던 "되돌이 버그"를 단일 페이지 + `runId` nonce로 구조적으로 제거했다.

### 화면 전이 요약

```
[가입 완료] ──▶ /onboarding/steam (intro, steamSignup 카피)

SteamLinkInvite ──onLink──▶ SteamSyncLoading ──(종료상태)──▶ (result step · 같은 페이지)
       │                          │
    onSkip(navigate)          onCancel(→intro)
       ▼
   /survey/intro

result step:
  success → SteamSyncSuccess  ──설문/메인──▶ /survey/intro · /
  empty   → SteamSyncEmpty    ──설문/메인──▶ /survey/intro · /
  private → SteamSyncPrivate  ──다시시도(runId++ 재폴링)/설문──▶ syncing · /survey/intro
  failed  → SteamSyncError    ──동일── (클라 타임아웃도 failed로 합성)
```

## mock 시나리오(?scenario)

호스트/`useSteamSyncStatus`에 `?scenario=`로 종료상태를 골라 검증한다.
mock은 처음 한 틱 `sync_status=null`(진행중) 후 다음 틱부터 시나리오 종료상태를 돌려준다(카운터 자동 리셋).

| scenario | 결과 |
|---|---|
| (없음)·`success` | 성공 |
| `private` | 라이브러리 비공개 |
| `failed` | 실패 |
| `empty` | 보유 게임 0개 |
| `unlinked` | 미연동(즉시 반환) |

예) `/onboarding/steam?scenario=private` → 잠깐 로딩 후 비공개 결과 화면.

## 보류 메모

- **REQ-003 (스팀 인증 시작)**: A안(백엔드 OpenID 위임) 확정. `SteamButton`이 `STEAM_AUTH_START_URL`로 이동 → 백엔드가
  Steam OpenID로 리다이렉트 → 콜백(`/auth/steam/callback`)이 `/onboarding/steam`으로 복귀하며 폴링을 시작한다.
- **REQ-004 (폴링 타임아웃)**: 잠정 40초. 백엔드 평균 동기화 시간 확정 시 `STEAM_POLL_TIMEOUT_MS` 조정. 초과 시 `failed`로 합성.
- **보유 게임 수**: 백엔드 status/link가 제공하지 않아 성공 화면에서 숫자 표기를 제거함. 게임 수 API 제공 시 헤딩에 복원.
- **마이페이지 Steam 카드**: 별도 mock(`/api/mypage/steam/*`)을 사용 중 — 실계약(steam/status) 정합은 별도 티켓.
- **진입 배선(가입→온보딩)**: ✅ 적용됨. `SignupPage` 가입 완료 시 `setSession`(자동 로그인 — `/onboarding/steam`이
  Auth 가드라 세션 선설정 필수) 후 `/onboarding/steam`(origin='steamSignup')로 이동한다.
