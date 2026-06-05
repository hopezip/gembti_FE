import { useMutation } from '@tanstack/react-query';
import { steamLink, type SteamLinkResult } from '@/services/steam';

// 스팀 계정 연동 뮤테이션 훅 (STEAM-INTER-FE-001) — 미사용 스켈레톤.
// REQ-003가 A안(백엔드 OpenID 위임)이라 현재 호출부가 없다.
//   B안(FE가 steamId 직접 전달)으로 확정되면 호출부에서 mutate(steamId)로 배선한다.
export function useSteamLink() {
  return useMutation<SteamLinkResult, Error, string>({
    mutationFn: steamLink,
  });
}
