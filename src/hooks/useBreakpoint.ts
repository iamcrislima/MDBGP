import { useState, useEffect } from 'react';

export interface Breakpoint {
  isMobile:  boolean;
  isTablet:  boolean;
  isDesktop: boolean;
  width: number;
}

export function useBreakpoint(): Breakpoint {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    let raf = 0;
    const fn = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setWidth(window.innerWidth)); };
    window.addEventListener('resize', fn);
    return () => { window.removeEventListener('resize', fn); cancelAnimationFrame(raf); };
  }, []);

  return {
    isMobile:  width < 768,
    isTablet:  width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
}
