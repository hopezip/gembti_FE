import { z } from 'zod';

// 인증 폼 Zod 스키마 모음 (forms.md: 스키마는 src/lib/schemas/에 모으고 컴포넌트 인라인 정의 금지).
// 에러 메시지는 한국어로 정의한다.

// 로그인 폼 스키마 (screens/login.md Zod 안 그대로).
// 비밀번호는 "필수"만 검증한다 — 형식(10자/영문+숫자)은 회원가입(LOGIN-FE-003)에서만 강제하고,
// 로그인은 잘못된 자격증명을 서버 401(ERROR-FE-003)로 판별한다(기존 계정 호환성).
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// 회원가입(LOGIN-FE-003) 비밀번호 규칙 — 화면(PasswordRules)과 스키마가 같은 출처를 보도록 공유한다.
// 필수: 10자 이상 / 영문 포함 / 숫자 포함 (REQ 9.1 LOGIN-FE-003). 특수문자는 권장(선택)이라 검증 안 함.
export const PASSWORD_MIN_LENGTH = 10;
export const hasLetter = (v: string) => /[A-Za-z]/.test(v);
export const hasDigit = (v: string) => /\d/.test(v);
export const hasSpecial = (v: string) => /[^A-Za-z0-9]/.test(v);

// 회원가입 폼 스키마 (Figma auth-modal STEP1 · 계정정보).
// 닉네임/생년월일/성별은 이 프레임에 없어 후속 단계로 미룬다. 약관은 [필수]만14세·이용약관·개인정보 + [선택]마케팅.
// 이메일 실시간 중복확인은 LOGIN-FE-004(백엔드 의존)로 분리하고, 여기선 형식만 검증한다.
export const signupSchema = z
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
      .refine(hasLetter, '영문을 포함해야 합니다')
      .refine(hasDigit, '숫자를 포함해야 합니다'),
    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해주세요'),
    // 약관 필수 동의 — RHF defaultValues(false) 친화 위해 literal 대신 boolean + refine 사용.
    ageOver14: z.boolean().refine((v) => v, '만 14세 이상만 가입할 수 있어요'),
    termsOfService: z.boolean().refine((v) => v, '이용약관에 동의해주세요'),
    privacy: z.boolean().refine((v) => v, '개인정보 수집·이용에 동의해주세요'),
    marketing: z.boolean(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: '비밀번호가 일치하지 않습니다',
  });

export type SignupInput = z.infer<typeof signupSchema>;

// 이메일 인증(LOGIN-FE-004 STEP2) 코드 입력 스키마.
// 6자리 숫자 인증 코드만 허용한다. 코드의 실제 유효성(만료/오답)은 서버(verify)가 판별하고,
// 여기선 형식(자릿수·숫자)만 검증한다. 메시지는 한국어.
export const VERIFY_CODE_LENGTH = 6;
export const verifyCodeSchema = z.object({
  code: z
    .string()
    .min(1, '인증 코드를 입력해주세요')
    .regex(/^\d{6}$/, '6자리 숫자 인증 코드를 입력해주세요'),
});

export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
