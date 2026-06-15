import { http, HttpResponse } from 'msw';
import {
  MOCK_DISCOUNTED_RECOMMENDATIONS,
  MOCK_HIGHLY_RATED_RECOMMENDATIONS,
  MOCK_LATEST_RECOMMENDATIONS,
  MOCK_POPULAR_GAMES,
} from '@/mocks/data/recommendations';

function withLimit<T>(request: Request, games: T[]) {
  const requestedLimit = Number(new URL(request.url).searchParams.get('limit'));
  const limit =
    Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 12;
  return { games: games.slice(0, limit) };
}

export const recommendationHandlers = [
  http.get('*/api/v1/recommendations/latest_reco', ({ request }) =>
    HttpResponse.json(withLimit(request, MOCK_LATEST_RECOMMENDATIONS.games)),
  ),
  http.get('*/api/v1/recommendations/discounted', ({ request }) =>
    HttpResponse.json(
      withLimit(request, MOCK_DISCOUNTED_RECOMMENDATIONS.games),
    ),
  ),
  http.get('*/api/v1/recommendations/highly-rated', ({ request }) =>
    HttpResponse.json(
      withLimit(request, MOCK_HIGHLY_RATED_RECOMMENDATIONS.games),
    ),
  ),
  http.get('*/api/v1/games/popular', ({ request }) =>
    HttpResponse.json(withLimit(request, MOCK_POPULAR_GAMES.games)),
  ),
];
