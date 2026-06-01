# services

**선택적** 도메인 서비스 레이어 자리.

- **단순 도메인**: hook이 `lib/api`(자동 생성 저수준 호출)를 직접 호출 → services 불필요.
- **복잡한 조합**: 여러 `lib/api` 호출 조합·변환·도메인 규칙이 필요할 때만 services 경유.

`lib/api`(자동 생성 저수준 HTTP 호출)와 역할이 다르다. services는 수동 작성 도메인 레이어다.

## 한시적 ky 직접 호출 (Swagger 미완 동안)

`lib/api` 생성물이 아직 없으므로, 일부 도메인은 한시적으로 `src/lib/ky.ts`를 직접 호출한다(api_client.md).
Swagger 확정 후 `/api-sync`로 생성되는 `lib/api` 조합으로 교체하고, services에 저수준 호출을 남기지 않는다.

- `auth.ts` — `login()`. `POST api/auth/login`을 ky로 직접 호출(LOGIN-FE-001). 쿠키 인증 전제(credentials는 ky 인스턴스가 담당).
