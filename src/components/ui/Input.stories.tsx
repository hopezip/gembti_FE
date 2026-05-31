import type { Meta, StoryObj } from '@storybook/react-vite';
import { css } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';
import { Input } from './Input';

// GamBTI input recipe가 다크·데스크탑 기준으로 렌더되는지 확인하는 검증용 샘플 스토리.
// recipe의 size(sm/md/lg) variant 외 상태 스타일은 소비자가 네이티브 prop으로 전달한다.
// invalid 시각은 소비자가 aria-invalid={true}를 넘겨 표현하는 thin primitive 계약이다.
const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    placeholder: '게임 이름을 입력하세요',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    placeholder: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

// 기본 상태(size=md).
export const Default: Story = {
  args: { placeholder: '게임 이름을 입력하세요' },
};

// size variant 비교 — sm/md/lg를 세로로 나열한다.
export const Sizes: Story = {
  render: () => (
    <div className={vstack({ gap: '3', alignItems: 'stretch', w: '20rem' })}>
      <Input size="sm" placeholder="sm (36px)" />
      <Input size="md" placeholder="md (40px · 기본)" />
      <Input size="lg" placeholder="lg (48px)" />
    </div>
  ),
};

// placeholder 표시 — fg.placeholder 토큰이 다크 색으로 적용되는지 확인.
export const WithPlaceholder: Story = {
  args: { placeholder: '예) Elden Ring' },
};

// 비활성 상태 — recipe의 _disabled(opacity/cursor)가 적용되는지 확인.
export const Disabled: Story = {
  args: { disabled: true, value: '수정 불가', readOnly: true },
};

// 오류 상태 — 소비자가 aria-invalid={true}를 전달해 시각/스크린리더에 반영한다.
// 컴포넌트는 폼 로직/에러 메시지를 갖지 않으므로 소비자(이 스토리)가
// label 연결 + aria-describedby로 에러 메시지를 함께 노출하는 사용 예를 시연한다.
export const Invalid: Story = {
  render: () => (
    <div className={vstack({ gap: '1.5', alignItems: 'stretch', w: '20rem' })}>
      <label
        htmlFor="nickname-invalid"
        className={css({ color: 'fg.muted', fontSize: 'sm' })}
      >
        닉네임
      </label>
      <Input
        id="nickname-invalid"
        aria-invalid={true}
        aria-describedby="nickname-invalid-error"
        defaultValue="ab"
      />
      <p
        id="nickname-invalid-error"
        className={css({ color: 'danger.default', fontSize: 'sm' })}
      >
        닉네임은 3자 이상이어야 합니다.
      </p>
    </div>
  ),
};

// label 연결 사용 예 — <label htmlFor>로 입력과 라벨을 연결(a11y).
// 컴포넌트에 label을 강제하지 않고, 소비자가 연결하는 권장 패턴만 시연한다.
export const WithLabel: Story = {
  render: () => (
    <div className={vstack({ gap: '1.5', alignItems: 'stretch', w: '20rem' })}>
      <label
        htmlFor="email-input"
        className={css({ color: 'fg.muted', fontSize: 'sm' })}
      >
        이메일
      </label>
      <Input id="email-input" type="email" placeholder="you@example.com" />
    </div>
  ),
};
