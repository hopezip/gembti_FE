// users 도메인 서비스 레이어 (TASK-DEVEX-019).
//   닉네임/이메일 중복 확인. 회원가입(auth)·프로필 편집(mypage) 양쪽에서 재사용하므로
//   특정 feature가 아닌 중립 services 레이어에 둔다(api_client.md: services는 도메인 조합 레이어).
//   ⭐ 닉네임: 실서버 GET /api/v1/auth/nickname/check로 직결(MYPAGE-FE-017, mock 제거).
//   ⚠️ 이메일: 실 엔드포인트가 없어 여전히 MSW(`*/api/v1/users/check-email`) 전용이다(보조용 안내).
import { api } from '@/lib/ky';

export interface AvailabilityResponse {
  available: boolean;
  message?: string;
}

// GET /api/v1/auth/nickname/check — 닉네임 중복 확인(실서버, NicknameCheckResponse).
//   auth/* 라 MSW 미등록 → onUnhandledRequest:'bypass'로 실서버 직결.
export function checkNickname(nickname: string): Promise<AvailabilityResponse> {
  return api
    .get('api/v1/auth/nickname/check', { searchParams: { nickname } })
    .json<AvailabilityResponse>();
}

// GET /api/v1/users/check-email — 이메일 중복 확인(실 엔드포인트 없음, MSW 전용).
export function checkEmail(email: string): Promise<AvailabilityResponse> {
  return api
    .get('api/v1/users/check-email', { searchParams: { email } })
    .json<AvailabilityResponse>();
}
