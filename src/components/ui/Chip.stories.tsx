import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { hstack } from 'styled-system/patterns';
import { Chip } from './Chip';

// GamBTI chip recipe가 다크·데스크탑 기준으로 렌더되는지 확인하는 검증용 샘플 스토리.
// recipe에 variant가 없어 컨트롤은 children/disabled 등 기본 prop 위주다.
// 선택 상태는 소비자가 data-state="on"(또는 .on)으로 전달하는 계약이다.
const meta = {
  title: 'UI/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: {
    children: 'RPG',
  },
  argTypes: {
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

// 미선택 기본 상태.
export const Default: Story = {
  args: { children: 'RPG' },
};

// 선택 상태 — 소비자가 data-state="on"을 직접 전달한다.
export const Selected: Story = {
  render: () => <Chip data-state="on">RPG</Chip>,
};

// 클릭 토글 + aria-pressed 연동. 컴포넌트는 상태를 갖지 않으므로
// 소비자(이 스토리)가 useState로 선택 상태를 관리하고 data-state/aria-pressed를 함께 전달한다.
export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = useState(false);
    return (
      <Chip
        aria-pressed={selected}
        data-state={selected ? 'on' : undefined}
        onClick={() => setSelected((prev) => !prev)}
      >
        RPG
      </Chip>
    );
  },
};

// 여러 칩을 hstack으로 나열 — 다중 선택 토글 그룹 사용 패턴.
export const ChipGroup: Story = {
  render: () => {
    const genres = ['RPG', 'FPS', '시뮬레이션', '액션', '캐주얼'];
    const [selected, setSelected] = useState<string[]>(['RPG', '액션']);
    const toggle = (genre: string) =>
      setSelected((prev) =>
        prev.includes(genre)
          ? prev.filter((g) => g !== genre)
          : [...prev, genre],
      );

    return (
      <div className={hstack({ gap: '2', flexWrap: 'wrap' })}>
        {genres.map((genre) => {
          const isOn = selected.includes(genre);
          return (
            <Chip
              key={genre}
              aria-pressed={isOn}
              data-state={isOn ? 'on' : undefined}
              onClick={() => toggle(genre)}
            >
              {genre}
            </Chip>
          );
        })}
      </div>
    );
  },
};
