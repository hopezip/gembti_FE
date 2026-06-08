import { ark } from '@ark-ui/react/factory';
import { styled } from 'styled-system/jsx';
import { gameCard, type GameCardVariantProps } from 'styled-system/recipes';

// Park UI 베이스(ark factory) + GamBTI gameCard recipe로 스타일링한 컨테이너 primitive.
// Tag/Button과 달리 children을 받아 감싸는 thin 컨테이너이며 element는 div다.
// semantic token만 쓰는 recipe를 styled factory에 연결하며 내부 슬롯/레이아웃/스타일을 추가하지 않는다.
// interactive=true는 hover 시각 효과만 제공하고, 클릭/role/키보드 a11y는 소비자가 부여한다.
export const GameCard = styled(ark.div, gameCard);

export type GameCardProps = GameCardVariantProps;

// 카드 컨테이너 의미로 쓸 때의 alias(동일 gameCard recipe). 게임 외 일반 카드에 사용.
export const Card = GameCard;
export type CardProps = GameCardVariantProps;
