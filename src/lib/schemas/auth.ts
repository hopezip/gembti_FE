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
