import { HTTPError } from 'ky';
import { api } from '@/lib/ky';

// 인증 도메인 서비스 레이어.
// ⏳ Swagger 미완 상태라 한시적으로 lib/ky로 직접 호출한다(api_client.md).
//   백엔드 계약 확정 후 /api-sync로 생성되는 src/lib/api/auth 조합으로 교체한다
//   (이 파일에 저수준 호출을 남기지 않는다).
//
// 인증은 httpOnly Cookie 전제(auth.md): 토큰 문자열을 직접 다루지 않는다.
//   ky 인스턴스(src/lib/ky.ts)가 credentials:'include'로 쿠키를 자동 전송/수신하며,
//   Authorization 헤더를 클라이언트에서 조립하지 않는다.

// 로그인 응답 사용자 — 자동 생성물(src/types/api.ts) 직접 편집 금지라 한시적 로컬 정의.
// 계약 확정 시 생성 타입으로 교체한다.
export interface AuthUser {
  id: string;
  nickname: string;
}

export interface LoginResponse {
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// 로그인 실패 유형 — 폼 레벨 에러 메시지 분기에 사용한다.
// - 'invalid-credentials': 401(ERROR-FE-003) — 잘못된 자격증명
// - 'generic': 그 외 4xx/5xx/네트워크 — 재시도 가능한 일반 오류
export type LoginErrorKind = 'invalid-credentials' | 'generic';

export class LoginError extends Error {
  readonly kind: LoginErrorKind;

  constructor(kind: LoginErrorKind) {
    super(kind);
    this.name = 'LoginError';
    this.kind = kind;
  }
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    return await api
      .post('api/auth/login', { json: payload })
      .json<LoginResponse>();
  } catch (error) {
    // 401은 잘못된 자격증명, 그 외는 일반 오류로 정규화한다.
    if (error instanceof HTTPError && error.response.status === 401) {
      throw new LoginError('invalid-credentials');
    }
    throw new LoginError('generic');
  }
}
