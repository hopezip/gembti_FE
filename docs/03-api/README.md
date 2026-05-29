# docs/03-api

> 백엔드 Swagger 미러. 자동 동기화 영역.

## 이 폴더의 책임
- `openapi.json` 보관 (단일 소스)
- 백엔드 갱신 시 `/api-sync`로 동기화

## 폴더 내용
- `openapi.json` — 백엔드 Swagger (자동 갱신, 현재 제작 중이라 아직 없음)

## 작업 규칙
- **직접 편집 금지** (Claude도 사용자도)
- 동기화 명령: `/api-sync`
- 갱신 흐름: 백엔드 알림 → `/api-sync` → 변경 사항을 일일 로그(`docs/logs/`)에 자동 기록
- Swagger 미완성 동안: `docs/requirements` 6장 데이터 모델 + 7장 API 훅 후보가 mock 기준

## 관련 문서
- `../SSOT.md` (백엔드 API 기준)
- `../DEVELOPMENT.md` (API 동기화 워크플로우)
