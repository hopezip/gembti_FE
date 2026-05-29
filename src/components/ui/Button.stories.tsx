import type { Meta, StoryObj } from '@storybook/react-vite';
import { hstack } from 'styled-system/patterns';
import { Button } from './Button';

// GamBTI button recipe가 다크·데스크탑 기준으로 렌더되는지 확인하는 검증용 샘플 스토리.
const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Button',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost', 'danger', 'dangerSolid'],
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary', children: '추천 받기' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: '취소' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: '더 보기' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: '삭제' },
};

// semantic token이 다크 색으로 적용되는지 한눈에 보기 위한 variant 모음.
export const AllVariants: Story = {
  render: () => (
    <div className={hstack({ gap: '4', flexWrap: 'wrap' })}>
      <Button variant="primary">추천 받기</Button>
      <Button variant="secondary">취소</Button>
      <Button variant="ghost">더 보기</Button>
      <Button variant="danger">삭제</Button>
      <Button variant="dangerSolid">영구 삭제</Button>
    </div>
  ),
};
