// 서버 전용. 외부 Steam 공개 엔드포인트를 호출해 LLM 입력용 DTO로 정규화한다.
// (기존 src/mocks/handlers/steam.ts = 백엔드 연동 mock과 무관 — 여기는 외부 store.steampowered.com 직접 호출.)
// 리뷰는 '최신 N'만 쓰면 편향 → 긍/부정/helpful 혼합으로 샘플링하고 각 리뷰를 짧게 자른다.

export interface SteamReview {
  review: string;
  voted_up: boolean;
  votes_up: number;
}

export interface SteamGameDTO {
  appid: number;
  name: string;
  description: string;
  genres: string[];
  categories: string[];
  reviews: { review: string; voted_up: boolean }[];
  // 캐시 키용 — 리뷰 내용이 바뀌면 해시가 달라져 분석 캐시가 무효화된다.
  reviewsSnapshotHash: string;
}

interface SampleOpts {
  positive: number;
  negative: number;
  helpful: number;
  maxLen: number;
}

// 긍정/부정/helpful(추천수 상위)을 섞고 각 리뷰를 maxLen으로 자른다. 중복은 제거.
export function sampleReviews(reviews: SteamReview[], opts: SampleOpts) {
  const clip = (r: SteamReview) => ({
    review: r.review.slice(0, opts.maxLen),
    voted_up: r.voted_up,
  });
  const pos = reviews.filter((r) => r.voted_up).slice(0, opts.positive);
  const neg = reviews.filter((r) => !r.voted_up).slice(0, opts.negative);
  const helpful = [...reviews]
    .sort((a, b) => b.votes_up - a.votes_up)
    .slice(0, opts.helpful);

  const seen = new Set<string>();
  return [...pos, ...neg, ...helpful]
    .filter((r) => {
      if (seen.has(r.review)) return false;
      seen.add(r.review);
      return true;
    })
    .map(clip);
}

// 리뷰 텍스트 집합 → 결정적 해시(캐시 키). 외부 의존 없는 FNV-1a.
const FNV_OFFSET_BASIS = 0x811c9dc5; // FNV-1a 32비트 초기값
const FNV_PRIME = 0x01000193; // FNV-1a 32비트 소수
function hashReviews(reviews: { review: string }[]): string {
  let h = FNV_OFFSET_BASIS;
  for (const { review } of reviews) {
    for (let i = 0; i < review.length; i++) {
      h ^= review.charCodeAt(i);
      h = Math.imul(h, FNV_PRIME);
    }
  }
  return (h >>> 0).toString(16);
}

// 샘플 기본값(spec §6: 긍5/부5/helpful5, 리뷰당 ~400자). 토큰 비용 보고 조정.
const SAMPLE: SampleOpts = {
  positive: 5,
  negative: 5,
  helpful: 5,
  maxLen: 400,
};

export async function fetchSteamGame(appid: number): Promise<SteamGameDTO> {
  const detailRes = await fetch(
    `https://store.steampowered.com/api/appdetails?appids=${appid}&l=korean&cc=kr`,
  );
  const detailJson = (await detailRes.json()) as Record<
    string,
    { success: boolean; data?: SteamAppData }
  >;
  const entry = detailJson[String(appid)];
  if (!entry?.success || !entry.data) {
    throw new Error(`appdetails 실패: appid=${appid}`);
  }

  // appreviews는 appdetails 성공의 부가 신호일 뿐 — 네트워크/파싱 실패나 success=0(레이트리밋 등)이어도
  // 전체를 실패시키지 않고 빈 리뷰로 폴백한다(spec §5: 리뷰 없으면 설명·태그만 축약 분석).
  let reviews: SteamReview[] = [];
  try {
    const reviewRes = await fetch(
      `https://store.steampowered.com/appreviews/${appid}?json=1&language=koreana&num_per_page=100&filter=recent`,
    );
    const reviewJson = (await reviewRes.json()) as {
      success?: number;
      reviews?: SteamReview[];
    };
    if (reviewJson.success === 1) reviews = reviewJson.reviews ?? [];
  } catch {
    reviews = [];
  }
  const sampled = sampleReviews(reviews, SAMPLE);

  return {
    appid,
    name: entry.data.name,
    description: entry.data.short_description ?? '',
    genres: (entry.data.genres ?? []).map((g) => g.description),
    categories: (entry.data.categories ?? []).map((c) => c.description),
    reviews: sampled,
    reviewsSnapshotHash: hashReviews(sampled),
  };
}

interface SteamAppData {
  name: string;
  short_description?: string;
  genres?: { description: string }[];
  categories?: { description: string }[];
}
