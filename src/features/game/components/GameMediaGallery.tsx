import type { JSX } from 'react';
import { css } from 'styled-system/css';

export interface GameMediaGalleryProps {
  /** 스크린샷 이미지 URL 목록. 0건 + 트레일러 없으면 섹션 전체 숨김. */
  screenshotUrls: string[];
  /** 트레일러 URL. 있으면 첫 칸에 정적 ▶ 오버레이 박스를 둔다(재생 동작 없음). */
  trailerUrl?: string | null;
}

// 스크린샷/트레일러 섹션 (REC-DET-FE-001) — Figma 4014:3938 기준.
// heading.h3 "스크린샷/트레일러" + 16:9 박스 가로 나열.
// 트레일러가 있으면 첫 칸을 ▶ 오버레이 박스로 둔다(정적 표시 전용 — 클릭/재생/라이트박스 없음).
// 스크린샷은 16:9 이미지 박스로 렌더한다. bg.surfaceRaised + borderRadius xl.
// screenshotUrls 0건이고 trailerUrl도 없으면 섹션 전체를 숨긴다(null 반환).
// semantic token만 사용, 다른 도메인 import 없음. 런타임 이미지 URL만 style 인라인(Panda 정적 추출 불가).
export function GameMediaGallery({
  screenshotUrls,
  trailerUrl,
}: GameMediaGalleryProps): JSX.Element | null {
  const hasTrailer = Boolean(trailerUrl);
  const hasScreenshots = screenshotUrls.length > 0;

  // 트레일러도 스크린샷도 없으면 섹션을 그리지 않는다.
  if (!hasTrailer && !hasScreenshots) {
    return null;
  }

  // 16:9 미디어 박스 공통 스타일 — bg.surfaceRaised + radius xl + 가로폭 균등 분배.
  const boxClassName = css({
    position: 'relative',
    flex: '1 1 0',
    minWidth: '0',
    aspectRatio: '16/9',
    bg: 'bg.surfaceRaised',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: 'xl',
    overflow: 'hidden',
  });

  return (
    <section>
      {/* 섹션 헤딩 — 기존 카드 그리드와 통일되도록 heading.h3 사용. */}
      <h3
        className={css({
          textStyle: 'heading.h3',
          color: 'fg.default',
        })}
      >
        스크린샷/트레일러
      </h3>

      {/* 16:9 박스 가로 나열. 박스 폭은 flex로 균등 분배한다. */}
      <div
        className={css({
          display: 'flex',
          gap: '4',
          mt: '4',
        })}
      >
        {/* 트레일러 칸(옵션) — 첫 칸. ▶ 오버레이는 정적 표시 전용(재생 동작 없음). */}
        {hasTrailer && (
          <div
            className={boxClassName}
            style={{ backgroundImage: `url(${trailerUrl})` }}
          >
            {/* ▶ 오버레이 — 중앙 정렬. overlay 배경 + onAccent(흰색) 아이콘. 클릭 동작 없음. */}
            <span
              className={css({
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '12',
                height: '12',
                borderRadius: 'full',
                bg: 'bg.overlay',
                color: 'fg.onAccent',
                fontSize: 'xl',
                lineHeight: 'none',
              })}
            >
              ▶
            </span>
          </div>
        )}

        {/* 스크린샷 칸들 — 16:9 이미지 박스. 런타임 URL은 inline backgroundImage. */}
        {screenshotUrls.map((url) => (
          <div
            // 스크린샷 URL을 안정 키로 사용(동일 게임 내 URL은 고유).
            key={url}
            className={boxClassName}
            style={{ backgroundImage: `url(${url})` }}
          />
        ))}
      </div>
    </section>
  );
}
