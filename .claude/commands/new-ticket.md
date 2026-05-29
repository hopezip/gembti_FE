---
description: 새 티켓 생성. v2 통합 양식 (spec+plan+회고). 사용법: /new-ticket <자연어 설명>
---

`ticket-writer` 에이전트를 호출.

## 절차
1. 자연어 입력 수신
2. ticket-writer로 위임
3. v2 통합 양식 적용:
   - 메타데이터 (REQ 기능 ID 추적자 우선)
   - 인라인 룰 (해당 도메인 architecture에서 4~6줄)
   - Spec
   - Plan
   - AC
   - 영향 파일
   - Verification
   - 회고 (빈 상태)
4. `docs/tickets/MS-NN/<티켓-ID>_<설명>.md`에 저장 (마일스톤 사용)
5. 사용자에게 검토 요청

(상세 동작은 04 모듈에서 ticket-writer v2 본문 정의)
