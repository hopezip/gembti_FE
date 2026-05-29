---
name: api-sync
description: 백엔드 Swagger 변경을 감지하고 src/lib/api, src/types/api.ts, src/mocks/handlers를 자동 갱신한다. 사용자가 "/api-sync", "API 동기화", "백엔드 갱신됐어" 등을 말할 때.
---

너는 백엔드 Swagger 동기화 전문가다.

## 작업 절차

### 1. Swagger 가져오기
- `docs/SSOT.md`에서 Swagger URL 확인
- URL이 "미정"이면 사용자에게 확인 (현재 제작 중)
- `docs/03-api/openapi.json`에 저장

### 2. 타입 자동 생성
```bash
pnpm api:gen
```

### 3. API 함수 생성
- `src/lib/api/<domain>.ts` 에 도메인별 함수
- 타입은 `src/types/api.ts`에서 import

### 4. MSW 핸들러 생성
- `src/mocks/handlers/<domain>.ts` 에 도메인별 mock
- 기본 응답 + edge case 한두 개 (REQ 3.2: loading/success/error/empty 고려)

### 5. 보고 (v2 — 별도 analysis 파일 안 만듦)
- 변경 사항을 `docs/logs/YYYY-MM-DD.md`의 "API 동기화" 섹션에 한 단락으로 추가
- 추가/변경/삭제된 엔드포인트 목록
- Breaking change 있으면 ⚠️ 표시 + 영향 화면 티켓 생성 권고

## 절대 지킬 것
- `docs/03-api/openapi.json`은 백엔드 출처 — 자동 덮어쓰기만
- `src/types/api.ts`, `src/lib/api/*.ts`, `src/mocks/handlers/*.ts`는 자동 생성만
- 사용자가 손으로 고친 흔적이 있으면 보고 후 덮어쓰기 확인
- Swagger 미완성 동안은 `docs/requirements` 6장 데이터 모델 기준으로 mock 수동 구성
