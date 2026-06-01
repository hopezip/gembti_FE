import { useEffect, useRef, useState } from 'react';
import { css } from 'styled-system/css';

// 인증 코드 유효시간 카운트다운(LOGIN-FE-004 STEP2). 순수 표시 컴포넌트로,
// MM:SS 형식으로 남은 시간을 1초 간격으로 줄이고 0에 도달하면 onExpire를 호출한다.
// 코드의 실제 유효성 판별 책임은 없다(서버 verify가 410으로 만료를 알린다).
// 색은 semantic token만 사용한다(다크·데스크탑 전용).

interface CountdownTimerProps {
  /** 초기 유효시간(초). 보통 발송 응답의 ttlSeconds. */
  seconds: number;
  /** 카운트다운이 0에 도달하면 1회 호출된다. */
  onExpire?: () => void;
  /** key 등으로 재마운트하지 않고 외부에서 재시작할 때 바뀌는 값(재전송 시 갱신). */
  restartKey?: number;
}

function formatMmSs(total: number): string {
  const safe = Math.max(0, total);
  const mm = Math.floor(safe / 60)
    .toString()
    .padStart(2, '0');
  const ss = (safe % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function CountdownTimer({
  seconds,
  onExpire,
  restartKey,
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  // onExpire 최신 참조 유지(effect 재구독 방지).
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // seconds/restartKey 변경 시 카운트다운을 초기화한다(재전송 시 타이머 리셋).
  // restartKey는 동일 seconds로 재전송해도 effect를 재실행시키기 위한 트리거다(본문에서 소비).
  useEffect(() => {
    void restartKey;
    setRemaining(seconds);
  }, [seconds, restartKey]);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const expired = remaining <= 0;
  // 0 도달 시 onExpire 1회 통지.
  useEffect(() => {
    if (expired) onExpireRef.current?.();
  }, [expired]);

  return (
    <span
      role="timer"
      aria-live="polite"
      aria-label={
        expired ? '인증 코드 유효시간 만료' : '인증 코드 남은 유효시간'
      }
      className={css({
        fontFamily: 'mono',
        fontSize: 'sm',
        fontWeight: 'semibold',
        fontVariantNumeric: 'tabular-nums',
        color: expired ? 'danger.fg' : 'fg.muted',
      })}
    >
      {formatMmSs(remaining)}
    </span>
  );
}
