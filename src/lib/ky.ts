import ky from 'ky';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const api = ky.create({
  prefixUrl: API_BASE_URL || undefined,
  credentials: 'include',
});
