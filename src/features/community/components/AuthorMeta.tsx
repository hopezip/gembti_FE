import { css } from 'styled-system/css';
import type { PostAuthor } from '../types';

interface AuthorMetaProps {
  author: PostAuthor;
  timeAgo: string;
}

// 미니아바타(18px) + 닉네임 + 성향태그(orange/warning pill) + 시간 (Figma: author)
export function AuthorMeta({ author, timeAgo }: AuthorMetaProps) {
  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '1.5',
        h: '18px',
        minW: 0,
      })}
    >
      <div
        className={css({
          w: '18px',
          h: '18px',
          borderRadius: 'full',
          border: '1px solid',
          borderColor: 'border.default',
          bg: author.isAdmin ? 'accent.default' : 'bg.surfaceRaised',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        })}
      >
        <span
          className={css({
            fontFamily: 'mono',
            fontSize: '9px',
            color: 'fg.default',
            lineHeight: '1',
          })}
        >
          {author.initial}
        </span>
      </div>

      <span
        className={css({
          fontFamily: 'sans',
          fontWeight: 'medium',
          fontSize: '11.5px',
          color: 'fg.default',
          lineHeight: '1.2',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        })}
      >
        {author.nickname}
      </span>

      <span
        className={css({
          display: 'inline-flex',
          alignItems: 'center',
          h: '17px',
          px: '1.5',
          borderRadius: 'full',
          border: '1px solid',
          borderColor: author.isAdmin ? 'warning.default' : 'accent.default',
          bg: author.isAdmin ? 'warning.soft' : 'accent.soft',
          fontFamily: 'mono',
          fontSize: '9.5px',
          color: author.isAdmin ? 'warning.fg' : 'accent.fg',
          letterSpacing: '0.3px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          lineHeight: '1',
        })}
      >
        {author.personalityTag}
      </span>

      <span
        className={css({
          fontFamily: 'mono',
          fontSize: '11.5px',
          color: 'fg.subtle',
          lineHeight: '1.2',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        })}
      >
        {timeAgo}
      </span>
    </div>
  );
}
