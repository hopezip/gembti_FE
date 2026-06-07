import { Progress } from '@ark-ui/react/progress';
import { css, cx } from 'styled-system/css';

type ProgressBarSize = 'sm' | 'md';

// Ark UI Progress의 구조는 공통으로 맞추고, 사용 위치별 높이만 size로 조절한다.
const styles = {
  root: css({
    display: 'grid',
    gap: '1.5',
    w: 'full',
  }),
  label: css({
    color: 'fg.default',
    fontFamily: 'mono',
    fontSize: '2xs',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadow: '0 2px 12px token(colors.bg.canvas)',
  }),
  track: css({
    h: '1',
    overflow: 'hidden',
    borderRadius: 'full',
    bg: 'color-mix(in srgb, token(colors.fg.subtle) 34%, transparent)',
  }),
  range: css({
    h: 'full',
    borderRadius: 'full',
    bg: 'accent.default',
    boxShadow: '0 0 16px token(colors.accent.default)',
    transition: 'width token(durations.slow) token(easings.standard)',
  }),
  trackMedium: css({
    h: '2',
  }),
};

interface ProgressBarProps {
  value: number;
  label?: string;
  size?: ProgressBarSize;
  className?: string;
}

export function ProgressBar({
  value,
  label,
  size = 'sm',
  className,
}: ProgressBarProps) {
  return (
    <Progress.Root
      className={cx(styles.root, className)}
      value={value}
      min={0}
      max={100}
    >
      {label ? (
        <Progress.Label className={styles.label}>{label}</Progress.Label>
      ) : null}
      <Progress.Track
        className={cx(styles.track, size === 'md' && styles.trackMedium)}
      >
        <Progress.Range className={styles.range} />
      </Progress.Track>
    </Progress.Root>
  );
}
