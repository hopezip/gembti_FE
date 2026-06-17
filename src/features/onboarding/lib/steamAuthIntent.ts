export const STEAM_AUTH_INTENT_STORAGE_KEY = 'gembti:steam-auth-intent';

export interface SteamLinkAuthIntent {
  type: 'link';
  returnTo: string;
}

export type SteamAuthIntent = SteamLinkAuthIntent;

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage ?? null;
}

export function setSteamLinkAuthIntent(returnTo = '/mypage'): void {
  const storage = getSessionStorage();
  if (!storage) return;

  const intent: SteamLinkAuthIntent = { type: 'link', returnTo };
  try {
    storage.setItem(STEAM_AUTH_INTENT_STORAGE_KEY, JSON.stringify(intent));
  } catch {
    // Session storage may be blocked; the auth redirect can still proceed.
  }
}

export function readSteamAuthIntent(): SteamAuthIntent | null {
  const storage = getSessionStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(STEAM_AUTH_INTENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SteamAuthIntent>;
    if (parsed.type !== 'link' || typeof parsed.returnTo !== 'string') {
      return null;
    }
    return { type: 'link', returnTo: parsed.returnTo };
  } catch {
    return null;
  }
}

export function clearSteamAuthIntent(): void {
  const storage = getSessionStorage();
  if (!storage) return;

  try {
    storage.removeItem(STEAM_AUTH_INTENT_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
}
