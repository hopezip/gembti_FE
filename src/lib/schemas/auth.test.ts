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

describe('signupStep1Schema (LOGIN-FE-015: 10자+특수문자, 만 15세 확인)', () => {
  // 모든 필드가 유효한 기준 입력(각 케이스에서 일부만 덮어쓴다).
  const valid: SignupStep1Input = {
    email: 'new_user@example.com',
    password: 'abcde1234!', // 10자 + 특수문자
    passwordConfirm: 'abcde1234!',
    ageConfirmed: true,
  };

  it('유효한 입력을 통과시킨다', () => {
    expect(signupStep1Schema.safeParse(valid).success).toBe(true);
  });

  it('비밀번호가 정확히 10자 + 특수문자면 통과한다(경계)', () => {
    const result = signupStep1Schema.safeParse({
      ...valid,
      password: 'abcd1234!@', // 10자
      passwordConfirm: 'abcd1234!@',
    });
    expect(result.success).toBe(true);
  });

  it('비밀번호가 9자면 실패한다(경계 아래)', () => {
    const result = signupStep1Schema.safeParse({
      ...valid,
      password: 'abc1234!@', // 9자(특수문자 있음)
      passwordConfirm: 'abc1234!@',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === '비밀번호는 10자 이상이어야 합니다',
        ),
      ).toBe(true);
    }
  });

  it('비밀번호에 특수문자가 없으면 실패한다', () => {
    const result = signupStep1Schema.safeParse({
      ...valid,
      password: 'abcdefghij', // 10자지만 특수문자 없음
      passwordConfirm: 'abcdefghij',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === '특수문자를 1개 이상 포함해야 합니다',
        ),
      ).toBe(true);
    }
  });

  it('특수문자만 10자(영문·숫자 없음)면 실패한다 (LOGIN-FE-016)', () => {
    const result = signupStep1Schema.safeParse({
      ...valid,
      password: '!!!!!!!!!!', // 10자·특수문자뿐, 영문·숫자 없음
      passwordConfirm: '!!!!!!!!!!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('영문을 1개 이상 포함해야 합니다');
      expect(messages).toContain('숫자를 1개 이상 포함해야 합니다');
    }
  });

  it('영문이 없으면 실패한다 (LOGIN-FE-016)', () => {
    const result = signupStep1Schema.safeParse({
      ...valid,
      password: '1234567890!', // 숫자·특수문자, 영문 없음
      passwordConfirm: '1234567890!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === '영문을 1개 이상 포함해야 합니다',
        ),
      ).toBe(true);
    }
  });

  it('숫자가 없으면 실패한다 (LOGIN-FE-016)', () => {
    const result = signupStep1Schema.safeParse({
      ...valid,
      password: 'abcdefghi!', // 영문·특수문자, 숫자 없음
      passwordConfirm: 'abcdefghi!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === '숫자를 1개 이상 포함해야 합니다',
        ),
      ).toBe(true);
    }
  });

  it('비밀번호 확인이 다르면 실패한다', () => {
    const result = signupStep1Schema.safeParse({
      ...valid,
      passwordConfirm: 'different1!',
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

  it('만 15세 미확인 시 실패한다', () => {
    const result = signupStep1Schema.safeParse({
      ...valid,
      ageConfirmed: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === '만 15세 이상만 가입할 수 있어요',
        ),
      ).toBe(true);
    }
  });
});

describe('nicknameSchema (2~8자)', () => {
  it('한글 2~8자를 통과시킨다', () => {
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

  it('9자는 실패한다(경계 위)', () => {
    const result = nicknameSchema.safeParse('가나다라마바사아자');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        '닉네임은 8자 이하여야 합니다',
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
    expect(nicknameSchema.safeParse('game ovr').success).toBe(false);
  });
});

describe('signupStep2Schema', () => {
  const valid: SignupStep2Input = {
    code: '123456',
    nickname: '테스트유저',
    birth: '2000-01-01',
    gender: 'other',
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

  it('생년월일이 1900년 이전이면 실패한다 (LOGIN-FE-016)', () => {
    const result = signupStep2Schema.safeParse({
      ...valid,
      birth: '1899-12-31',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) =>
            i.message === '생년월일은 1900년 이후, 오늘까지만 선택할 수 있어요',
        ),
      ).toBe(true);
    }
  });

  it('생년월일이 미래(오늘 이후)면 실패한다 (LOGIN-FE-016)', () => {
    const result = signupStep2Schema.safeParse({
      ...valid,
      birth: '2999-12-31',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) =>
            i.message === '생년월일은 1900년 이후, 오늘까지만 선택할 수 있어요',
        ),
      ).toBe(true);
    }
  });

  it('만 15세 미만(생년월일이 너무 최근)이면 실패한다', () => {
    // 고정 날짜 대신 동적으로 — 오늘 기준 10년 전이면 만 15세 미만이다.
    const tooYoung = new Date();
    tooYoung.setFullYear(tooYoung.getFullYear() - 10);
    const tooYoungStr = tooYoung.toISOString().slice(0, 10);
    const result = signupStep2Schema.safeParse({
      ...valid,
      birth: tooYoungStr,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === '만 15세 미만은 가입할 수 없어요',
        ),
      ).toBe(true);
    }
  });

  it('성별 enum 외 값(unspecified)은 실패한다', () => {
    expect(
      signupStep2Schema.safeParse({ ...valid, gender: 'unspecified' }).success,
    ).toBe(false);
  });

  it('male/female/other를 모두 통과시킨다', () => {
    for (const gender of ['male', 'female', 'other'] as const) {
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
