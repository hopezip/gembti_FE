import { type ReactNode, useId } from 'react';
import { css, cx } from 'styled-system/css';

// 토큰 기반 로컬 체크박스 (Park UI/공유 primitive에 없어 auth feature 로컬로 둔다 — 전역 recipe 신설 안 함).
// 접근성: 시각만 박스로 그리되 실제 상태는 네이티브 input[type=checkbox]가 보유(visually-hidden)한다.
// label로 감싸 박스/텍스트 클릭 모두 토글된다. semantic token만 사용.

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** 라벨 내용 */
  children: ReactNode;
  /** muted 스타일(예: [선택] 항목) */
  muted?: boolean;
}

export function Checkbox({
  checked,
  onCheckedChange,
  children,
  muted = false,
}: CheckboxProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '2',
        cursor: 'pointer',
        textStyle: 'body.sm',
        color: muted ? 'fg.subtle' : 'fg.muted',
        userSelect: 'none',
      })}
    >
      {/* 실제 상태 보유 — 시각만 숨기고 포커스/키보드 동작은 유지 */}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className={cx('peer', css({ srOnly: true }))}
      />
      <span
        aria-hidden="true"
        className={css({
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          w: '4',
          h: '4',
          borderRadius: 'sm',
          border: '1px solid',
          borderColor: checked ? 'accent.default' : 'border.emphasized',
          bg: checked ? 'accent.default' : 'bg.canvas',
          color: 'fg.onAccent',
          fontSize: '2xs',
          lineHeight: '1',
          // 키보드 포커스 링(시각 박스에 표시)
          _peerFocusVisible: {
            outline: '2px solid',
            outlineColor: 'border.accent',
            outlineOffset: '1px',
          },
        })}
      >
        {checked ? '✓' : ''}
      </span>
      {children}
    </label>
  );
}
