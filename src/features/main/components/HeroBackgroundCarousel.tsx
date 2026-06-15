import { Autoplay, EffectFade } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { css } from 'styled-system/css';
import type { BannerImage } from '@/features/main/api/bannerImages';
import 'swiper/css';
import 'swiper/css/effect-fade';

// 메인 Hero 배경 캐러셀 (MAIN-FE-009).
//   배경 이미지만 10초 간격으로 자동 fade 전환한다(좌측 텍스트·CTA·그라데이션은 부모가 별도 오버레이로 렌더).
//   이미지가 없으면(로딩/빈) null → 부모 section의 단색 bg.surface fallback이 그대로 보인다(기존 동작 유지).
//   고해상도 library_hero를 우선 쓰고, 없는 게임은 <img> onError로 header(원본)로 폴백한다.
//   순수 배경 레이어라 aria-hidden(스크린리더 제외). 데스크탑·다크 전용.

interface Props {
  /** 배경으로 순환할 이미지 목록(고해상도 src + 폴백). 비어 있으면 렌더하지 않는다. */
  images: BannerImage[];
}

const wrapper = css({
  position: 'absolute',
  inset: '0',
  bg: 'bg.surface',
  // swiper 컨테이너/슬라이드가 래퍼 높이를 꽉 채우도록(기본 height는 auto라 명시 필요).
  '& .swiper, & .swiper-slide': { height: 'full' },
});

const image = css({
  w: 'full',
  h: 'full',
  objectFit: 'cover',
  objectPosition: 'center',
  // 모바일(≤768px): 커버 이미지가 좌우로 잘리지 않고 전체가 보이도록 contain(RESPONSIVE-FE-002).
  '@media (max-width: 768px)': { objectFit: 'contain' },
});

export function HeroBackgroundCarousel({ images }: Props) {
  if (images.length === 0) return null;

  return (
    <div className={wrapper} aria-hidden="true">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        loop
        autoplay={{ delay: 10000, disableOnInteraction: false }}
      >
        {images.map(({ src, fallback }) => (
          <SwiperSlide key={fallback}>
            <img
              src={src}
              alt=""
              className={image}
              // library_hero가 없는 게임(404)이면 header 원본으로 한 번만 폴백한다(무한 루프 방지).
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== fallback) img.src = fallback;
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
