import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SignupError, VerifyError } from '@/services/auth';
import { EmailVerificationForm } from './EmailVerificationForm';

// 서비스 레이어를 모킹한다(MSW 미설정 테스트 환경). verify-code→signup 순차 분기를 검증한다.
const verifyEmailCode = vi.fn();
const signup = vi.fn();
const sendEmailCode = vi.fn();
const checkNicknameAvailability = vi.fn();

vi.mock('@/services/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/auth')>();
  return {
    ...actual,
    verifyEmailCode: (...args: unknown[]) => verifyEmailCode(...args),
    signup: (...args: unknown[]) => signup(...args),
    sendEmailCode: (...args: unknown[]) => sendEmailCode(...args),
    checkNicknameAvailability: (...args: unknown[]) =>
      checkNicknameAvailability(...args),
  };
});

function renderForm(onSignedUp = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <EmailVerificationForm
        email="new_user@example.com"
        password="abcde123"
        initialExpiresInSeconds={300}
        onSignedUp={onSignedUp}
      />
    </QueryClientProvider>,
  );
  return { onSignedUp };
}

// 6칸 OTP에 코드를 채운다(첫 칸 입력 후 자동 포커스 이동에 의존).
async function fillOtp(user: ReturnType<typeof userEvent.setup>, code: string) {
  const first = screen.getByLabelText('인증 코드 1번째 자리');
  await user.click(first);
  await user.keyboard(code);
}

async function fillProfile(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/닉네임/), '테스트유저');
  // 생년월일(date input)
  const birth = document.querySelector(
    '#signup-birth',
  ) as HTMLInputElement | null;
  if (birth) {
    await user.clear(birth);
    await user.type(birth, '2000-01-01');
  }
}

describe('EmailVerificationForm (STEP2)', () => {
  beforeEach(() => {
    verifyEmailCode.mockReset();
    signup.mockReset();
    sendEmailCode.mockReset();
    checkNicknameAvailability.mockReset();
    checkNicknameAvailability.mockResolvedValue({ available: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('안내 배너의 이메일과 타이머(05:00)를 표시한다', () => {
    renderForm();
    expect(screen.getByText('new_user@example.com')).toBeInTheDocument();
    expect(screen.getByRole('timer')).toHaveTextContent('05:00');
  });

  it('6칸 OTP에 코드를 채우면 값이 합쳐진다(붙여넣기 아닌 순차 입력)', async () => {
    const user = userEvent.setup();
    renderForm();
    await fillOtp(user, '123456');
    expect(screen.getByLabelText('인증 코드 6번째 자리')).toHaveValue('6');
  });

  it('가입 완료 시 verify-code→signup 순차 호출 후 onSignedUp을 부른다', async () => {
    verifyEmailCode.mockResolvedValue({ signupToken: 'sgn_1' });
    signup.mockResolvedValue({
      user: { id: 'u_new', nickname: '테스트유저', hasCompletedSurvey: false },
      tokens: { accessToken: 'a', refreshToken: 'r' },
    });
    const user = userEvent.setup();
    const { onSignedUp } = renderForm();

    await fillOtp(user, '123456');
    await fillProfile(user);
    await user.click(screen.getByRole('button', { name: '가입 완료 →' }));

    await waitFor(() => expect(onSignedUp).toHaveBeenCalledTimes(1));
    expect(verifyEmailCode.mock.calls[0][0]).toEqual({
      email: 'new_user@example.com',
      code: '123456',
    });
    expect(signup.mock.calls[0][0]).toMatchObject({
      signupToken: 'sgn_1',
      password: 'abcde123',
      nickname: '테스트유저',
    });
  });

  it('코드 오류(invalid-code)는 코드 영역 에러로 표시한다', async () => {
    verifyEmailCode.mockRejectedValue(new VerifyError('invalid-code'));
    const user = userEvent.setup();
    renderForm();

    await fillOtp(user, '111111');
    await fillProfile(user);
    await user.click(screen.getByRole('button', { name: '가입 완료 →' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('인증 코드가 올바르지 않습니다');
    expect(signup).not.toHaveBeenCalled();
  });

  it('닉네임 중복(NICKNAME_DUPLICATED)은 닉네임 필드 에러로 표시한다', async () => {
    verifyEmailCode.mockResolvedValue({ signupToken: 'sgn_1' });
    signup.mockRejectedValue(new SignupError('nickname-duplicated'));
    const user = userEvent.setup();
    renderForm();

    await fillOtp(user, '123456');
    await fillProfile(user);
    await user.click(screen.getByRole('button', { name: '가입 완료 →' }));

    expect(
      await screen.findByText('이미 사용 중인 닉네임이에요'),
    ).toBeInTheDocument();
  });

  it('재전송 버튼 클릭 시 sendEmailCode 호출 후 쿨다운으로 비활성화된다', async () => {
    sendEmailCode.mockResolvedValue({ expiresInSeconds: 300 });
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: '코드 재전송' }));

    await waitFor(() =>
      expect(sendEmailCode).toHaveBeenCalledWith('new_user@example.com'),
    );
    await waitFor(() => {
      const cooling = screen.getByRole('button', {
        name: /코드 재전송 \(\d+s\)/,
      });
      expect(cooling).toBeDisabled();
    });
  });
});
