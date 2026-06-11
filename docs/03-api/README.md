# docs/03-api

> API 계약 단일화 영역. 백엔드 확정 미러 + 프론트 임시 계약을 병합해 단일 타입(`src/types/api.ts`)으로 수렴한다.

## 이 폴더의 책임

API "진실(엔드포인트 계약)"의 입력 출처를 **확정/임시 두 파일로 물리 분리**해 서로 부수지 않게 한다(TASK-DEVEX-018).

## 3파일 책임표

| 파일 | 책임 | 작성 주체 | 갱신 방식 | 편집 허용 |
|---|---|---|---|---|
| `openapi.json` | 백엔드 **확정** 미러 (auth/steam 등) | `/api-sync` (자동) | 통째 교체 | ❌ 직접 편집 금지 |
| `openapi.draft.json` | 프론트 **임시** 계약 (`x-status: frontend-draft`) | 사람 (수동) | 보존·점진 삭제 | ✅ **수동 작성 허용** |
| `.openapi.merged.json` | 병합 중간 산물 | `merge-openapi.mjs` | 빌드시 재생성 | ❌ (gitignore, 손대지 않음) |

> `openapi.draft.json`은 이 폴더에서 **유일하게 사람이 손으로 작성·편집하는 파일**이다.
> 미확정 도메인(games/home/survey/recommendations/mypage/users)을 OpenAPI 3 형식으로 적고,
> 모든 path에 `x-status: frontend-draft` 부여 + 경로는 `api/v1/`로 통일한다.

## 파이프라인

```
백엔드 Swagger ──/api-sync──▶ openapi.json ┐
                                            ├─ merge-openapi.mjs ─▶ .openapi.merged.json
사람 작성 ─────────────────▶ openapi.draft.json ┘                         │
                                                          pnpm api:gen / codegen
                                                          (openapi-typescript)
                                                                          ▼
                                                              src/types/api.ts (단일 타입 진실)
```

- 병합 명령: `node scripts/merge-openapi.mjs` (단독) / `pnpm api:gen` (병합 + 타입 생성)
- `pnpm codegen`(= `panda codegen` + 병합 + 타입 생성)이 `dev`/`build`/`type-check`/`prepare`에 포함되어 자동 실행된다.
- 병합 규칙: `paths`/`components.schemas`를 **얕은 병합**. 같은 path/schema가 양쪽에 있으면 **`openapi.json`(확정) 우선**으로 덮고 stderr에 경고. draft가 없으면 `openapi.json`만 복사.

## 전환 흐름 (임시 → 확정)

백엔드가 한 도메인 Swagger를 확정하면:
1. `/api-sync`로 `openapi.json` 갱신
2. 해당 path를 `openapi.draft.json`에서 **삭제**
3. 병합 결과에서 자동으로 `openapi.json` 쪽이 진실이 됨(도메인 단위 이사)

목표 종착: `openapi.draft.json`이 비워지면 = 전면 `/api-sync` 체제 완성.

## 작업 규칙

- `openapi.json` — **직접 편집 금지**(Claude도 사용자도). 동기화는 `/api-sync`만.
- `openapi.draft.json` — **사람이 수동 작성 허용**(이 예외가 TASK-DEVEX-018에서 명문화됨). 단 `x-status: frontend-draft` + `api/v1/` 프리픽스 규칙을 지킨다.
- `.openapi.merged.json` — 빌드 중간 산물(gitignore). 직접 편집·커밋 금지.
- `src/types/api.ts` — 자동 생성물. 직접 편집 금지(`api:gen` 재생성으로만 갱신).

## 관련 문서

- `../architecture/api_client.md` (API 호출/MSW 동기화 흐름·자동 생성물 보호 규칙)
- `../SSOT.md` (백엔드 API 기준)
- `../DEVELOPMENT.md` (API 동기화 워크플로우)
