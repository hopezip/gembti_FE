import type { Meta, StoryObj } from '@storybook/react-vite';
import { hstack } from 'styled-system/patterns';
import { Tag } from './Tag';

// GamBTI tag recipe가 다크·데스크탑 기준으로 렌더되는지 확인하는 검증용 샘플 스토리.
const meta = {
  title: 'UI/Tag',
  component: Tag,
  tags: ['autodocs'],
  args: {
    children: 'TAG',
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'review', 'party', 'guide', 'notice'],
    },
    filled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  args: { tone: 'neutral', children: '일반' },
};

export const Review: Story = {
  args: { tone: 'review', children: '리뷰' },
};

export const Party: Story = {
  args: { tone: 'party', children: '파티' },
};

export const Guide: Story = {
  args: { tone: 'guide', children: '공략' },
};

export const Notice: Story = {
  args: { tone: 'notice', children: '공지' },
};

// semantic token이 다크 색으로 적용되는지 한눈에 보기 위한 tone 모음.
export const AllTones: Story = {
  render: () => (
    <div className={hstack({ gap: '3', flexWrap: 'wrap' })}>
      <Tag tone="neutral">일반</Tag>
      <Tag tone="review">리뷰</Tag>
      <Tag tone="party">파티</Tag>
      <Tag tone="guide">공략</Tag>
      <Tag tone="notice">공지</Tag>
    </div>
  ),
};

// filled 강조형 — tone별 채워진 라벨을 함께 비교한다.
export const Filled: Story = {
  render: () => (
    <div className={hstack({ gap: '3', flexWrap: 'wrap' })}>
      <Tag tone="neutral" filled>
        일반
      </Tag>
      <Tag tone="review" filled>
        리뷰
      </Tag>
      <Tag tone="party" filled>
        파티
      </Tag>
      <Tag tone="guide" filled>
        공략
      </Tag>
      <Tag tone="notice" filled>
        공지
      </Tag>
    </div>
  ),
};
