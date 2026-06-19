import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { css, cx } from 'styled-system/css';
import { Button } from '@/components/ui/Button';

export interface GameMediaLightboxProps {
  slides: string[];
  index: number;
  hasTrailer: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const overlay = css({
  position: 'fixed',
  inset: '0',
  zIndex: '[9999]',
  background: 'rgba(0,0,0,0.85)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: '6',
  '@media (max-width: 768px)': { px: '4', py: '6' },
});

const modal = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  w: '92vw',
  maxW: '1280px',
  maxH: '92vh',
  bg: 'bg.surface',
  borderRadius: '2xl',
  overflow: 'hidden',
  boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
  border: '1px solid token(colors.border.default)',
  '@media (max-width: 768px)': { w: 'full', maxW: 'full', borderRadius: 'xl' },
});

const header = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: '6',
  py: '4',
  borderBottom: '1px solid token(colors.border.subtle)',
  flexShrink: '0',
});

const title = css({
  fontSize: 'xl',
  fontWeight: 'bold',
  color: 'fg.default',
});

const closeBtn = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  w: '9',
  h: '9',
  borderRadius: 'full',
  bg: 'bg.surfaceRaised',
  color: 'fg.default',
  cursor: 'pointer',
  border: 'none',
  flexShrink: '0',
  _hover: { bg: 'bg.overlay' },
});

const mediaArea = css({
  position: 'relative',
  aspectRatio: '16/9',
  overflow: 'hidden',
  flexShrink: '0',
  bg: 'bg.canvas',
  '@media (max-width: 768px)': { aspectRatio: '5/3' },
});

const imageBg = css({
  position: 'absolute',
  inset: '0',
  w: 'full',
  h: 'full',
  objectFit: 'cover',
  filter: 'blur(24px) brightness(0.35)',
  transform: 'scale(1.08)',
  userSelect: 'none',
  pointerEvents: 'none',
});

const image = css({
  position: 'relative',
  zIndex: '1',
  w: 'full',
  h: 'full',
  objectFit: 'contain',
  display: 'block',
  userSelect: 'none',
});

const video = css({
  position: 'relative',
  zIndex: '1',
  w: 'full',
  h: 'full',
  display: 'block',
  bg: 'bg.canvas',
});

const thumbnails = css({
  display: 'flex',
  gap: '2',
  px: '4',
  py: '3',
  overflowX: 'auto',
  borderTop: '1px solid token(colors.border.subtle)',
  flexShrink: '0',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
  scrollBehavior: 'smooth',
});

const thumb = css({
  position: 'relative',
  flexShrink: '0',
  w: '28',
  aspectRatio: '16/9',
  borderRadius: 'md',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  overflow: 'hidden',
  cursor: 'pointer',
  border: '2px solid transparent',
  opacity: '0.5',
  transition: 'all {durations.fast}',
  _hover: { opacity: '0.85' },
});

const thumbActive = css({
  border: '2px solid token(colors.accent.default)',
  opacity: '1',
});

const thumbVideo = css({
  w: 'full',
  h: 'full',
  objectFit: 'cover',
  display: 'block',
  pointerEvents: 'none',
});

const thumbPlayOverlay = css({
  position: 'absolute',
  inset: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bg: 'rgba(0,0,0,0.4)',
  color: 'white',
});

const navBtnShared = {
  position: 'absolute' as const,
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: '2',
  borderRadius: 'full',
  w: '10',
  h: '10',
  px: '0',
  bg: 'rgba(0,0,0,0.6)',
  borderColor: 'rgba(255,255,255,0.2)',
  color: 'accent.default',
  _hover: { bg: 'rgba(0,0,0,0.85)' },
  '@media (max-width: 768px)': { display: 'none' },
};

const counter = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '3',
  py: '2',
  fontSize: 'sm',
  color: 'fg.muted',
  flexShrink: '0',
});

const counterLine = css({
  w: '8',
  h: 'px',
  bg: 'fg.muted',
});

export function GameMediaLightbox({
  slides,
  index,
  hasTrailer,
  onClose,
  onNavigate,
}: GameMediaLightboxProps) {
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);
  const canPrev = index > 0;
  const canNext = index < slides.length - 1;
  const isTrailer = hasTrailer && index === 0;

  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [index]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && canPrev) onNavigate(index - 1);
      if (e.key === 'ArrowRight' && canNext) onNavigate(index + 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [index, canPrev, canNext, onClose, onNavigate]);

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: 모달 백드롭 — ESC 키는 useEffect 핸들러가 담당
    // biome-ignore lint/a11y/useKeyWithClickEvents: 동상
    <div className={overlay} onClick={onClose}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: 클릭 버블링 차단용 래퍼 */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: 동상 */}
      <div className={modal} onClick={(e) => e.stopPropagation()}>
        <div className={header}>
          <h2 className={title}>
            {isTrailer ? '게임 트레일러' : '게임 스크린샷'}
          </h2>
          <button
            type="button"
            className={closeBtn}
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className={mediaArea}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            if (diff > 50 && canNext) onNavigate(index + 1);
            if (diff < -50 && canPrev) onNavigate(index - 1);
            touchStartX.current = null;
          }}
        >
          {isTrailer ? (
            <video
              key={slides[index]}
              src={slides[index]}
              controls
              autoPlay
              muted
              className={video}
              onEnded={(e) => {
                e.currentTarget.currentTime = 0;
              }}
            />
          ) : (
            <>
              <img
                src={slides[index]}
                alt=""
                className={imageBg}
                draggable={false}
                aria-hidden
              />
              <img
                src={slides[index]}
                alt=""
                className={image}
                draggable={false}
              />
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            css={{ ...navBtnShared, left: '3' }}
            disabled={!canPrev}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index - 1);
            }}
            aria-label="이전"
          >
            <ChevronLeft size={20} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            css={{ ...navBtnShared, right: '3' }}
            disabled={!canNext}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index + 1);
            }}
            aria-label="다음"
          >
            <ChevronRight size={20} />
          </Button>
        </div>

        <div className={thumbnails}>
          {slides.map((url, i) => {
            const isThumbTrailer = hasTrailer && i === 0;
            return (
              <button
                key={url}
                type="button"
                ref={(el) => {
                  thumbRefs.current[i] = el;
                }}
                className={cx(thumb, i === index ? thumbActive : undefined)}
                style={
                  isThumbTrailer
                    ? undefined
                    : { backgroundImage: `url(${url})` }
                }
                onClick={() => onNavigate(i)}
                aria-label={isThumbTrailer ? '트레일러' : `스크린샷 ${i}`}
              >
                {isThumbTrailer && (
                  <>
                    <video
                      src={url}
                      muted
                      preload="metadata"
                      className={thumbVideo}
                      onLoadedMetadata={(e) => {
                        e.currentTarget.currentTime = 1;
                      }}
                    />
                    <div className={thumbPlayOverlay}>
                      <Play size={14} fill="currentColor" />
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        <div className={counter}>
          <div className={counterLine} />
          <span>
            {index + 1} / {slides.length}
          </span>
          <div className={counterLine} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
