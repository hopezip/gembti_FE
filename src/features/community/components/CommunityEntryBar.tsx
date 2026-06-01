import { css } from 'styled-system/css';

interface CommunityEntryBarProps {
  context?: string;
  breadcrumb1?: string;
  breadcrumb2?: string;
}

// 커뮤니티 진입 컨텍스트 바 (Figma comm-entry, h=55px).
// 사용자가 어떤 경로로 커뮤니티에 진입했는지 상단에 pill + 브레드크럼으로 표시.
// 미연결 시 기본값(성향 결과 진입 mock)을 보여준다.
export function CommunityEntryBar({
  context = '진입 컨텍스트',
  breadcrumb1 = '"오픈월드 RPG" 성향 결과에서 진입',
  breadcrumb2 = '같은 취향의 유저들이 모인 커뮤니티에요',
}: CommunityEntryBarProps) {
  return (
    <div
      className={css({
        h: '55px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'border.default',
        px: { base: '7', '2xl': '8' },
      })}
    >
      <div
        className={css({
          w: 'full',
          display: 'flex',
          alignItems: 'center',
          gap: '4',
        })}
      >
        {/* 진입 컨텍스트 pill — accent 테두리 + 14% opacity 배경 */}
        <span
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            flexShrink: 0,
            h: '22px',
            px: '2.5',
            borderRadius: 'full',
            border: '1px solid',
            borderColor: 'accent.default',
            bg: 'accent.soft',
            fontFamily: 'mono',
            fontSize: 'xs',
            letterSpacing: 'wide',
            color: 'accent.fg',
            whiteSpace: 'nowrap',
          })}
        >
          {context}
        </span>

        {/* 브레드크럼 */}
        <span
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            minW: '0',
            overflow: 'hidden',
          })}
        >
          <span
            className={css({
              textStyle: 'body.sm',
              color: 'fg.muted',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            })}
          >
            {breadcrumb1}
          </span>
          <span
            className={css({
              color: 'fg.subtle',
              fontSize: 'md',
              flexShrink: 0,
            })}
            aria-hidden="true"
          >
            ›
          </span>
          <span
            className={css({
              textStyle: 'body.sm',
              color: 'fg.muted',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            })}
          >
            {breadcrumb2}
          </span>
        </span>
      </div>
    </div>
  );
}
