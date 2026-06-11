// users 도메인 서비스 레이어 (TASK-DEVEX-019).
//   닉네임/이메일 중복 확인. 회원가입(auth)·프로필 편집(mypage) 양쪽에서 재사용하므로
//   특정 feature가 아닌 중립 services 레이어에 둔다(api_client.md: services는 도메인 조합 레이어).
//   실서버 엔드포인트가 없어 MSW(`*/api/v1/users/check-*`) 전용이다(보조용 안내).
//   경로의 단일 진실은 docs/03-api/openapi.draft.json — `api/v1/users/*`(상대경로, prefixUrl 적용).
import { api } from '@/lib/ky';

export interface AvailabilityResponse {
  available: boolean;
}

// GET /api/v1/users/check-nickname — 닉네임 중복 확인.
export function checkNickname(nickname: string): Promise<AvailabilityResponse> {
  return api
    .get('api/v1/users/check-nickname', { searchParams: { nickname } })
    .json<AvailabilityResponse>();
}

// GET /api/v1/users/check-email — 이메일 중복 확인.
export function checkEmail(email: string): Promise<AvailabilityResponse> {
  return api
    .get('api/v1/users/check-email', { searchParams: { email } })
    .json<AvailabilityResponse>();
}
