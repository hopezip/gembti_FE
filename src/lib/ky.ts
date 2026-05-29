import ky from 'ky';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = ky.create({
  prefixUrl: API_BASE_URL || undefined,
  credentials: 'include',
});
