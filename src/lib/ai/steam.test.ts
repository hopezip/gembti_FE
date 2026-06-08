import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchSteamGame, sampleReviews } from './steam';

afterEach(() => vi.restoreAllMocks());

const appdetails = {
  '1245620': {
    success: true,
    data: {
      name: 'ELDEN RING',
      short_description: '광활한 액션 RPG',
      genres: [{ description: 'Action' }, { description: 'RPG' }],
      categories: [{ description: 'Single-player' }],
    },
  },
};
const appreviews = {
  success: 1,
  reviews: [
    { review: '타격감 최고', voted_up: true, votes_up: 100 },
    { review: '진입장벽 높음', voted_up: false, votes_up: 80 },
    { review: '보스전 명작', voted_up: true, votes_up: 5 },
  ],
};

describe('sampleReviews', () => {
  it('긍/부정/helpful 혼합으로 뽑고 각 리뷰를 자른다(편향·토큰 가드)', () => {
    const out = sampleReviews(appreviews.reviews, {
      positive: 1,
      negative: 1,
      helpful: 1,
      maxLen: 5,
    });
    expect(out.some((r) => r.voted_up)).toBe(true);
    expect(out.some((r) => !r.voted_up)).toBe(true);
    expect(out.every((r) => r.review.length <= 5)).toBe(true);
  });
});

describe('fetchSteamGame', () => {
  it('appdetails+appreviews를 정규화 DTO로 합친다', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      const body = String(url).includes('appreviews') ? appreviews : appdetails;
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
    });
    const dto = await fetchSteamGame(1245620);
    expect(dto.name).toBe('ELDEN RING');
    expect(dto.genres).toContain('Action');
    expect(dto.reviews.length).toBeGreaterThan(0);
  });

  it('appdetails success=false면 에러(버튼 비활성 신호)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ '1': { success: false } }), { status: 200 }),
    );
    await expect(fetchSteamGame(1)).rejects.toThrow();
  });

  it('리뷰 없는 게임도 설명/태그만으로 DTO 반환(reviews=[])', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      const body = String(url).includes('appreviews')
        ? { success: 1, reviews: [] }
        : appdetails;
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
    });
    const dto = await fetchSteamGame(1245620);
    expect(dto.reviews).toEqual([]);
  });
});
