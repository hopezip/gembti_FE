import { ark } from '@ark-ui/react/factory';
import { styled } from 'styled-system/jsx';
import { chip, type ChipVariantProps } from 'styled-system/recipes';

// Park UI 베이스(ark factory) + GamBTI chip recipe로 스타일링.
// 클릭 토글(필터/장르/성향 선택)용 primitive이므로 span이 아닌 button element를 쓴다.
// recipe에 variant는 없고 선택 상태는 소비자가 data-state="on"(또는 .on)으로 전달한다.
// thin primitive: 상태 로직/스타일을 추가하지 않고 styled factory에만 연결한다.
export const Chip = styled(ark.button, chip);

export type ChipProps = ChipVariantProps;
