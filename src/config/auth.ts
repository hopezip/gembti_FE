// 인증 도메인 설정 상수 (LOGIN-FE-006).
// "한 곳에서 갈아끼울" auth 관련 값의 단일 출처.

// 이메일 인증 코드 유효시간(초). STEP2 카운트다운 타이머 초기값.
//   ⚠️ 백엔드 send-code 응답에 expires_in이 없어(GEMBTI_API 계약) FE 상수로 둔다.
//   서버 실제 TTL이 확정되면 이 값만 맞춘다(타이머는 표시용이고, 만료 판별은 서버 verify가 담당).
export const EMAIL_CODE_TTL_SECONDS = 300;
