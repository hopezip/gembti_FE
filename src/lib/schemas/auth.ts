import { z } from 'zod';

// 인증 폼 Zod 스키마 모음 (forms.md: 스키마는 src/lib/schemas/에 모으고 컴포넌트 인라인 정의 금지).
// 에러 메시지는 한국어로 정의한다.
// LOGIN-FE-006: 실서버(GEMBTI_API) 계약 정합 —
//   비밀번호 10자↑ + 특수문자 필수 / 닉네임 2~8자 / 성별 male|female|other / STEP1 약관 2개.

// 로그인 폼 스키마 (screens/login.md Zod 안 그대로).
// 비밀번호는 "필수"만 검증한다 — 형식은 회원가입에서만 강제하고, 로그인은 서버 401로 판별한다.
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// 회원가입 비밀번호 규칙 — 화면(PasswordRules)과 스키마가 같은 출처를 보도록 공유한다.
// 필수: 10자 이상 + 특수문자 1개 이상 (GEMBTI_API SignupRequest: minLength 10).
//   ⚠️ 특수문자 필수는 OpenAPI 스키마에 없는 프로빙 발견 규칙이다(project_auth_backend_contract).
//      백엔드가 규칙을 바꾸면 이 검증과 어긋날 수 있다.
// 권장(선택): 영문 포함 / 숫자 포함 — 강도 표시에만 쓰고 가입을 막지 않는다.
export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 100;
export const hasLetter = (v: string) => /[A-Za-z]/.test(v);
export const hasDigit = (v: string) => /\d/.test(v);
// 특수문자 = ASCII 문장부호/기호만 인정한다. `[^A-Za-z0-9]`로 두면 공백·한글도 통과해
//   FE는 통과하지만 서버(문장부호 기대)가 거절하는 불일치가 생긴다(LOGIN-FE-006 리뷰 반영).
export const hasSpecial = (v: string) =>
  /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(v);

// 닉네임 규칙 — 2~8자, 특수기호 불가(한글/영문/숫자만). (GEMBTI_API: minLength 2 / maxLength 8)
export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 8;
// 한글(완성형/자모) + 영문 + 숫자만 허용. 공백/특수기호 불가.
export const NICKNAME_PATTERN = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]+$/;

// 닉네임 단일 필드 스키마(STEP2에서 재사용).
export const nicknameSchema = z
  .string()
  .min(
    NICKNAME_MIN_LENGTH,
    `닉네임은 ${NICKNAME_MIN_LENGTH}자 이상이어야 합니다`,
  )
  .max(NICKNAME_MAX_LENGTH, `닉네임은 ${NICKNAME_MAX_LENGTH}자 이하여야 합니다`)
  .regex(NICKNAME_PATTERN, '닉네임에 특수기호는 쓸 수 없어요');

// ── STEP1 (계정정보) ─────────────────────────────────────────────────────────
// 이메일 + 비밀번호 + 비밀번호확인 + [필수] 이용약관 동의 + [필수] 개인정보 처리방침 동의.
//   약관 2개는 GEMBTI_API SignupRequest의 terms_agreed / privacy_agreed(필수 boolean)로 전송된다.
export const signupStep1Schema = z
  .object({
    email: z
      .string()
      .min(1, '이메일을 입력해주세요')
      .email('올바른 이메일 형식이 아닙니다'),
    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다`,
      )
      .max(
        PASSWORD_MAX_LENGTH,
        `비밀번호는 ${PASSWORD_MAX_LENGTH}자 이하여야 합니다`,
      )
      .refine(hasSpecial, '특수문자를 1개 이상 포함해야 합니다'),
    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해주세요'),
    // 필수 약관 동의 2개 — boolean + refine(true).
    termsAgreed: z.boolean().refine((v) => v, '이용약관에 동의해주세요'),
    privacyAgreed: z
      .boolean()
      .refine((v) => v, '개인정보 처리방침에 동의해주세요'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: '비밀번호가 일치하지 않습니다',
  });

export type SignupStep1Input = z.infer<typeof signupStep1Schema>;

// ── STEP2 (인증 + 프로필) ────────────────────────────────────────────────────
// OTP 코드 + 닉네임 + 생년월일 + 성별.
export const VERIFY_CODE_LENGTH = 6;

// 성별 — GEMBTI_API Gender enum과 1:1 대응. 'other'는 UI에서 "선택 안 함"으로 표시한다.
export type Gender = 'male' | 'female' | 'other';

export const signupStep2Schema = z.object({
  code: z
    .string()
    .min(1, '인증 코드를 입력해주세요')
    .regex(/^\d{6}$/, '6자리 숫자 인증 코드를 입력해주세요'),
  nickname: nicknameSchema,
  // 생년월일(YYYY-MM-DD, <input type=date> 값). 미입력 차단(서버는 optional이나 UI는 필수).
  birth: z.string().min(1, '생년월일을 선택해주세요'),
  gender: z.enum(['male', 'female', 'other']),
});

export type SignupStep2Input = z.infer<typeof signupStep2Schema>;

// 인증 코드 단독 스키마 — 코드만 검증해야 하는 곳(레거시/테스트 호환)에서 사용.
export const verifyCodeSchema = z.object({
  code: signupStep2Schema.shape.code,
});

export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
