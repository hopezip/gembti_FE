import type { ComponentProps } from 'react';
import { ark } from '@ark-ui/react/factory';
import { css, cx } from 'styled-system/css';
import { styled } from 'styled-system/jsx';
import { spinner } from 'styled-system/recipes';

const ParkSpinner = styled(ark.span, spinner);
const spinningRingStyle = css({
  animation: 'spin',
  borderColor: 'currentColor',
  borderInlineEndColor: 'transparent',
});

export interface SpinnerProps extends ComponentProps<typeof ParkSpinner> {}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <ParkSpinner
      aria-label="로딩 중"
      role="status"
      {...props}
      className={cx(spinningRingStyle, className)}
    />
  );
}
