import { css } from 'styled-system/css';

export interface GameSummaryCardProps {
  genres: string[];
  /** 평점. 백엔드가 무평점 게임을 줄 수 있어 null 허용 — null이면 ★를 숨긴다. */
  rating?: number | null;
  /** 커버 이미지 URL. 없으면 surfaceRaised placeholder로 대체. */
  thumbnailUrl?: string | null;
}

// 공통 게임 카드(게임 도메인) — Figma 비회원 카드(4003:1404) 기준. 메인 추천/인기 그리드에서 공유(추후 검색도 이전 예정).
// 테두리/배경(card chrome) 없이 둥근 이미지 + 바로 아래 장르·평점 행(이미지 양끝에 flush). 타이틀 없음.
// 글씨 sm(≈12.5px) / 장르 fg.subtle(#7a7a82) / ★ accent(주황 #ef5a2c) Regular.
// 이미지→텍스트 간격 mt 48px(원래 타이틀 자리) — Figma 세로 리듬. semantic token만 사용, 다른 도메인 import 없음.
export function GameSummaryCard({
  genres,
  rating,
  thumbnailUrl,
}: GameSummaryCardProps) {
  const hasCover = Boolean(thumbnailUrl);

  return (
    <div>
      {/* 커버 (둥근 이미지, 카드 chrome 없음) */}
      <div
        className={css({
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
      />

      {/* 장르 · 평점 행 — 이미지 아래 48px, 좌우 패딩 없이 양끝 정렬 */}
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2',
          mt: '12',
        })}
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
