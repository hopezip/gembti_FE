import { http, HttpResponse } from 'msw';
import { authHandlers } from './auth';

export const handlers = [
  http.get('/health', () => HttpResponse.json({ ok: true })),
  ...authHandlers,
];
