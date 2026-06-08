import { api } from '@/lib/ky';
import type { components } from '@/types/api';

// Steam 도메인 저수준 API 호출 함수 (/api-sync 산출물).
// 백엔드 실계약(2026-06-08 배포)에 맞춘 thin wrapper다. 응답 envelope({status,data}) 없이
// 스키마 본문을 그대로 반환한다(SteamLinkResponse / SteamStatusResponse).
// 에러 본문 파싱({detail})·도메인 매핑은 services 레이어(src/services/steam.ts)가 담당한다.
//
// 엔드포인트:
//   POST /api/v1/steam/link   → SteamLinkResponse   (Bearer 보호)
//   GET  /api/v1/steam/status → SteamStatusResponse
//
// 참고: OpenID 진입/콜백(GET /api/v1/auth/steam, /api/v1/auth/steam/callback)은
//   브라우저 302 redirect 흐름이라 fetch 함수로 호출하지 않는다(ky 대상 아님).

export type SteamLinkRequest = components['schemas']['SteamLinkRequest'];
export type SteamLinkResponse = components['schemas']['SteamLinkResponse'];
export type SteamStatusResponse = components['schemas']['SteamStatusResponse'];
export type SteamSyncStatus = components['schemas']['SteamSyncStatus'];

// 스팀 계정 연동. steam_id는 17자리 숫자 문자열(SteamID64).
export function linkSteam(body: SteamLinkRequest): Promise<SteamLinkResponse> {
  return api.post('api/v1/steam/link', { json: body }).json<SteamLinkResponse>();
}

// 현재 스팀 연동 상태 조회. 미연동이면 steam_linked=false + nullable 필드들이 null.
export function getSteamStatus(): Promise<SteamStatusResponse> {
  return api.get('api/v1/steam/status').json<SteamStatusResponse>();
}
