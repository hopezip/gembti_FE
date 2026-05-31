import { ark } from '@ark-ui/react/factory';
import { styled } from 'styled-system/jsx';
import { input, type InputVariantProps } from 'styled-system/recipes';

// Park UI 베이스(ark factory) + GamBTI input recipe로 스타일링.
// 텍스트 입력 primitive이므로 span/button이 아닌 input element를 쓴다.
// thin primitive: 폼 로직(register/Controller/에러 메시지)이나 상태 스타일을 추가하지 않고
// styled factory에만 연결한다. invalid 시각은 소비자가 aria-invalid={true}로 전달한다.
export const Input = styled(ark.input, input);

export type InputProps = InputVariantProps;
