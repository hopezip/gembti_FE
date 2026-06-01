// 로그인 성공 후 이동할 redirect 경로를 안전하게 정규화한다.
// 오픈 리다이렉트 방어: 앱 내부 상대경로만 허용한다.
// - 단일 `/`로 시작해야 함(앱 내부 절대경로)
// - `//`(프로토콜 상대 URL) 차단
// - `/\`(백슬래시로 우회하는 외부 URL) 차단
// - 절대 URL(`http://`, `https://` 등) 차단
// 위반 시 홈(`/`)으로 폴백한다(routing.md redirect 보존 + 보안).
const HOME = '/';

export function safeRedirect(raw: string | null | undefined): string {
  if (!raw) return HOME;

  // 반드시 `/`로 시작하는 앱 내부 경로여야 한다.
  if (!raw.startsWith('/')) return HOME;

  // `//` 또는 `/\`로 시작하면 프로토콜 상대/우회 외부 URL이므로 차단.
  if (raw.startsWith('//') || raw.startsWith('/\\')) return HOME;

  // 경로 내부에 백슬래시가 있으면(브라우저가 `/`로 정규화해 외부로 샐 수 있음) 차단.
  if (raw.includes('\\')) return HOME;

  return raw;
}
