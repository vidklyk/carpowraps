'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  TOTAL_FRAMES, SCROLL_HEIGHT,
  MOBILE_TOTAL_FRAMES,
} from '@/lib/constants';

const CDN = 'https://pub-2bbcc9d1a232445d9e20eec38de3a44e.r2.dev';

function frameUrl(index: number, mobile: boolean) {
  if (mobile) return `${CDN}/frames_mobile/mobile_hero_frame_${String(index + 1).padStart(3, '0')}.jpg`;
  return `${CDN}/frames/hero_frame_${String(index + 1).padStart(3, '0')}.jpg`;
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  const imgAspect    = img.naturalWidth / img.naturalHeight;
  const canvasAspect = w / h;
  let dw: number, dh: number, dx: number, dy: number;

  if (imgAspect > canvasAspect) {
    dh = h; dw = dh * imgAspect; dx = (w - dw) / 2; dy = 0;
  } else {
    dw = w; dh = dw / imgAspect; dx = 0; dy = (h - dh) / 2;
  }

  ctx.drawImage(img, dx, dy, dw, dh);
}

export default function ScrollAnimation() {
  const containerRef    = useRef<HTMLDivElement>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const imagesRef       = useRef<(HTMLImageElement | null)[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef          = useRef<number | null>(null);
  const totalFramesRef  = useRef(TOTAL_FRAMES);
  const touchActiveRef  = useRef(false);
  const [frame0Ready, setFrame0Ready] = useState(false);

  const render = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img    = imagesRef.current[index];
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImageCover(ctx, img, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w   = canvas.offsetWidth;
      const h   = window.visualViewport?.height ?? window.innerHeight;
      if (!w || !h) return;
      const container = canvas.parentElement;
      if (container) container.style.height = h + 'px';
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      render(currentFrameRef.current);
    };
    resize();
    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      window.visualViewport?.removeEventListener('resize', resize);
    };
  }, [render]);

  useEffect(() => {
    const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const total  = mobile ? MOBILE_TOTAL_FRAMES : TOTAL_FRAMES;
    totalFramesRef.current = total;

    let cancelled = false;
    imagesRef.current = new Array(total).fill(null);

    for (let i = 0; i < total; i++) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = frameUrl(i, mobile);
      img.onload = () => {
        if (cancelled) return;
        imagesRef.current[i] = img;
        if (i === 0) { render(0); setFrame0Ready(true); }
      };
    }
    return () => { cancelled = true; };
  }, [render]);

  useEffect(() => {
    const handleScroll = () => {
      if (touchActiveRef.current) return;
      const container = containerRef.current;
      if (!container) return;

      const scrolled   = window.scrollY - container.offsetTop;
      const maxScroll  = SCROLL_HEIGHT - window.innerHeight;
      const t          = Math.max(0, Math.min(1, scrolled / maxScroll));
      const total      = totalFramesRef.current;
      const frameIndex = Math.min(Math.floor(t * total), total - 1);

      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => render(frameIndex));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [render]);

  useEffect(() => {
    if (!('ontouchstart' in window)) return;

    const SENSITIVITY = 1 / 300;
    const LERP        = 0.18;

    let touchY        = 0;
    let localT        = 0;
    let displayT      = 0;
    let lerpRaf: number | null = null;
    let syncOnLerpEnd = false;
    let s0Mode        = false;
    let s0TouchY      = 0;

    const maxScroll = () => SCROLL_HEIGHT - window.innerHeight;

    const doScrollSync = () => {
      const c = containerRef.current;
      if (!c) return;
      if (localT >= 1) window.scrollTo(0, c.offsetTop + maxScroll());
      else if (localT <= 0) window.scrollTo(0, c.offsetTop);
      else window.scrollTo(0, c.offsetTop + localT * maxScroll());
    };

    const startLerp = () => {
      if (lerpRaf !== null) return;
      const loop = () => {
        const diff = localT - displayT;
        if (Math.abs(diff) < 0.0015) {
          displayT = localT;
          lerpRaf  = null;
          const total = totalFramesRef.current;
          const idx = Math.min(Math.floor(displayT * total), total - 1);
          if (idx !== currentFrameRef.current) { currentFrameRef.current = idx; render(idx); }
          if (syncOnLerpEnd) { syncOnLerpEnd = false; doScrollSync(); }
          return;
        }
        displayT += diff * LERP;
        const total = totalFramesRef.current;
        const idx = Math.min(Math.floor(displayT * total), total - 1);
        if (idx !== currentFrameRef.current) { currentFrameRef.current = idx; render(idx); }
        const cs = containerRef.current;
        if (cs) window.scrollTo(0, Math.round(cs.offsetTop + displayT * maxScroll()));
        lerpRaf = requestAnimationFrame(loop);
      };
      lerpRaf = requestAnimationFrame(loop);
    };

    const inZone = () => {
      const c = containerRef.current;
      if (!c) return false;
      const s = window.scrollY - c.offsetTop;
      return s >= 0 && s < maxScroll() - 4;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!inZone()) return;
      const c = containerRef.current!;
      const s = window.scrollY - c.offsetTop;

      if (s <= 1) {
        s0Mode   = true;
        s0TouchY = e.touches[0].clientY;
        localT   = 0;
        displayT = 0;
        return;
      }

      s0Mode = false;
      e.preventDefault();
      touchActiveRef.current = true;
      syncOnLerpEnd = false;
      touchY = e.touches[0].clientY;
      localT   = Math.max(0, Math.min(1, s / maxScroll()));
      displayT = localT;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (s0Mode) {
        const dy = s0TouchY - e.touches[0].clientY;
        if (Math.abs(dy) < 3) return;
        s0Mode = false;
        if (dy > 0) {
          e.preventDefault();
          touchActiveRef.current = true;
          syncOnLerpEnd = false;
          touchY   = e.touches[0].clientY;
          const c  = containerRef.current!;
          localT   = Math.max(0, Math.min(1, (window.scrollY - c.offsetTop) / maxScroll()));
          displayT = localT;
        }
        return;
      }

      if (!touchActiveRef.current) return;
      e.preventDefault();
      const dy = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      if (localT >= 1 && dy > 0) { touchActiveRef.current = false; doScrollSync(); return; }
      if (localT <= 0 && dy < 0) {
        touchActiveRef.current = false;
        doScrollSync();
        return;
      }
      localT = Math.max(0, Math.min(1, localT + dy * SENSITIVITY));
      startLerp();
    };

    const onTouchEnd = () => {
      s0Mode = false;
      if (!touchActiveRef.current) return;
      touchActiveRef.current = false;
      if (lerpRaf !== null) {
        syncOnLerpEnd = true;
      } else {
        doScrollSync();
      }
    };

    window.addEventListener('touchstart',  onTouchStart, { passive: false });
    window.addEventListener('touchmove',   onTouchMove,  { passive: false });
    window.addEventListener('touchend',    onTouchEnd,   { passive: true  });
    window.addEventListener('touchcancel', onTouchEnd,   { passive: true  });
    return () => {
      window.removeEventListener('touchstart',  onTouchStart);
      window.removeEventListener('touchmove',   onTouchMove);
      window.removeEventListener('touchend',    onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [render]);

  return (
    <div ref={containerRef} style={{ height: `${SCROLL_HEIGHT}px` }} className="relative w-full">
      <div className="sticky top-0 w-full overflow-hidden bg-black" style={{ height: '100dvh' }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: '45%', background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.5) 60%, transparent 100%)' }}
        />
        <div className="absolute top-0 right-0 bottom-0 pointer-events-none hidden md:block"
          style={{ width: '20%', background: 'linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 pointer-events-none z-10">
          <div
            className="text-center transition-opacity duration-700"
            style={{ opacity: frame0Ready ? 1 : 0 }}
          >
            <p className="text-white/60 text-sm tracking-[0.3em] uppercase mb-3">
              Premium Car Wrapping
            </p>
            <h1 className="text-white text-5xl md:text-7xl font-bold tracking-tight">
              Identity in Motion
            </h1>
            <div className="mx-auto mt-4 mb-1 rounded-full" style={{ width: '64px', height: '3px', backgroundColor: '#44ff55', boxShadow: '0 0 12px #44ff55' }} />
            <p className="text-white/50 text-base mt-3 tracking-wide">
              Scroll to explore
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
