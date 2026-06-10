import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SignupError, VerifyError } from '@/services/auth';
import { EmailVerificationForm } from './EmailVerificationForm';

// 서비스 레이어를 모킹한다(MSW 미설정 테스트 환경). verify→signup 순차 분기를 검증한다.
const verifyEmail = vi.fn();
const signup = vi.fn();
const sendEmailCode = vi.fn();

vi.mock('@/services/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/auth')>();
  return {
    ...actual,
    verifyEmail: (...args: unknown[]) => verifyEmail(...args),
    signup: (...args: unknown[]) => signup(...args),
    sendEmailCode: (...args: unknown[]) => sendEmailCode(...args),
  };
});

function renderForm(onSignedUp = vi.fn(), onEmailDuplicated = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <EmailVerificationForm
        email="new_user@example.com"
        password="abcde1234!"
        passwordConfirm="abcde1234!"
        termsAgreed
        privacyAgreed
        onSignedUp={onSignedUp}
        onEmailDuplicated={onEmailDuplicated}
      />
    </QueryClientProvider>,
  );
  return { onSignedUp, onEmailDuplicated };
}

// 6칸 OTP에 코드를 채운다(첫 칸 입력 후 자동 포커스 이동에 의존).
async function fillOtp(user: ReturnType<typeof userEvent.setup>, code: string) {
  const first = screen.getByLabelText('인증 코드 1번째 자리');
  await user.click(first);
  await user.keyboard(code);
}

async function fillProfile(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/닉네임/), '테스트유저');
  // 생년월일(date input) — label 연결로 조회한다(없으면 throw해 silent fail을 막는다).
  const birth = screen.getByLabelText(/생년월일/);
  await user.clear(birth);
  await user.type(birth, '2000-01-01');
}

describe('EmailVerificationForm (STEP2)', () => {
  beforeEach(() => {
    verifyEmail.mockReset();
    signup.mockReset();
    sendEmailCode.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('안내 배너의 이메일과 타이머(05:00, 상수 TTL)를 표시한다', () => {
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

  it('가입 완료 시 verify→signup 순차 호출 후 onSignedUp을 부른다', async () => {
    verifyEmail.mockResolvedValue(undefined);
    signup.mockResolvedValue({
      user: {
        id: 10,
        email: 'new_user@example.com',
        nickname: '테스트유저',
        hasCompletedSurvey: false,
      },
      accessToken: 'a',
    });
    const user = userEvent.setup();
    const { onSignedUp } = renderForm();

    await fillOtp(user, '123456');
    await fillProfile(user);
    await user.click(screen.getByRole('button', { name: '가입 완료 →' }));

    await waitFor(() => expect(onSignedUp).toHaveBeenCalledTimes(1));
    expect(verifyEmail.mock.calls[0][0]).toEqual({
      email: 'new_user@example.com',
      code: '123456',
    });
    expect(signup.mock.calls[0][0]).toMatchObject({
      email: 'new_user@example.com',
      password: 'abcde1234!',
      passwordConfirm: 'abcde1234!',
      nickname: '테스트유저',
      gender: 'other',
      birthDate: '2000-01-01',
      termsAgreed: true,
      privacyAgreed: true,
    });
  });

  it('코드 오류(invalid-code)는 코드 영역 에러로 표시하고 signup을 호출하지 않는다', async () => {
    verifyEmail.mockRejectedValue(new VerifyError('invalid-code'));
    const user = userEvent.setup();
    renderForm();

    await fillOtp(user, '111111');
    await fillProfile(user);
    await user.click(screen.getByRole('button', { name: '가입 완료 →' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('인증 코드가 올바르지 않습니다');
    expect(signup).not.toHaveBeenCalled();
  });

  it('닉네임 중복(nickname-duplicated)은 닉네임 필드 에러로 표시한다', async () => {
    verifyEmail.mockResolvedValue(undefined);
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

  it('이메일 중복(email-duplicated)은 onEmailDuplicated 콜백을 부른다', async () => {
    verifyEmail.mockResolvedValue(undefined);
    signup.mockRejectedValue(
      new SignupError('email-duplicated', '이미 가입된 이메일입니다.'),
    );
    const user = userEvent.setup();
    const { onEmailDuplicated } = renderForm();

    await fillOtp(user, '123456');
    await fillProfile(user);
    await user.click(screen.getByRole('button', { name: '가입 완료 →' }));

    await waitFor(() =>
      expect(onEmailDuplicated).toHaveBeenCalledWith(
        '이미 가입된 이메일입니다.',
      ),
    );
  });

  it('signup 일반 오류는 코드 영역에 일반 에러로 표시한다', async () => {
    verifyEmail.mockResolvedValue(undefined);
    signup.mockRejectedValue(new SignupError('generic'));
    const user = userEvent.setup();
    renderForm();

    await fillOtp(user, '123456');
    await fillProfile(user);
    await user.click(screen.getByRole('button', { name: '가입 완료 →' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('일시적인 오류가 발생했습니다');
  });

  it('재전송 버튼 클릭 시 sendEmailCode 호출 후 쿨다운으로 비활성화된다', async () => {
    sendEmailCode.mockResolvedValue(undefined);
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
