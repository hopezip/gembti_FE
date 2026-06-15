import type { ReactNode } from 'react';
import { css } from 'styled-system/css';

export interface PersonalizedGameCardProps {
  /** 카드 타이틀(Bold). */
  title: string;
  /** 커버 이미지 URL. 없으면 surfaceRaised placeholder로 대체. */
  thumbnailUrl?: string | null;
  /** 장르 목록. 최대 2개 표시. */
  genres?: string[];
  /** 커버 우측 상단에 표시할 선택적 배지. */
  imageBadge?: string;
  /** 추천 이유 한 줄. 앞에 작은 주황 세로 마커. */
  reasonTagline?: string;
  /** 가격처럼 카드별로 다른 부가 정보를 기존 카드 하단에 추가한다. */
  footer?: ReactNode;
}

// 개인화 추천 카드(게임 도메인) — Figma 로그인 추천 카드(노드 4003:41 내부 카드) 기준. MAIN-FE-006.
// 게스트 GameSummaryCard와 분리한 별도 공통 컴포넌트(접근 A — 회귀 위험 0).
// 구성: 둥근 커버 + 선택적 우상단 배지 + 타이틀(Bold) + 하단 reason 태그라인.
// 장르·평점 행은 없다(추천이유 태그라인으로 대체).
// semantic token만 사용. 런타임 이미지 URL만 인라인 style(Panda 정적 추출 불가).
export function PersonalizedGameCard({
  title,
  thumbnailUrl,
  genres,
  imageBadge,
  reasonTagline,
  footer,
}: PersonalizedGameCardProps) {
  const hasCover = Boolean(thumbnailUrl);

  return (
    <div>
      {/* 커버 (둥근 이미지, 카드 chrome 없음). */}
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
        {imageBadge && (
          <span
            className={css({
              position: 'absolute',
              top: '3',
              right: '3',
              bg: 'bg.overlay',
              border: '1px solid',
              borderColor: 'accent.default',
              color: 'accent.default',
              borderRadius: 'full',
              px: '2.5',
              py: '1',
              fontFamily: 'mono',
              fontSize: 'sm',
              fontWeight: 'bold',
              lineHeight: 'none',
            })}
          >
            {imageBadge}
          </span>
        )}
      </div>

      {/* 타이틀 — 커버 아래 mt 20px(Figma 실측). Bold 16px. */}
      <div
        className={css({
          mt: '5', // 20px
          fontSize: 'xl', // 16px
          fontWeight: 'bold',
          color: 'fg.default',
          // 음수 letterSpacing은 30px↑ 헤딩에만(DESIGN_SYSTEM 1.2.4) — 16px 타이틀엔 미적용(GameSummaryCard와 일관).
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        })}
      >
        {title}
      </div>

      {/* 장르 태그 — 최대 2개, fg.subtle sm. */}
      {genres && genres.length > 0 && (
        <div
          className={css({
            mt: '1.5',
            fontSize: 'sm',
            color: 'fg.subtle',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          })}
        >
          {genres.slice(0, 2).join(' · ')}
        </div>
      )}

      {/* 추천 이유 태그라인 — 앞에 작은 주황 세로 마커 + fg.muted 텍스트(12px). */}
      {reasonTagline && (
        <div
          className={css({
            mt: '4',
            display: 'flex',
            alignItems: 'center',
            gap: '2',
          })}
        >
          <span
            className={css({
              w: '0.5',
              h: '4',
              bg: 'accent.default',
              borderRadius: 'full',
              flexShrink: 0,
            })}
            aria-hidden="true"
          />
          <span
            className={css({
              fontSize: 'sm',
              color: 'fg.muted',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            })}
          >
            {reasonTagline}
          </span>
        </div>
      )}
      {footer}
    </div>
  );
}
