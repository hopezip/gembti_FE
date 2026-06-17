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
// 필수: 10자 이상 + 특수문자 + 영문 + 숫자 1개 이상씩 (LOGIN-FE-016: 특수문자만 입력 차단).
//   ⚠️ 특수문자·영문·숫자 필수는 OpenAPI 스키마에 없다 — 백엔드는 minLength 10만 요구하므로
//      FE가 더 엄격하다(백엔드가 받아줄 비밀번호를 FE가 막을 수 있음, project_auth_backend_contract).
//      백엔드가 규칙을 바꾸면 이 검증과 어긋날 수 있다.
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
// 이메일 + 비밀번호 + 비밀번호확인 + [필수] 만 15세 이상 확인.
//   백엔드 SignupRequest.age_confirmed(필수 boolean)에 대응한다 →
//   UI는 "15세 확인" 1개로 받고, signup 시 ageConfirmed를 age_confirmed로 그대로 보낸다.
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
      .refine(hasSpecial, '특수문자를 1개 이상 포함해야 합니다')
      .refine(hasLetter, '영문을 1개 이상 포함해야 합니다')
      .refine(hasDigit, '숫자를 1개 이상 포함해야 합니다'),
    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해주세요'),
    // [필수] 만 15세 이상 확인 — boolean + refine(true).
    ageConfirmed: z
      .boolean()
      .refine((v) => v, '만 15세 이상만 가입할 수 있어요'),
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

// 생년월일 허용 범위 (LOGIN-FE-016): 1900-01-01 ~ 오늘. 미래 생일 차단(= 2026년 이후 자동 차단).
//   화면 <input type=date>의 min/max와 같은 출처를 공유한다(SSOT). 날짜는 YYYY-MM-DD 문자열 비교(사전식=시간순).
export const BIRTH_MIN_DATE = '1900-01-01';
export function getBirthMaxDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// 만 minAge세 이상 컷오프 생년월일(오늘로부터 minAge년 전). 이 날짜 이하(같거나 과거)여야 만 minAge세 이상이다.
//   프로필 기본정보 생년월일 범위 상한에 쓴다(MYPAGE-FE-017, 가입 만 15세 정책과 정합).
export function getBirthMaxDateForAge(minAge: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - minAge);
  return d.toISOString().slice(0, 10);
}

export const signupStep2Schema = z.object({
  code: z
    .string()
    .min(1, '인증 코드를 입력해주세요')
    .regex(/^\d{6}$/, '6자리 숫자 인증 코드를 입력해주세요'),
  nickname: nicknameSchema,
  // 생년월일(YYYY-MM-DD, <input type=date> 값). 미입력 차단(서버는 optional이나 UI는 필수).
  //   범위(1900~오늘)도 강제한다 — <input> min/max는 직접 입력으로 우회 가능하므로 스키마로 막는다(noValidate 폼).
  birth: z
    .string()
    .min(1, '생년월일을 선택해주세요')
    .refine(
      (v) => v >= BIRTH_MIN_DATE && v <= getBirthMaxDate(),
      '생년월일은 1900년 이후, 오늘까지만 선택할 수 있어요',
    ),
  gender: z.enum(['male', 'female', 'other']),
});

export type SignupStep2Input = z.infer<typeof signupStep2Schema>;

// 인증 코드 단독 스키마 — 코드만 검증해야 하는 곳(레거시/테스트 호환)에서 사용.
export const verifyCodeSchema = z.object({
  code: signupStep2Schema.shape.code,
});

export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
