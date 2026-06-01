import type { Meta, StoryObj } from '@storybook/react-vite';
import { hstack } from 'styled-system/patterns';
import { Avatar } from './Avatar';

// DESIGN_SYSTEM 2.6 Avatar 표시 primitive 검증용 스토리.
// Avatar는 recipe 없는 조합 컴포넌트로, src가 있으면 이미지를, 없거나 로드 실패 시
// name 기반 이니셜 fallback을 보여준다. op(글쓴이)는 accent 보더+이니셜 색으로 강조한다.
// 다크/데스크탑/addon-a11y는 Storybook preview에 이미 적용되어 별도 처리하지 않는다.

// 정상 로드되는 샘플 이미지(외부 placeholder). 데모용이며 도메인 데이터가 아니다.
const SAMPLE_IMAGE = 'https://i.pravatar.cc/96?img=12';
// 의도적으로 깨진 src — onError fallback(이니셜) 전환을 보여주기 위함.
const BROKEN_IMAGE = 'https://example.com/this-image-does-not-exist.png';

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: {
    name: '김겜비',
    size: 'md',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    src: { control: 'text' },
    name: { control: 'text' },
    op: { control: 'boolean' },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

// 5개 사이즈(24/28/32/36/48)를 한 줄에 나열 — 원형·border·정렬 시각 확인.
export const Sizes: Story = {
  render: (args) => (
    <div className={hstack({ gap: '4', alignItems: 'center' })}>
      <Avatar {...args} size="xs" />
      <Avatar {...args} size="sm" />
      <Avatar {...args} size="md" />
      <Avatar {...args} size="lg" />
      <Avatar {...args} size="xl" />
    </div>
  ),
  args: { name: '김겜비', src: undefined },
};

// 이미지 정상 로드 — <img alt={name}> 렌더(cover).
export const WithImage: Story = {
  args: { name: '김겜비', src: SAMPLE_IMAGE, size: 'lg' },
};

// src 미제공 → name 기반 이니셜 fallback(aria-label로 접근명 유지).
export const InitialsFallback: Story = {
  args: { name: '홍길동', src: undefined, size: 'lg' },
};

// OP(글쓴이) — accent 보더 + 이니셜 accent 색 강조.
export const OP: Story = {
  args: { name: '운영자', src: undefined, op: true, size: 'lg' },
};

// 깨진 src → onError로 이니셜 fallback 전환(접근명 유지).
export const BrokenImageFallback: Story = {
  args: { name: '오류남', src: BROKEN_IMAGE, size: 'lg' },
};

// 이미지·이니셜·OP 혼합 나열 — 실제 사용 맥락(댓글/헤더) 미리보기.
export const Showcase: Story = {
  render: () => (
    <div className={hstack({ gap: '4', alignItems: 'center' })}>
      <Avatar name="김겜비" src={SAMPLE_IMAGE} size="md" />
      <Avatar name="홍길동" size="md" />
      <Avatar name="운영자" op size="md" />
      <Avatar name="이도현" src={BROKEN_IMAGE} size="md" />
      <Avatar name="Park Jae" size="xl" />
      <Avatar name="OP User" op src={SAMPLE_IMAGE} size="xl" />
    </div>
  ),
};
