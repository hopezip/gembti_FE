# docs/screens

> 화면 정의서. 티켓 만들기 전 화면 단위로 명세.

## 이 폴더의 책임
- 화면별 사양 (와이어, AC, 상태 분기)
- 티켓 생성의 입력

## 폴더 내용
- `_TEMPLATE.md` — 화면 정의서 양식
- `<screen-name>.md` — 개별 화면 정의서 (티켓 구현하며 누적)

## 작업 규칙
- 새 화면 시작 시 `_TEMPLATE.md` 복사
- 또는 `/screen-doc <설명>` 명령으로 자동 생성
- 와이어프레임 원본은 `docs/design/` 사양과 18개 페이지 매핑(DESIGN_SYSTEM.md 7장) 참조

## 관련 문서
- `../tickets/README.md` (티켓이 화면 정의서를 참조)
- `../../docs/design/DESIGN_SYSTEM.md` (페이지↔컴포넌트 매핑)
