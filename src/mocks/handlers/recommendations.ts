import { http, passthrough } from 'msw';

export const recommendationHandlers = [
  http.post('*/api/v1/recommendations/generate', () => passthrough()),
  http.get('*/api/v1/recommendations/latest_reco', () => passthrough()),
  http.get('*/api/v1/recommendations/discounted', () => passthrough()),
  http.get('*/api/v1/recommendations/highly-rated', () => passthrough()),
  http.get('*/api/v1/recommendations/popular', () => passthrough()),
];
