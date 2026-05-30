# services

**선택적** 도메인 서비스 레이어 자리.

- **단순 도메인**: hook이 `lib/api`(자동 생성 저수준 호출)를 직접 호출 → services 불필요.
- **복잡한 조합**: 여러 `lib/api` 호출 조합·변환·도메인 규칙이 필요할 때만 services 경유.

`lib/api`(자동 생성 저수준 HTTP 호출)와 역할이 다르다. services는 수동 작성 도메인 레이어다.
