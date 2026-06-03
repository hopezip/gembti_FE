import { css, cx } from 'styled-system/css';

export interface GameSummaryCardProps {
  genres: string[];
  /** 평점. 백엔드가 무평점 게임을 줄 수 있어 null 허용 — null이면 ★를 숨긴다. */
  rating?: number | null;
  /** 커버 이미지 URL. 없으면 surfaceRaised placeholder로 대체. */
  thumbnailUrl?: string | null;
  /**
   * 카드 타이틀. 있으면 커버 아래 Bold 타이틀을 렌더하고 장르·평점 행을 바로 아래(mt 1.5)에 붙인다.
   * 없으면(추천/인기 그리드) 타이틀 없이 이미지→텍스트 48px 리듬을 유지한다.
   */
  title?: string;
  /** 좌상단 NEW 뱃지 표시(신규 게임 섹션). title과 독립적으로 동작. */
  isNew?: boolean;
}

// 공통 게임 카드(게임 도메인) — Figma 비회원 카드(4003:1404/4003:996) 기준. 메인 추천·인기·신규 그리드에서 공유.
// 테두리/배경(card chrome) 없이 둥근 이미지 + (옵션) 좌상단 NEW 뱃지 + (옵션) 타이틀 + 장르·평점 행(양끝 정렬).
// 글씨 sm(≈12.5px) / 장르 fg.subtle / ★ accent(주황) Regular.
// 타이틀 없을 때: 이미지→장르행 48px 리듬. 타이틀 있을 때: 이미지→타이틀 mt 12 → 장르행 mt 1.5.
// semantic token만 사용, 다른 도메인 import 없음. 런타임 이미지 URL만 style 인라인(Panda 정적 추출 불가).
export function GameSummaryCard({
  genres,
  rating,
  thumbnailUrl,
  title,
  isNew,
}: GameSummaryCardProps) {
  const hasCover = Boolean(thumbnailUrl);
  const hasTitle = Boolean(title);
  // 장르행 상단 간격: 타이틀 있으면 타이틀 아래 14px(Figma), 없으면 이미지 아래 48px(타이틀 자리)
  const metaRowSpacing = hasTitle ? css({ mt: '3.5' }) : css({ mt: '12' });

  return (
    <div>
      {/* 커버 (둥근 이미지, 카드 chrome 없음). NEW 뱃지 오버레이 기준점이라 position relative. */}
      <div
        className={css({
          position: 'relative',
          aspectRatio: '16/10',
          bg: 'bg.surfaceRaised',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 'xl',
          overflow: 'hidden',
        })}
        style={
          hasCover ? { backgroundImage: `url(${thumbnailUrl})` } : undefined
        }
      >
        {/* 좌상단 NEW 뱃지 — top/left 12px. accent 배경 + onAccent(흰색) 텍스트. */}
        {isNew && (
          <span
            className={css({
              position: 'absolute',
              top: '3',
              left: '3',
              bg: 'accent.default',
              color: 'fg.onAccent',
              borderRadius: 'xs', // 3px
              px: '1.5',
              py: '0.5',
              fontSize: '2xs', // 10px
              fontWeight: 'bold',
              letterSpacing: '0.6px',
              lineHeight: 'none',
            })}
          >
            NEW
          </span>
        )}
      </div>

      {/* 타이틀 (옵션) — 커버 아래 mt 20px(Figma 4029:4684 실측). Bold 16px. */}
      {hasTitle && (
        <div
          className={css({
            mt: '5', // 20px (Figma 커버 바닥→타이틀 간격)
            fontSize: 'xl', // 16px
            fontWeight: 'bold',
            color: 'fg.default',
            // 음수 letterSpacing은 30px↑ 헤딩에만(DESIGN_SYSTEM 1.2.4) — 16px 타이틀엔 미적용
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          })}
        >
          {title}
        </div>
      )}

      {/* 장르 · 평점 행 — 양끝 정렬. 상단 간격은 metaRowSpacing(타이틀 유무로 분기). */}
      <div
        className={cx(
          css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2',
          }),
          metaRowSpacing,
        )}
      >
        <span
          className={css({
            fontSize: 'sm',
            color: 'fg.subtle',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          })}
        >
          {genres.slice(0, 2).join(' · ')}
        </span>
        {rating != null && (
          <span
            className={css({
              fontSize: 'sm',
              color: 'accent.default',
              fontWeight: 'normal',
              flexShrink: 0,
            })}
          >
            ★ {rating.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}
