import { css } from 'styled-system/css';
import type { PostType } from '../types';

interface PostTypeTagProps {
  type: PostType;
}

const TYPE_LABEL: Record<PostType, string> = {
  free: '자유',
  review: '리뷰',
  party: '파티 모집',
  guide: '공략',
  notice: '공지',
};

// 타입별 border+text 색상 pill (Figma: type-tag, h=19px)
export function PostTypeTag({ type }: PostTypeTagProps) {
  const label = TYPE_LABEL[type];

  const styles = css.raw({
    display: 'inline-flex',
    alignItems: 'center',
    h: '19px',
    px: '1.5',
    borderRadius: 'full',
    border: '1px solid',
    fontFamily: 'mono',
    fontSize: '11.5px',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    lineHeight: '1',
  });

  if (type === 'review') {
    return (
      <span
        className={css({
          ...styles,
          borderColor: 'accent.default',
          bg: 'bg.subtle',
          color: 'accent.fg',
        })}
      >
        {label}
      </span>
    );
  }
  if (type === 'party') {
    return (
      <span
        className={css({
          ...styles,
          borderColor: 'success.default',
          color: 'success.fg',
        })}
      >
        {label}
      </span>
    );
  }
  if (type === 'guide') {
    return (
      <span
        className={css({
          ...styles,
          borderColor: 'info.default',
          color: 'info.fg',
        })}
      >
        {label}
      </span>
    );
  }
  if (type === 'notice') {
    return (
      <span
        className={css({
          ...styles,
          borderColor: 'warning.default',
          color: 'warning.fg',
        })}
      >
        {label}
      </span>
    );
  }
  // free (default)
  return (
    <span
      className={css({
        ...styles,
        borderColor: 'border.emphasized',
        color: 'fg.muted',
      })}
    >
      {label}
    </span>
  );
}
