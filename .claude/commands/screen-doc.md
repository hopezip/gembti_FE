---
description: 화면 정의서 작성. screen-doc 에이전트 호출. 사용법: /screen-doc <화면 설명>
---

`screen-doc` 에이전트를 호출.

## 절차
1. 자연어 입력 수신 (예: `/screen-doc 로그인 화면`)
2. screen-doc로 위임
3. `docs/screens/_TEMPLATE.md` 기반으로 다음 항목 채움:
   - 목적 (한 줄)
   - 진입 경로 (URL) + 접근 권한 (REQ 3.1 사용자 상태)
   - UI 컴포넌트 목록 (DESIGN_SYSTEM.md 컴포넌트명 사용)
4. `docs/screens/`에 저장
5. 사용자에게 검토 요청

(상세 동작은 `.claude/agents/screen-doc.md` 본문 정의)
