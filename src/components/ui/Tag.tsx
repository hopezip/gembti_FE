import { ark } from '@ark-ui/react/factory';
import { styled } from 'styled-system/jsx';
import { tag, type TagVariantProps } from 'styled-system/recipes';

// Park UI 베이스(ark factory) + GamBTI tag recipe로 스타일링.
// 읽기 전용 라벨이므로 button이 아닌 span 계열을 사용한다.
// semantic token만 쓰는 recipe를 styled factory에 연결하며 스타일을 추가하지 않는다.
export const Tag = styled(ark.span, tag);

export type TagProps = TagVariantProps;
