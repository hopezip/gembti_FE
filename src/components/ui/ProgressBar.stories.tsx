import type { Meta, StoryObj } from '@storybook/react-vite';
import { css } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';
import { ProgressBar } from './ProgressBar';

// Ark UI Progress 기반 공용 진행률 primitive 검증용 스토리.
// value/label은 소비자가 계산해 넘기고, size만 표시 위치(카드/설문)에 맞춰 조절한다.
const meta = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  args: {
    value: 43,
    label: '43% 완료 · 3/7',
    size: 'sm',
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    label: {
      control: 'text',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
    },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

// 기본 카드용 얇은 막대.
export const Default: Story = {
  args: {
    value: 64,
    label: undefined,
    size: 'sm',
  },
};

// 설문 하단처럼 라벨과 더 높은 막대를 함께 쓰는 경우.
export const Survey: Story = {
  args: {
    value: 43,
    label: '43% 완료 · 3/7',
    size: 'md',
  },
};

// size별 높이 차이를 한눈에 확인한다.
export const Sizes: Story = {
  render: () => (
    <div
      className={vstack({
        gap: '5',
        alignItems: 'stretch',
        w: '28rem',
      })}
    >
      <div>
        <p
          className={css({
            mb: '2',
            color: 'fg.subtle',
            fontSize: 'sm',
            fontFamily: 'mono',
          })}
        >
          sm · card
        </p>
        <ProgressBar value={72} size="sm" />
      </div>
      <div>
        <p
          className={css({
            mb: '2',
            color: 'fg.subtle',
            fontSize: 'sm',
            fontFamily: 'mono',
          })}
        >
          md · survey
        </p>
        <ProgressBar value={72} label="72% 완료 · 5/7" size="md" />
      </div>
    </div>
  ),
};
