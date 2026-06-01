import { describe, expect, it } from 'vitest';
import { type SignupInput, loginSchema, signupSchema } from './auth';

describe('loginSchema', () => {
  it('유효한 이메일/비밀번호를 통과시킨다', () => {
    const result = loginSchema.safeParse({
      email: 'test@gambti.com',
      password: 'anything',
    });
    expect(result.success).toBe(true);
  });

  it('이메일이 비면 한국어 에러를 낸다', () => {
    const result = loginSchema.safeParse({ email: '', password: 'x' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('이메일을 입력해주세요');
    }
  });

  it('이메일 형식이 틀리면 한국어 에러를 낸다', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'x',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        '올바른 이메일 형식이 아닙니다',
      );
    }
  });

  it('비밀번호가 비면 한국어 에러를 낸다(형식은 강제하지 않음)', () => {
    const result = loginSchema.safeParse({
      email: 'test@gambti.com',
      password: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('비밀번호를 입력해주세요');
    }
  });

  it('짧은 비밀번호도 형식 검증 없이 통과시킨다(로그인은 401로 판별)', () => {
    const result = loginSchema.safeParse({
      email: 'test@gambti.com',
      password: '123',
    });
    expect(result.success).toBe(true);
  });
});

describe('signupSchema', () => {
  // 모든 필드가 유효한 기준 입력(각 케이스에서 일부만 덮어쓴다).
  const valid: SignupInput = {
    email: 'new_user@example.com',
    password: 'abcde12345', // 10자 + 영문 + 숫자
    passwordConfirm: 'abcde12345',
    ageOver14: true,
    termsOfService: true,
    privacy: true,
    marketing: false,
  };

  it('유효한 입력을 통과시킨다', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it('비밀번호가 10자 미만이면 실패한다', () => {
    const result = signupSchema.safeParse({
      ...valid,
      password: 'abc12',
      passwordConfirm: 'abc12',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        '비밀번호는 10자 이상이어야 합니다',
      );
    }
  });

  it('비밀번호에 영문이 없으면 실패한다', () => {
    const result = signupSchema.safeParse({
      ...valid,
      password: '1234567890',
      passwordConfirm: '1234567890',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.message === '영문을 포함해야 합니다'),
      ).toBe(true);
    }
  });

  it('비밀번호에 숫자가 없으면 실패한다', () => {
    const result = signupSchema.safeParse({
      ...valid,
      password: 'abcdefghij',
      passwordConfirm: 'abcdefghij',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.message === '숫자를 포함해야 합니다'),
      ).toBe(true);
    }
  });

  it('비밀번호 확인이 다르면 실패한다', () => {
    const result = signupSchema.safeParse({
      ...valid,
      passwordConfirm: 'different12',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === '비밀번호가 일치하지 않습니다',
        ),
      ).toBe(true);
    }
  });

  it('필수 약관(만14세/이용약관/개인정보) 미동의 시 실패한다', () => {
    const result = signupSchema.safeParse({
      ...valid,
      ageOver14: false,
      termsOfService: false,
      privacy: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === '만 14세 이상만 가입할 수 있어요',
        ),
      ).toBe(true);
    }
  });

  it('선택 약관(마케팅) 미동의는 통과시킨다', () => {
    const result = signupSchema.safeParse({ ...valid, marketing: false });
    expect(result.success).toBe(true);
  });
});
