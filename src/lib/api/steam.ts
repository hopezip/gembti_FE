import { api } from '@/lib/ky';
import type { components } from '@/types/api';

// Steam 도메인 저수준 API 호출 함수 (/api-sync 산출물).
// 백엔드 실계약(2026-06-08 배포)에 맞춘 thin wrapper다. 응답 envelope({status,data}) 없이
// 스키마 본문을 그대로 반환한다(SteamLinkResponse / SteamStatusResponse).
// 에러 본문 파싱({detail})·도메인 매핑은 services 레이어(src/services/steam.ts)가 담당한다.
//
// 엔드포인트:
//   POST /api/v1/steam/link   → SteamLinkResponse   (Bearer 보호)
//
// ⚠️ MYPAGE-FE-011: 라이브 Swagger에서 GET /steam/status·POST /steam/sync·GET /steam/recently-played가
//   제거(404)됐다. 마이페이지 보유수/플레이시간은 GET /auth/me/activity로 이전했고, 수동 재동기화는
//   백엔드 대체 엔드포인트가 없어 기능을 제거했다(자동 동기화). 그래서 여기 status/sync wrapper도 삭제한다.
//
// 참고: OpenID 진입/콜백(GET /api/v1/auth/steam, /api/v1/auth/steam/callback)은
//   브라우저 302 redirect 흐름이라 fetch 함수로 호출하지 않는다(ky 대상 아님).

export type SteamLinkRequest = components['schemas']['SteamLinkRequest'];
export type SteamLinkResponse = components['schemas']['SteamLinkResponse'];
export type SteamSyncStatus = components['schemas']['SteamSyncStatus'];

// 스팀 계정 연동. steam_id는 17자리 숫자 문자열(SteamID64).
export function linkSteam(body: SteamLinkRequest): Promise<SteamLinkResponse> {
  return api
    .post('api/v1/steam/link', { json: body })
    .json<SteamLinkResponse>();
}
