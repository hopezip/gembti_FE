import { describe, expect, it } from 'vitest';
import { safeRedirect } from './safeRedirect';

describe('safeRedirect', () => {
  it('앱 내부 상대경로는 그대로 허용한다', () => {
    expect(safeRedirect('/mypage')).toBe('/mypage');
    expect(safeRedirect('/games/123?tab=reviews')).toBe(
      '/games/123?tab=reviews',
    );
  });

  it('값이 없으면 홈(/)으로 폴백한다', () => {
    expect(safeRedirect(null)).toBe('/');
    expect(safeRedirect(undefined)).toBe('/');
    expect(safeRedirect('')).toBe('/');
  });

  it('`/`로 시작하지 않으면(상대/절대 외부) 홈으로 폴백한다', () => {
    expect(safeRedirect('mypage')).toBe('/');
    expect(safeRedirect('https://evil.com')).toBe('/');
    expect(safeRedirect('javascript:alert(1)')).toBe('/');
  });

  it('프로토콜 상대 URL(`//`)을 차단한다', () => {
    expect(safeRedirect('//evil.com')).toBe('/');
    expect(safeRedirect('//evil.com/path')).toBe('/');
  });

  it('백슬래시 우회(`/\\`, 경로 내 `\\`)를 차단한다', () => {
    expect(safeRedirect('/\\evil.com')).toBe('/');
    expect(safeRedirect('/path\\to')).toBe('/');
  });
});
