import { HTTPError } from 'ky';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/ky';

interface UserStatsResponse {
  stats: Record<string, number>;
  source_type: string;
}

const STAT_LABEL: Record<string, string> = {
  combat: '액션',
  exploration: '오픈월드',
  strategy: '전략',
  growth: 'RPG',
  healing: '힐링',
  cooperation: '협동',
};

export interface StatTags {
  likedTags: string[];
  challengeTags: string[];
  likedMeta: string;
  challengeMeta: string;
}

function deriveStatTags(raw: UserStatsResponse): StatTags {
  const entries = Object.entries(raw.stats)
    .map(([key, score]) => ({ score, label: STAT_LABEL[key] }))
    .filter((e) => e.label != null)
    .sort((a, b) => b.score - a.score) as { score: number; label: string }[];

  const likedTags = entries.slice(0, 3).map((e) => e.label);
  const challengeTags = entries.slice(-2).map((e) => e.label);
  const likedMeta =
    raw.source_type === 'HYBRID_STEAM'
      ? 'Steam 플레이 데이터 기반'
      : '설문 응답 기반';

  return {
    likedTags,
    challengeTags,
    likedMeta,
    challengeMeta: '새로운 도전 거리로 추천',
  };
}

export function useStatTags(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['stats', 'me', 'tags'],
    queryFn: async ({ signal }) => {
      try {
        const raw = await api
          .get('api/v1/stats/me', { signal })
          .json<UserStatsResponse>();
        return deriveStatTags(raw);
      } catch (err) {
        if (err instanceof HTTPError && err.response.status === 404) {
          return {
            likedTags: [],
            challengeTags: [],
            likedMeta: '',
            challengeMeta: '',
          };
        }
        throw err;
      }
    },
    enabled: options?.enabled ?? true,
  });
}
