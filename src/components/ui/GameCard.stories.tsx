import type { Meta, StoryObj } from '@storybook/react-vite';
import { hstack, vstack } from 'styled-system/patterns';
import { Button } from './Button';
import { GameCard } from './GameCard';
import { Tag } from './Tag';

// GamBTI gameCard recipe가 다크·데스크탑 기준으로 렌더되는지 확인하는 검증용 샘플 스토리.
// GameCard는 thin 컨테이너 primitive라 콘텐츠 구성은 소비자가 한다(스토리에서 시연).
const meta = {
  title: 'UI/GameCard',
  component: GameCard,
  tags: ['autodocs'],
  args: {
    children: '카드 콘텐츠 — 소비자가 구성한다.',
  },
  argTypes: {
    padding: {
      control: 'inline-radio',
      options: ['none', 'sm', 'md', 'lg'],
    },
    interactive: {
      control: 'boolean',
    },
    tone: {
      control: 'inline-radio',
      options: ['default', 'accent'],
    },
  },
} satisfies Meta<typeof GameCard>;

export default meta;

type Story = StoryObj<typeof meta>;

// 기본 카드(padding=md, tone=default).
export const Default: Story = {
  args: { children: '게임 추천 카드의 기본 컨테이너입니다.' },
};

// padding none/sm/md/lg를 한눈에 비교한다.
export const Paddings: Story = {
  render: () => (
    <div
      className={hstack({
        gap: '4',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
      })}
    >
      <GameCard padding="none">padding: none</GameCard>
      <GameCard padding="sm">padding: sm</GameCard>
      <GameCard padding="md">padding: md</GameCard>
      <GameCard padding="lg">padding: lg</GameCard>
    </div>
  ),
};

// interactive=true는 hover 시 border 강조 + 떠오름 효과만 제공한다.
// 클릭 가능한 카드는 소비자가 onClick/role/tabIndex/키보드 핸들러를 직접 부여한다(a11y는 사용 패턴).
export const Interactive: Story = {
  render: () => (
    <div
      className={hstack({
        gap: '4',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
      })}
    >
      <GameCard interactive>hover 시 떠오름 (시각 효과만)</GameCard>
      <GameCard
        interactive
        role="button"
        tabIndex={0}
        onClick={() => alert('카드 클릭')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            alert('카드 클릭');
          }
        }}
      >
        클릭 가능 카드 (소비자가 onClick/role/키보드 부여)
      </GameCard>
    </div>
  ),
};

// tone=accent — 강조 카드(좌측 보더 + 그라데이션은 recipe 책임).
export const AccentTone: Story = {
  args: { tone: 'accent', children: '강조 추천 카드 (tone=accent)' },
};

// 카탈로그 하이라이트: 기존 Tag·Button primitive를 카드 안에 조합한 실제 게임 추천 카드.
// 카드 내부 레이아웃은 소비자가 패턴(vstack/hstack)으로 구성한다(primitive는 thin 유지).
export const Composed: Story = {
  render: () => (
    <GameCard interactive tone="accent" padding="lg">
      <div className={vstack({ gap: '3', alignItems: 'stretch' })}>
        <div className={hstack({ gap: '2', flexWrap: 'wrap' })}>
          <Tag tone="party" filled>
            파티
          </Tag>
          <Tag tone="review">리뷰 9.2</Tag>
          <Tag tone="guide">공략 풍부</Tag>
        </div>
        <strong>Elden Ring</strong>
        <span>
          혼자보다 함께 도전을 즐기는 당신에게 추천하는 오픈월드 액션 RPG.
        </span>
        <div className={hstack({ gap: '3' })}>
          <Button variant="primary">추천 받기</Button>
          <Button variant="ghost">더 보기</Button>
        </div>
      </div>
    </GameCard>
  ),
};
