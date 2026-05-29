---
description: 새 브랜치 수동 생성. 사용법: /branch <티켓-ID>
---

`git-branching` 스킬 수동 호출.

## 사용 예
```
/branch LOGIN-FE-001
→ feature/LOGIN-FE-001-<제목>으로 자동 생성
```

## 절차
1. 인자(티켓 ID) 분석
2. `git-branching` 스킬로 위임
3. 결과 보고

> 풀팀 모드라 티켓 ID 없는 micro 브랜치는 만들지 않습니다.
