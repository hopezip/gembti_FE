import { useState } from 'react';
import type { JSX } from 'react';
import { Play } from 'lucide-react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { css } from 'styled-system/css';
import 'swiper/css';
import 'swiper/css/navigation';
import { GameMediaLightbox } from './GameMediaLightbox';

export interface GameMediaGalleryProps {
  screenshotUrls: string[];
  trailerUrl?: string | null;
}

const wrapper = css({
  position: 'relative',
  mt: '4',
  '& .swiper-button-next, & .swiper-button-prev': {
    width: '36px!',
    height: '36px!',
    marginTop: '-18px!',
    borderRadius: '9999px!',
    background: 'rgba(0,0,0,0.65)!',
    color: 'token(colors.accent.default)!',
    display: 'flex!',
    alignItems: 'center!',
    justifyContent: 'center!',
    '@media (max-width: 640px)': { display: 'none!' },
  },
  '& .swiper-button-next svg, & .swiper-button-prev svg': {
    width: '20px!',
    height: '20px!',
    '@media (max-width: 640px)': { width: '14px!', height: '14px!' },
  },
  '& .swiper-button-disabled': { opacity: '0', pointerEvents: 'none' },
});

const slide = css({
  position: 'relative',
  aspectRatio: '16/9',
  bg: 'bg.surfaceRaised',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: 'xl',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'opacity {durations.fast}',
  _hover: { opacity: '0.85' },
});

const slideVideo = css({
  position: 'absolute',
  inset: '0',
  w: 'full',
  h: 'full',
  objectFit: 'cover',
  pointerEvents: 'none',
});

const playOverlay = css({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  w: '14',
  h: '14',
  borderRadius: 'full',
  bg: 'rgba(0,0,0,0.65)',
  color: 'white',
  backdropFilter: 'blur(4px)',
  border: '2px solid rgba(255,255,255,0.3)',
});

const videoBadge = css({
  position: 'absolute',
  top: '2',
  left: '2',
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  px: '2',
  py: '0.5',
  borderRadius: 'md',
  bg: 'rgba(0,0,0,0.7)',
  color: 'white',
  fontSize: 'xs',
  fontWeight: 'semibold',
  backdropFilter: 'blur(4px)',
  letterSpacing: 'wide',
});

export function GameMediaGallery({
  screenshotUrls,
  trailerUrl,
}: GameMediaGalleryProps): JSX.Element | null {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const hasTrailer = Boolean(trailerUrl);
  const hasScreenshots = screenshotUrls.length > 0;

  if (!hasTrailer && !hasScreenshots) return null;

  const slides = [...(trailerUrl ? [trailerUrl] : []), ...screenshotUrls];

  return (
    <section>
      <h3 className={css({ textStyle: 'heading.h3', color: 'fg.default' })}>
        {hasTrailer ? '스크린샷 / 트레일러' : '스크린샷'}
      </h3>

      <div className={wrapper}>
        <Swiper
          modules={[Navigation]}
          navigation
          breakpoints={{
            0: { slidesPerView: 1.1, spaceBetween: 12 },
            640: { slidesPerView: 2, spaceBetween: 16 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
        >
          {hasTrailer && (
            <SwiperSlide className={slide} onClick={() => setLightboxIndex(0)}>
              <video
                src={trailerUrl ?? undefined}
                muted
                preload="metadata"
                className={slideVideo}
                onLoadedMetadata={(e) => {
                  e.currentTarget.currentTime = 1;
                }}
              />
              <div className={videoBadge}>
                <Play size={10} fill="currentColor" />
                동영상
              </div>
              <div className={playOverlay}>
                <Play size={28} fill="currentColor" />
              </div>
            </SwiperSlide>
          )}
          {screenshotUrls.map((url, i) => (
            <SwiperSlide
              key={url}
              className={slide}
              style={{ backgroundImage: `url(${url})` }}
              onClick={() => setLightboxIndex(hasTrailer ? i + 1 : i)}
            />
          ))}
        </Swiper>
      </div>

      {lightboxIndex !== null && (
        <GameMediaLightbox
          slides={slides}
          index={lightboxIndex}
          hasTrailer={hasTrailer}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
}
