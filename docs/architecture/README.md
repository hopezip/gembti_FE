# architecture — 도메인 문서

> 도메인별 아키텍처 규칙. ticket-writer가 인라인 룰 추출 시 출처.

## 이 폴더의 책임
- 도메인별 핵심 규칙 (4~6줄로 요약 가능한 형태)
- 폴더/파일 위치
- 패턴 / 안티패턴

## 문서 목록

| 도메인 | 파일 |
|--------|------|
| API 클라이언트 | `api_client.md` |
| 데이터 패칭 (TanStack Query) | `data_fetching.md` |
| 상태관리 (Zustand) | `state_management.md` |
| 라우팅 (React Router) | `routing.md` |
| 컴포넌트 | `components.md` |
| 스타일링 (Panda CSS + Park UI) | `styling.md` |
| 인증 (JWT + httpOnly Cookie) | `auth.md` |
| 폼 (RHF + Zod) | `forms.md` |

## v2 활용

각 문서 상단의 "핵심 규칙" 섹션은 ticket-writer가 새 티켓 만들 때
4~6줄로 압축해서 티켓의 "인라인 룰" 섹션에 박습니다.

이 덕분에 ticket-implementer는 작업 중 도메인 문서를 다시 읽지 않고도
티켓만으로 자기완결적으로 작업 가능합니다.

## 관련 문서
- `../ARCHITECTURE.md` (전체 개요 + 도메인 지도)
- `../SSOT.md` (단일 진실)
- `../../docs/design/DESIGN_SYSTEM.md` (디자인 사양 — styling 출처)
