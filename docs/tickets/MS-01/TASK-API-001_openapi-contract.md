# TASK-API-001: OpenAPI/Swagger 계약 합의

## 메타
- ID: TASK-API-001
- 타입: TASK
- 생성: 2026-05-29
- 상태: TODO
- 마일스톤: MS-01
- 브랜치: (미정)
- 분기 판별: cross (API 계약은 전역 영향)

---

## 인라인 룰 (이 작업에서 지킬 것만)

- `docs/03-api/openapi.json`은 백엔드 출처 — 합의 후 그 스키마로 교체, 직접 손편집 금지
- 자동 생성 파일(`src/types/api.ts`, `src/lib/api/`, `src/mocks/handlers/`)은 `/api-sync`로만 갱신
- Swagger 완성 전까지 `docs/requirements` 6장 데이터 모델 + 7장 API 훅 후보를 mock 기준으로 사용

---

## Spec (왜)

백엔드 Swagger가 제작 중이라 API 계약이 미정이다. 프론트 mock과 실제 API가 마지막에 충돌하면 비용이 크다. MSW 개발을 본격화하기 전에 최소 엔드포인트·인증 방식·에러 응답 형태를 백엔드 팀(4명)과 합의한다.

관련: REQ 13장 "기획 확인 필요 항목" (Steam 인증 방식 OpenID/OAuth 혼용, JWT 저장 위치, 성향 축 6개 정의, 매칭률 계산 기준 등)

---

## Plan (어떻게)

- Task 1: 백엔드 팀과 Swagger/OpenAPI URL 또는 파일 경로 확정
- Task 2: 인증 방식 확정 (JWT + httpOnly Cookie 기준, Steam OpenID/OAuth 플로우)
- Task 3: 공통 에러 응답 형태 확정 (status code, error body 구조)
- Task 4: 성향 6축 이름 + 점수 계산 응답 형태 합의 (TEND-FE-001 영향)
- Task 5: `docs/03-api/openapi.json` 갱신 기준 + `/api-sync` 사용 합의

---

## AC (Acceptance Criteria)

- [ ] 백엔드 Swagger/OpenAPI URL 또는 파일 경로 확정
- [ ] 인증 방식 확정 (쿠키 정책, 자동 로그인 만료 포함)
- [ ] 공통 에러 응답 형태 확정
- [ ] 성향 6축/매칭률 응답 스키마 합의
- [ ] 프론트 `docs/03-api/openapi.json` 갱신 기준 확정
- [ ] `docs/SSOT.md`의 "백엔드 API 기준" 섹션에 Swagger URL 반영

---

## 영향 파일 (예상)

- `docs/03-api/openapi.json` (백엔드 스키마로 교체)
- `docs/SSOT.md` (Swagger URL 갱신)
- (이후 /api-sync로) `src/types/api.ts`, `src/lib/api/*`, `src/mocks/handlers/*`

---

## Verification (자동 검증)

- [ ] `/api-sync` 실행 후 `pnpm type-check` 통과
- [ ] mock 핸들러가 REQ 데이터 모델과 정합

---

## 회고 (구현 후 채움)

- 실제로 한 일:
- 빗나간 점:
- 다음에 비슷한 거 할 때:
