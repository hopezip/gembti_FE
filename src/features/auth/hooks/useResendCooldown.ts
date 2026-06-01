import { useCallback, useEffect, useRef, useState } from 'react';

// 인증 코드 재전송 쿨다운(LOGIN-FE-004 STEP2).
// start() 호출 시 cooldownSeconds(기본 30초)부터 1초 간격으로 줄어들며,
// 남은 초(remaining)와 활성 여부(isCooling)를 노출한다. 재전송 버튼 disable 제어용.

const DEFAULT_COOLDOWN_SECONDS = 30;

interface UseResendCooldownResult {
  /** 남은 쿨다운(초). 0이면 재전송 가능. */
  remaining: number;
  /** 쿨다운 진행 중 여부(remaining > 0). */
  isCooling: boolean;
  /** 쿨다운을 cooldownSeconds부터 재시작한다. */
  start: () => void;
}

export function useResendCooldown(
  cooldownSeconds: number = DEFAULT_COOLDOWN_SECONDS,
): UseResendCooldownResult {
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    setRemaining(cooldownSeconds);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clear();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [cooldownSeconds, clear]);

  // 언마운트 시 인터벌 정리.
  useEffect(() => clear, [clear]);

  return { remaining, isCooling: remaining > 0, start };
}
