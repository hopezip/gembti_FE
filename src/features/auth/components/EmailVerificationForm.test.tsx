import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VerifyError } from '@/services/auth';
import { EmailVerificationForm } from './EmailVerificationForm';

// 서비스 레이어를 모킹한다(MSW 미설정 테스트 환경). verify/resend 분기만 검증한다.
const verifyEmailCode = vi.fn();
const requestEmailVerification = vi.fn();

vi.mock('@/services/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/auth')>();
  return {
    ...actual,
    verifyEmailCode: (...args: unknown[]) => verifyEmailCode(...args),
    requestEmailVerification: (...args: unknown[]) =>
      requestEmailVerification(...args),
  };
});

function renderForm(onVerified = vi.fn()) {
  // 테스트 격리를 위해 retry 비활성 QueryClient를 매번 새로 만든다.
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <EmailVerificationForm
        email="new_user@example.com"
        initialTtlSeconds={300}
        onVerified={onVerified}
      />
    </QueryClientProvider>,
  );
  return { onVerified };
}

describe('EmailVerificationForm', () => {
  beforeEach(() => {
    verifyEmailCode.mockReset();
    requestEmailVerification.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('발송 이메일과 유효시간 타이머(5:00)를 표시한다', () => {
    renderForm();
    expect(screen.getByText('new_user@example.com')).toBeInTheDocument();
    expect(screen.getByRole('timer')).toHaveTextContent('05:00');
  });

  it('6자리 코드 제출 시 verifyEmailCode를 호출하고 성공하면 onVerified를 부른다', async () => {
    verifyEmailCode.mockResolvedValue(undefined);
    const user = userEvent.setup();
    const { onVerified } = renderForm();

    await user.type(
      screen.getByLabelText(/인증 코드/, { selector: 'input' }),
      '123456',
    );
    await user.click(screen.getByRole('button', { name: '인증 완료 →' }));

    // 성공 상태(onVerified 호출)를 먼저 기다린 뒤 호출 인자를 검증한다.
    // TanStack Query v5는 mutationFn에 (variables, context)를 넘기므로 첫 인자만 검사한다.
    await waitFor(() => expect(onVerified).toHaveBeenCalledTimes(1));
    expect(verifyEmailCode.mock.calls[0][0]).toEqual({
      email: 'new_user@example.com',
      code: '123456',
    });
  });

  it('형식이 틀린 코드는 제출되지 않고 형식 에러를 보여준다', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByLabelText(/인증 코드/, { selector: 'input' }),
      '12ab',
    );
    await user.click(screen.getByRole('button', { name: '인증 완료 →' }));

    expect(
      await screen.findByText('6자리 숫자 인증 코드를 입력해주세요'),
    ).toBeInTheDocument();
    expect(verifyEmailCode).not.toHaveBeenCalled();
  });

  it('invalid-code 에러는 코드 오류 안내를 role=alert로 보여준다', async () => {
    verifyEmailCode.mockRejectedValue(new VerifyError('invalid-code'));
    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByLabelText(/인증 코드/, { selector: 'input' }),
      '111111',
    );
    await user.click(screen.getByRole('button', { name: '인증 완료 →' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('인증 코드가 올바르지 않습니다');
  });

  it('expired 에러는 만료 안내를 보여준다', async () => {
    verifyEmailCode.mockRejectedValue(new VerifyError('expired'));
    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByLabelText(/인증 코드/, { selector: 'input' }),
      '000000',
    );
    await user.click(screen.getByRole('button', { name: '인증 완료 →' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('인증 코드가 만료되었습니다');
  });

  it('재전송 버튼 클릭 시 requestEmailVerification 호출 후 쿨다운으로 비활성화된다', async () => {
    requestEmailVerification.mockResolvedValue({ ttlSeconds: 300 });
    const user = userEvent.setup();
    renderForm();

    const resendButton = screen.getByRole('button', { name: '코드 재전송' });
    await user.click(resendButton);

    await waitFor(() =>
      expect(requestEmailVerification).toHaveBeenCalledWith(
        'new_user@example.com',
      ),
    );
    // 쿨다운 진입 — 버튼이 비활성화되고 남은 초가 표기된다.
    await waitFor(() => {
      const cooling = screen.getByRole('button', { name: /재전송 \(\d+s\)/ });
      expect(cooling).toBeDisabled();
    });
  });
});
