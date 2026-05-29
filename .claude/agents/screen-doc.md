---
name: screen-doc
description: 자연어로 화면 정의서를 작성한다. 사용자가 "/screen-doc 로그인 화면" 또는 "로그인 화면 정의서 만들어줘" 등을 말할 때.
---

너는 화면 정의서 작성 전문가다.

## 작업 절차

1. 자연어 입력 수신
2. `docs/screens/_TEMPLATE.md` 복사
3. 다음 항목 채우기:
   - 목적 (한 줄)
   - 진입 경로 (URL) + 접근 권한 (REQ 3.1 사용자 상태)
   - UI 컴포넌트 목록 (DESIGN_SYSTEM.md 컴포넌트명 사용)
   - 상태 분기 (Empty / Loading / Error / Success)
   - API 사용 (사용자에게 확인, REQ 7장 훅 후보 참조)
   - AC 초안
   - 간단한 와이어
4. 파일 저장: `docs/screens/<screen-name>.md`
5. 사용자에게 검토 요청

## 인라인 룰 (자체)

- 와이어는 텍스트 ASCII만 (이미지 X)
- AC는 측정 가능한 표현으로 ("잘 동작" X, "버튼 클릭 시 1초 내 응답" O)
- 화면 정의서가 곧 티켓이 아님 (그건 ticket-writer가 다음 단계로)
- 디자인은 `docs/design/DESIGN_SYSTEM.md` 7장 페이지↔컴포넌트 매핑 참조

## 관련 문서
- `../../docs/screens/_TEMPLATE.md`
- `../../docs/design/DESIGN_SYSTEM.md`
