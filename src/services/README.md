# services

**선택적** 도메인 서비스 레이어 자리.

- **단순 도메인**: hook이 `lib/api`(자동 생성 저수준 호출)를 직접 호출 → services 불필요.
- **복잡한 조합**: 여러 `lib/api` 호출 조합·변환·도메인 규칙이 필요할 때만 services 경유.

`lib/api`(자동 생성 저수준 HTTP 호출)와 역할이 다르다. services는 수동 작성 도메인 레이어다.

## ky 직접 호출 (도메인 레이어)

`lib/api` 생성 조합 대신, auth/steam 도메인은 `src/lib/ky.ts`를 직접 호출한다(api_client.md).
타입은 자동생성물(`src/types/api.ts`)에서 가져와 매핑만 한다(자동생성물 직접 편집 금지 원칙 유지).

- `auth.ts` — `login()`/`signup()`/`sendEmailCode()`/`verifyEmail()`/`refresh()`/`logout()`/`getMe()` (LOGIN-FE-006, 실서버 GEMBTI_API 정합). `api/v1/auth/*`를 ky로 직접 호출. **access=메모리 Bearer + refresh=httpOnly 쿠키**(ky가 `credentials:'include'`·401 refresh 전담). 응답 envelope 없음 — `AuthResponse`/`AccessTokenResponse`/`UserResponse`를 도메인(camel)으로 매핑, 에러는 `{detail}` 파싱. `signup`은 전체 필드(약관 2개·gender·birth_date 포함) 직접 전송(signup_token 폐기).
- `steam.ts` — `getSyncStatus()`/`skipSteam()`/`steamLink()`. `api/v1/steam/*`를 ky로 직접 호출(STEAM-INTER-FE-001). sync_status(UPPER_SNAKE)→도메인(kebab) 매핑. 백엔드 미구현이라 MSW mock으로 동작(auth와 달리 passthrough 아님). `steamLink`는 REQ-003 A안이라 미사용 스켈레톤.
