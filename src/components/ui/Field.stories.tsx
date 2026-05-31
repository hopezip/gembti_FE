import type { Meta, StoryObj } from '@storybook/react-vite';
import { css } from 'styled-system/css';
import { Field } from './Field';
import { Input } from './Input';

// DESIGN_SYSTEM 2.15 Field(Form Wrapper) 조합 래퍼 검증용 스토리.
// Field는 recipe 없는 조합 컴포넌트이므로 children으로 기존 Input을 받아
// label row → 입력 슬롯 → help/error를 얹고 a11y(htmlFor/aria-*)를 자동 연결한다.
// 다크/데스크탑/addon-a11y는 Storybook preview에 이미 적용되어 별도 처리하지 않는다.
const meta = {
  title: 'UI/Field',
  component: Field,
  tags: ['autodocs'],
  args: {
    label: '이메일',
    id: 'field-email',
    children: <Input type="email" placeholder="you@example.com" />,
  },
  argTypes: {
    label: { control: 'text' },
    id: { control: 'text' },
    required: { control: 'boolean' },
    hint: { control: 'text' },
    help: { control: 'text' },
    error: { control: 'text' },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div className={css({ w: '22rem' })}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

// 기본 — label + 입력만.
export const Default: Story = {
  args: {
    label: '이메일',
    id: 'field-email-default',
    children: <Input type="email" placeholder="you@example.com" />,
  },
};

// 필수 — 라벨에 accent `*` 표시, 입력에 aria-required 주입.
export const Required: Story = {
  args: {
    label: '비밀번호',
    id: 'field-password-required',
    required: true,
    children: <Input type="password" placeholder="••••••••" />,
  },
};

// hint — label row 우측에 mono 보조 힌트.
export const WithHint: Story = {
  args: {
    label: '닉네임',
    id: 'field-nickname-hint',
    hint: '2–16자',
    children: <Input placeholder="게이머 닉네임" />,
  },
};

// help — 입력 아래 도움말(mono), aria-describedby로 연결.
export const WithHelp: Story = {
  args: {
    label: '이메일',
    id: 'field-email-help',
    help: '로그인 및 알림 수신에 사용됩니다.',
    children: <Input type="email" placeholder="you@example.com" />,
  },
};

// error — error가 help를 대체. 입력에 aria-invalid + aria-describedby(errorId) 주입.
export const WithError: Story = {
  args: {
    label: '닉네임',
    id: 'field-nickname-error',
    required: true,
    help: '이 도움말은 error가 있으면 표시되지 않습니다.',
    error: '닉네임은 2자 이상이어야 합니다.',
    children: <Input defaultValue="a" />,
  },
};

// disabled — 비활성 입력 조합.
export const Disabled: Story = {
  args: {
    label: '아이디',
    id: 'field-id-disabled',
    help: '아이디는 변경할 수 없습니다.',
    children: <Input value="gamer_2026" readOnly disabled />,
  },
};
