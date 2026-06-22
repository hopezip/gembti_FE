import { useEffect } from 'react';

// 모달/오버레이가 열린 동안 body 스크롤을 차단한다.
// 스크롤바 사라질 때 레이아웃 시프트를 막기 위해 scrollbar 너비만큼 padding-right 보정.
export function useBodyScrollLock() {
  useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const prev = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prev;
      document.body.style.paddingRight = prevPad;
    };
  }, []);
}
