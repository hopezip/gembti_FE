import { useMutation } from '@tanstack/react-query';
import { skipSteam, type SteamSkipResult } from '@/services/steam';

// 스팀 연동 스킵 뮤테이션 훅 (STEAM-INTER-FE-001).
// 성공 시 { nextStep, message }를 반환한다. navigate(다음 화면 이동)는 호출부 책임.
export function useSteamSkip() {
  return useMutation<SteamSkipResult>({
    mutationFn: skipSteam,
  });
}
