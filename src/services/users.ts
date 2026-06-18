// users 도메인 서비스 레이어 (TASK-DEVEX-019).
//   닉네임/이메일 중복 확인. 회원가입(auth)·프로필 편집(mypage) 양쪽에서 재사용하므로
//   특정 feature가 아닌 중립 services 레이어에 둔다(api_client.md: services는 도메인 조합 레이어).
//   ⭐ 닉네임: 실서버 GET /api/v1/auth/nickname/check로 직결(MYPAGE-FE-017, mock 제거).
//   ⚠️ 이메일: 실 엔드포인트가 없어 여전히 MSW(`*/api/v1/users/check-email`) 전용이다(보조용 안내).
import { HTTPError } from 'ky';
import { api } from '@/lib/ky';

export interface AvailabilityResponse {
  available: boolean;
  message?: string;
}

// GET /api/v1/auth/nickname/check — 닉네임 중복 확인(실서버, NicknameCheckResponse).
//   auth/* 라 MSW 미등록 → onUnhandledRequest:'bypass'로 실서버 직결.
//   ⚠️ 서버는 이미 사용 중인 닉네임에 200 {available:false}가 아니라 409 Conflict를 던진다.
//   → 409를 {available:false}로 정규화해 호출부가 '중복'으로 인식하게 한다(미정규화 시 에러로
//      흘러가 결과가 사라짐, LOGIN-FE-017). 그 외 에러(400/422/네트워크)는 호출부가 처리하도록 throw.
export async function checkNickname(
  nickname: string,
): Promise<AvailabilityResponse> {
  try {
    return await api
      .get('api/v1/auth/nickname/check', { searchParams: { nickname } })
      .json<AvailabilityResponse>();
  } catch (error) {
    if (error instanceof HTTPError && error.response.status === 409) {
      return { available: false };
    }
    throw error;
  }
}

// GET /api/v1/users/check-email — 이메일 중복 확인(실 엔드포인트 없음, MSW 전용).
export function checkEmail(email: string): Promise<AvailabilityResponse> {
  return api
    .get('api/v1/users/check-email', { searchParams: { email } })
    .json<AvailabilityResponse>();
}
