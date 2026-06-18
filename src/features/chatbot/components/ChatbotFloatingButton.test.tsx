import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChatbotFloatingButton } from './ChatbotFloatingButton';

// useAuthStore를 로그인 상태 토글이 가능하도록 모킹한다 (CHATBOT-FE-003).
let mockStatus: 'anonymous' | 'authenticated' = 'anonymous';
vi.mock('@/lib/store/useAuthStore', () => ({
  useAuthStore: (selector: (s: { status: string }) => unknown) =>
    selector({ status: mockStatus }),
}));

describe('ChatbotFloatingButton 노출 조건 (CHATBOT-FE-003)', () => {
  it('비로그인 유저에게는 챗봇 버튼이 노출되지 않는다', () => {
    mockStatus = 'anonymous';
    render(<ChatbotFloatingButton />);
    expect(
      screen.queryByRole('button', { name: '고객센터 챗봇 열기' }),
    ).toBeNull();
  });

  it('로그인 유저에게는 챗봇 버튼이 노출된다', () => {
    mockStatus = 'authenticated';
    render(<ChatbotFloatingButton />);
    expect(
      screen.getByRole('button', { name: '고객센터 챗봇 열기' }),
    ).toBeInTheDocument();
  });
});
