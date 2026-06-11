# API 명세 단일화 설계 — openapi.json/draft 분리 + 병합 하네스

> 작성일: 2026-06-11
> 추적자: TASK-DEVEX-018
> 상태: 설계 승인 대기

## 1. 문제 정의

프로젝트의 "API 진실(엔드포인트 계약)"이 세 곳에 흩어져 서로 충돌한다.

| 출처 | 내용 | 상태 |
|---|---|---|
| `docs/03-api/openapi.json` | auth 7 + steam 4 = **11개만** | 백엔드 Swagger 미완성·신뢰 불가 |
| `docs/requirements/FE_REQUIREMENTS_FOR_CLAUDE_CODE.md` 6·7장 | 데이터모델 + API 훅 후보 | 잘못 작성됨(원인) |
| 코드에 박힌 **34개 경로** (mock + services) | 실제 호출/mock | 위 둘과 어긋남, mypage/users는 `v1` 프리픽스 없음 |

근본 원인: **"백엔드 확정분"과 "프론트가 임시로 지어낸 것"이 구분 없이 섞여서**, 잘못된 requirements 6·7장을 기준으로 mock이 표류했다. 단일 진실(SSOT)이 확정된 적이 없다.

비목표(Non-goal): 백엔드 Swagger 자체 수정은 백엔드 몫이며 이 작업 범위가 아니다. `/api-sync` 본격 가동도 Swagger 완성 후로 미룬다.

## 2. 해결 방향

API 진실을 **프론트 주도로 한 파이프라인에 수렴**시키되, 자동(백엔드)과 수동(프론트 임시) 입력을 **물리적으로 분리**해 서로 부수지 않게 한다.

### 2.1 파일 구조 (분리)

| 파일 | 책임 | 작성 주체 | 갱신 방식 |
|---|---|---|---|
| `docs/03-api/openapi.json` | 백엔드 **확정** 미러 | `/api-sync` (자동) | 통째 교체 |
| `docs/03-api/openapi.draft.json` | 프론트 **임시** 계약 (`x-status: frontend-draft`) | 사람 (수동) | 보존·점진 삭제 |
| `.openapi.merged.json` | 빌드 중간 산물 | `merge-openapi.mjs` | gitignore |

분리 이유: `/api-sync`는 `openapi.json`을 통째 덮어쓴다. 임시 계약을 같은 파일에 두면 백엔드가 auth/steam을 갱신해 api-sync를 돌리는 순간 프론트 draft가 소실된다.

### 2.2 하네스(파이프라인)

```
백엔드 Swagger ──/api-sync──▶ openapi.json ┐
                                            ├─ merge-openapi.mjs ─▶ .openapi.merged.json
사람 작성 ─────────────────▶ openapi.draft.json ┘                         │
                                                              pnpm api:gen (openapi-typescript)
                                                                          ▼
                                                              src/types/api.ts  (단일 타입 진실)
                                                               │                │
                                                    (LLM 생성)  ▼                ▼  (LLM 생성)
                                                  src/lib/api/*.ts      src/mocks/handlers/*.ts
                                                               └────────┬───────┘
                                                                        ▼
                                                          src/features/*, src/routes/*
```

진실은 항상 **병합 결과 → `src/types/api.ts`** 한 줄기. 입력만 둘로 분리.

### 2.3 도메인 배치

| 도메인 | 엔드포인트 수 | 거처 |
|---|---|---|
| auth, steam | 11 (스웨거 있음) | `openapi.json` (확정) |
| games, home, survey, recommendations | 코드엔 있으나 스웨거 없음 | `openapi.draft.json` (임시) |
| mypage, users | 코드에 `/api/...`(v1 없음)로 박힘 | `openapi.draft.json` (임시) + 경로 `api/v1/`로 통일 |

### 2.4 전환 흐름 (임시 → 확정)

백엔드가 한 도메인 Swagger를 확정하면:
1. `/api-sync`로 `openapi.json` 갱신
2. 해당 path를 `openapi.draft.json`에서 **삭제**
3. 병합 결과에서 자동으로 `openapi.json` 쪽이 진실이 됨 (도메인 단위 이사)

목표 종착: draft가 비워지면 = 전면 `/api-sync` 체제 완성.

## 3. 작업 범위 (cross 영역 — 티켓+PR)

### 이번 티켓 (TASK-DEVEX-018) 핵심

1. **requirements 도려내기** — `FE_REQUIREMENTS...md`의 6·7장(API 명세)만 제거. 기능 88개 목록·기능 ID 체계는 **유지**.
2. **`openapi.draft.json` 작성** — 미확정 도메인(games/home/survey/recommendations/mypage/users)을 현재 mock에서 역추출 + 경로 `api/v1/`로 통일 + `x-status: frontend-draft` 부여.
3. **병합 하네스** — `scripts/merge-openapi.mjs` 추가. `package.json`의 `api:gen`을 `node scripts/merge-openapi.mjs && openapi-typescript .openapi.merged.json -o src/types/api.ts`로 교체. `.openapi.merged.json`을 `.gitignore`에 추가.
4. **문서·룰 갱신** — `docs/architecture/api_client.md`, `docs/03-api/README.md`, `CLAUDE.md`의 "openapi.json 직접 편집 금지" 규칙에 **`openapi.draft.json`은 수동 작성 허용** 예외를 명문화.

### 후속 티켓으로 분리 (PR 비대화 방지)

5. **코드 34경로 정렬** — mypage 라우트의 인라인 `fetch`를 `src/lib/api/`로 추출, draft 기준 경로 일치. 별도 티켓(예: TASK-DEVEX-019).

## 4. 검증

- `pnpm api:gen` 실행 → 병합 성공 + `src/types/api.ts` 생성 확인
- `pnpm type-check` 통과
- `pnpm build` 통과
- `openapi.draft.json`의 모든 path가 `x-status: frontend-draft` 보유 + `api/v1/` 프리픽스 통일 확인
- 기능 88개 목록이 `FE_REQUIREMENTS...md`에 그대로 남아있는지 확인 (도려내기가 기능 정의를 건드리지 않음)

## 5. 위험 / 주의

- `merge-openapi.mjs`는 두 파일의 `paths`/`components.schemas`를 얕은 병합한다. 키 충돌(같은 path가 양쪽에 존재) 시 **`openapi.json`(확정) 우선**으로 덮고 경고를 출력한다 — 확정분이 임시분을 이기는 게 전환 규칙과 일치.
- `FE_REQUIREMENTS...md`는 gitignore 대상이 아니다(기능 SSOT). 6·7장 제거는 커밋된다 — 제거 전 해당 장 범위를 정확히 식별해야 한다(기능 목록과 섞여 있지 않은지 확인).
- 티켓 파일(`docs/tickets/**`)은 gitignore이므로 커밋 대상이 아니다.
