import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useResendCooldown } from './useResendCooldown';

describe('useResendCooldown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태는 쿨다운 없음(remaining 0, isCooling false)', () => {
    const { result } = renderHook(() => useResendCooldown(30));
    expect(result.current.remaining).toBe(0);
    expect(result.current.isCooling).toBe(false);
  });

  it('start() 후 cooldownSeconds부터 1초 간격으로 줄어든다', () => {
    const { result } = renderHook(() => useResendCooldown(3));

    act(() => result.current.start());
    expect(result.current.remaining).toBe(3);
    expect(result.current.isCooling).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(2);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.remaining).toBe(0);
    expect(result.current.isCooling).toBe(false);
  });
});
