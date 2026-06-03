import { css } from 'styled-system/css';

export interface PersonalizedGameCardProps {
  /** 카드 타이틀(Bold). */
  title: string;
  /** 커버 이미지 URL. 없으면 surfaceRaised placeholder로 대체. */
  thumbnailUrl?: string | null;
  /** 매칭률(0~100). 우상단 % 배지 + 프로그레스바 width에 사용. */
  matchRate: number;
  /** 추천 이유 한 줄(예: "엘든 링 ★5와 유사"). 앞에 작은 주황 사각 마커. */
  reasonTagline: string;
}

// 개인화 추천 카드(게임 도메인) — Figma 로그인 추천 카드(노드 4003:41 내부 카드) 기준. MAIN-FE-006.
// 게스트 GameSummaryCard와 분리한 별도 공통 컴포넌트(접근 A — 회귀 위험 0).
// 구성: 둥근 커버 + 우상단 % 배지(주황 외곽선 pill) + 타이틀(Bold) + 주황 프로그레스바 + 하단 reason 태그라인.
// 장르·평점 행은 없다(추천이유 태그라인으로 대체).
// semantic token만 사용. 런타임 이미지 URL과 프로그레스바 width %만 인라인 style(Panda 정적 추출 불가).
export function PersonalizedGameCard({
  title,
  thumbnailUrl,
  matchRate,
  reasonTagline,
}: PersonalizedGameCardProps) {
  const hasCover = Boolean(thumbnailUrl);
  // width %는 0~100으로 clamp(데이터 이상치 방지). 인라인 style은 동적 %라 정당.
  const barWidth = `${Math.min(100, Math.max(0, matchRate))}%`;

  return (
    <div>
      {/* 커버 (둥근 이미지, 카드 chrome 없음). % 배지 오버레이 기준점이라 position relative. */}
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
        {/* 우상단 % 배지 — 주황 외곽선 pill, 어두운 반투명 배경 + accent 텍스트(JetBrains Mono Bold). */}
        <span
          className={css({
            position: 'absolute',
            top: '3',
            right: '3',
            display: 'inline-flex',
            alignItems: 'center',
            bg: 'bg.overlay',
            border: '1px solid',
            borderColor: 'accent.default',
            color: 'accent.default',
            borderRadius: 'full',
            px: '2.5',
            py: '1',
            fontFamily: 'mono',
            fontSize: 'sm', // 12px
            fontWeight: 'bold',
            letterSpacing: '0.3px',
            lineHeight: 'none',
          })}
        >
          {matchRate}%
        </span>
      </div>

      {/* 타이틀 — 커버 아래 mt 20px(Figma 실측). Bold 16px. */}
      <div
        className={css({
          mt: '5', // 20px
          fontSize: 'xl', // 16px
          fontWeight: 'bold',
          color: 'fg.default',
          letterSpacing: '-0.1px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        })}
      >
        {title}
      </div>

      {/* 매칭률 프로그레스바 — 트랙(surfaceRaised) 위 accent fill. height 4px, pill. */}
      <div
        className={css({
          mt: '4', // 타이틀→바 ~16px(Figma)
          h: '1', // 4px
          bg: 'bg.surfaceRaised',
          borderRadius: 'full',
          overflow: 'hidden',
        })}
      >
        <div
          className={css({
            h: 'full',
            bg: 'accent.default',
            borderRadius: 'full',
          })}
          // width는 매칭률 기반 동적 값이라 인라인 style이 정당(Panda 정적 추출 불가).
          style={{ width: barWidth }}
        />
      </div>

      {/* 추천 이유 태그라인 — 앞에 작은 주황 세로 마커 + fg.muted 텍스트(12px). */}
      <div
        className={css({
          mt: '4', // 바→태그라인 ~17px(Figma)
          display: 'flex',
          alignItems: 'center',
          gap: '2', // 8px
        })}
      >
        <span
          className={css({
            w: '0.5', // 2px
            h: '4', // ~16px
            bg: 'accent.default',
            borderRadius: 'full',
            flexShrink: 0,
          })}
          aria-hidden="true"
        />
        <span
          className={css({
            fontSize: 'sm', // 12px
            color: 'fg.muted',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          })}
        >
          {reasonTagline}
        </span>
      </div>
    </div>
  );
}
