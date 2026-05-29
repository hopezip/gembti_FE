import { ark } from '@ark-ui/react/factory';
import { styled } from 'styled-system/jsx';
import { button, type ButtonVariantProps } from 'styled-system/recipes';

// Park UI 베이스(ark factory) + GamBTI button recipe로 스타일링.
// semantic token만 사용하는 recipe를 styled factory에 연결한다.
export const Button = styled(ark.button, button);

export type ButtonProps = ButtonVariantProps;
