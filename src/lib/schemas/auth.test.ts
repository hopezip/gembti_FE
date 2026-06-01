import { describe, expect, it } from 'vitest';
import { loginSchema } from './auth';

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
