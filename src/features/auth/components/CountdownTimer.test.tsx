import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CountdownTimer } from './CountdownTimer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 seconds를 MM:SS로 표기한다', () => {
    render(<CountdownTimer seconds={300} />);
    expect(screen.getByRole('timer')).toHaveTextContent('05:00');
  });

  it('1초마다 감소한다', () => {
    render(<CountdownTimer seconds={65} />);
    expect(screen.getByRole('timer')).toHaveTextContent('01:05');
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.getByRole('timer')).toHaveTextContent('00:59');
  });

  it('0에 도달하면 onExpire를 1회 호출하고 00:00을 표기한다', () => {
    const onExpire = vi.fn();
    render(<CountdownTimer seconds={2} onExpire={onExpire} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole('timer')).toHaveTextContent('00:00');
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
