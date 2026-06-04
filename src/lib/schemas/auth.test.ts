import { describe, expect, it } from 'vitest';
import {
  type SignupStep1Input,
  type SignupStep2Input,
  loginSchema,
  nicknameSchema,
  signupStep1Schema,
  signupStep2Schema,
  verifyCodeSchema,
} from './auth';

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

describe('signupStep1Schema', () => {
  // 모든 필드가 유효한 기준 입력(각 케이스에서 일부만 덮어쓴다).
  const valid: SignupStep1Input = {
    email: 'new_user@example.com',
    password: 'abcde123', // 8자 + 영문 + 숫자
    passwordConfirm: 'abcde123',
    ageOver14: true,
  };

  it('유효한 입력을 통과시킨다', () => {
    expect(signupStep1Schema.safeParse(valid).success).toBe(true);
  });

  it('비밀번호가 정확히 8자면 통과한다(경계)', () => {
    const result = signupStep1Schema.safeParse({
      ...valid,
      password: 'abcdef12', // 8자
      passwordConfirm: 'abcdef12',
    });
    expect(result.success).toBe(true);
  });

  it('비밀번호가 7자면 실패한다(경계 아래)', () => {
    const result = signupStep1Schema.safeParse({
      ...valid,
      password: 'abcde12', // 7자
      passwordConfirm: 'abcde12',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === '비밀번호는 8자 이상이어야 합니다',
        ),
      ).toBe(true);
    }
  });

  it('비밀번호에 영문이 없으면 실패한다', () => {
    const result = signupStep1Schema.safeParse({
      ...valid,
      password: '12345678',
      passwordConfirm: '12345678',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.message === '영문을 포함해야 합니다'),
      ).toBe(true);
    }
  });

  it('비밀번호에 숫자가 없으면 실패한다', () => {
    const result = signupStep1Schema.safeParse({
      ...valid,
      password: 'abcdefgh',
      passwordConfirm: 'abcdefgh',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.message === '숫자를 포함해야 합니다'),
      ).toBe(true);
    }
  });

  it('비밀번호 확인이 다르면 실패한다', () => {
    const result = signupStep1Schema.safeParse({
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

  it('만 14세 미동의 시 실패한다', () => {
    const result = signupStep1Schema.safeParse({
      ...valid,
      ageOver14: false,
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
});

describe('nicknameSchema', () => {
  it('한글 2~12자를 통과시킨다', () => {
    expect(nicknameSchema.safeParse('게임러버').success).toBe(true);
  });

  it('영문+숫자 조합을 통과시킨다', () => {
    expect(nicknameSchema.safeParse('gamer01').success).toBe(true);
  });

  it('1자는 실패한다(경계 아래)', () => {
    const result = nicknameSchema.safeParse('가');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        '닉네임은 2자 이상이어야 합니다',
      );
    }
  });

  it('13자는 실패한다(경계 위)', () => {
    const result = nicknameSchema.safeParse('가나다라마바사아자차카타파');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        '닉네임은 12자 이하여야 합니다',
      );
    }
  });

  it('특수기호가 들어가면 실패한다', () => {
    const result = nicknameSchema.safeParse('game!!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === '닉네임에 특수기호는 쓸 수 없어요',
        ),
      ).toBe(true);
    }
  });

  it('공백이 들어가면 실패한다', () => {
    expect(nicknameSchema.safeParse('game over').success).toBe(false);
  });
});

describe('signupStep2Schema', () => {
  const valid: SignupStep2Input = {
    code: '123456',
    nickname: '테스트유저',
    birth: '2000-01-01',
    gender: 'unspecified',
  };

  it('유효한 입력을 통과시킨다', () => {
    expect(signupStep2Schema.safeParse(valid).success).toBe(true);
  });

  it('코드가 6자리 숫자가 아니면 실패한다', () => {
    expect(
      signupStep2Schema.safeParse({ ...valid, code: '12a45' }).success,
    ).toBe(false);
  });

  it('생년월일이 비면 실패한다', () => {
    const result = signupStep2Schema.safeParse({ ...valid, birth: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === '생년월일을 선택해주세요',
        ),
      ).toBe(true);
    }
  });

  it('성별 enum 외 값은 실패한다', () => {
    expect(
      signupStep2Schema.safeParse({ ...valid, gender: 'other' }).success,
    ).toBe(false);
  });

  it('male/female/unspecified를 모두 통과시킨다', () => {
    for (const gender of ['male', 'female', 'unspecified'] as const) {
      expect(signupStep2Schema.safeParse({ ...valid, gender }).success).toBe(
        true,
      );
    }
  });
});

describe('verifyCodeSchema', () => {
  it('6자리 숫자 코드를 통과시킨다', () => {
    expect(verifyCodeSchema.safeParse({ code: '123456' }).success).toBe(true);
  });

  it('빈 코드는 한국어 에러를 낸다', () => {
    const result = verifyCodeSchema.safeParse({ code: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('인증 코드를 입력해주세요');
    }
  });

  it('자릿수가 6이 아니면 실패한다(5자리)', () => {
    expect(verifyCodeSchema.safeParse({ code: '12345' }).success).toBe(false);
  });
});
