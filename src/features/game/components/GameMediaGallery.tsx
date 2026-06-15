import type { JSX } from 'react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { css } from 'styled-system/css';
import 'swiper/css';
import 'swiper/css/navigation';

export interface GameMediaGalleryProps {
  /** 스크린샷 이미지 URL 목록. 0건 + 트레일러 없으면 섹션 전체 숨김. */
  screenshotUrls: string[];
  /** 트레일러 URL. 있으면 첫 슬라이드에 정적 ▶ 오버레이 박스를 둔다(재생 동작 없음). */
  trailerUrl?: string | null;
}

// 스크린샷/트레일러 섹션 (REC-DET-FE-001) — Figma 4014:3938 기준.
// heading.h3 "스크린샷/트레일러" + 게임카드 크기(290px)의 16:9 박스를 swiper 캐러셀로 한 줄 배치.
// 좌우 화살표 버튼(swiper Navigation)을 눌러 옆으로 넘긴다(터치 드래그도 지원).
// 트레일러가 있으면 첫 슬라이드를 ▶ 오버레이 박스로 둔다(정적 표시 전용 — 클릭/재생 없음).
// screenshotUrls 0건이고 trailerUrl도 없으면 섹션 전체를 숨긴다(null 반환).
// semantic token만 사용, 다른 도메인 import 없음. 런타임 이미지 URL만 style 인라인(Panda 정적 추출 불가).

// swiper 컨테이너 — 기본 파란 화살표 대신 overlay 원형 + fg.default로 커스텀(semantic token).
const wrapper = css({
  position: 'relative',
  mt: '4',
  '& .swiper-button-next, & .swiper-button-prev': {
    width: '10',
    height: '10',
    borderRadius: 'full',
    bg: 'bg.overlay',
    // 프로젝트 강조색(주황) — semantic accent token.
    color: 'accent.default',
  },
  '& .swiper-button-next::after, & .swiper-button-prev::after': {
    fontSize: 'md',
    fontWeight: 'bold',
  },
  // 더 넘길 곳이 없는 화살표는 숨긴다(끝 도달 시).
  '& .swiper-button-disabled': { opacity: '0', pointerEvents: 'none' },
});

// 16:9 미디어 박스(=슬라이드). 너비는 swiper가 slidesPerView=4로 계산한다(게임카드 4열 한 칸과 동일).
const slide = css({
  position: 'relative',
  aspectRatio: '16/9',
  bg: 'bg.surfaceRaised',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: 'xl',
  overflow: 'hidden',
});

// ▶ 오버레이 — 트레일러 슬라이드 중앙. overlay 배경 + onAccent(흰색) 아이콘. 클릭 동작 없음.
const playOverlay = css({
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
});

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

      {/* 게임카드 크기 슬라이드를 한 줄에 배치하고, 좌우 화살표로 넘긴다. */}
      <div className={wrapper}>
        <Swiper
          modules={[Navigation]}
          navigation
          slidesPerView={4}
          spaceBetween={24}
        >
          {/* 트레일러 슬라이드(옵션) — 첫 칸. ▶ 오버레이는 정적 표시 전용. */}
          {hasTrailer && (
            <SwiperSlide
              className={slide}
              style={{ backgroundImage: `url(${trailerUrl})` }}
            >
              <span className={playOverlay}>▶</span>
            </SwiperSlide>
          )}

          {/* 스크린샷 슬라이드들 — 런타임 URL은 inline backgroundImage. */}
          {screenshotUrls.map((url) => (
            <SwiperSlide
              // 스크린샷 URL을 안정 키로 사용(동일 게임 내 URL은 고유).
              key={url}
              className={slide}
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
        </Swiper>
      </div>
    </section>
  );
}
