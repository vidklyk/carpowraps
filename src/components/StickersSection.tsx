'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  STICKERS_TOTAL_FRAMES,
  STICKERS_MOBILE_TOTAL_FRAMES,
  STICKERS_SCROLL_HEIGHT,
  STICKERS_MOBILE_SCROLL_HEIGHT,
} from '@/lib/constants';

const CDN = 'https://pub-2bbcc9d1a232445d9e20eec38de3a44e.r2.dev';

function stickersFrameUrl(i: number, mobile: boolean) {
  if (mobile) return `${CDN}/frames_stickers_mobile/stikers_mob_frame_${String(i + 1).padStart(3, '0')}.jpg`;
  return `${CDN}/frames_stickers/stickers_frame_${String(i + 1).padStart(3, '0')}.jpg`;
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const ia = img.naturalWidth / img.naturalHeight;
  const ca = w / h;
  let dw: number, dh: number, dx: number, dy: number;
  if (ia > ca) { dh = h; dw = dh * ia; dx = (w - dw) / 2; dy = 0; }
  else          { dw = w; dh = dw / ia; dx = 0;            dy = (h - dh) / 2; }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawImageContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const ia = img.naturalWidth / img.naturalHeight;
  const ca = w / h;
  let dw: number, dh: number, dx: number, dy: number;
  if (ia > ca) { dw = w; dh = w / ia; dx = 0;            dy = (h - dh) / 2; }
  else          { dh = h; dw = h * ia; dx = (w - dw) / 2; dy = 0;            }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, dx, dy, dw, dh);
}

export default function StickersSection() {
  const containerRef    = useRef<HTMLDivElement>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const imagesRef       = useRef<(HTMLImageElement | null)[]>([]);
  const frameRef        = useRef(0);
  const rafRef          = useRef<number | null>(null);
  const touchActiveRef  = useRef(false);
  const scrollTRef      = useRef(0);
  const isMobileRef     = useRef(false);
  const totalFramesRef  = useRef(STICKERS_TOTAL_FRAMES);
  const scrollHeightRef = useRef(STICKERS_SCROLL_HEIGHT);

  const [scrollT,    setScrollT]    = useState(0);
  const [entered,    setEntered]    = useState(false);
  const [containerH, setContainerH] = useState(STICKERS_SCROLL_HEIGHT);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setEntered(true);
        else if (entry.boundingClientRect.top > 0) setEntered(false);
      },
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const render = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img    = imagesRef.current[index];
    if (!canvas) return;
    if (!img || (!img.complete && img.naturalWidth === 0)) {
      requestAnimationFrame(() => { if (frameRef.current === index) render(index); });
      return;
    }
    if (!img.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    drawImageCover(ctx, img, w, h);
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
      render(frameRef.current);
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
    isMobileRef.current = mobile;
    const total  = mobile ? STICKERS_MOBILE_TOTAL_FRAMES : STICKERS_TOTAL_FRAMES;
    const height = mobile ? STICKERS_MOBILE_SCROLL_HEIGHT : STICKERS_SCROLL_HEIGHT;
    totalFramesRef.current  = total;
    scrollHeightRef.current = height;
    setContainerH(height);
    imagesRef.current = new Array(total).fill(null);

    let started = false;
    const startLoad = () => {
      if (started) return;
      started = true;
      for (let i = 0; i < total; i++) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = stickersFrameUrl(i, mobile);
        img.onload = () => {
          imagesRef.current[i] = img;
          if (i === 0) render(0);
          if (i === frameRef.current) render(i);
        };
      }
    };

    const el = containerRef.current;
    if (!el) { startLoad(); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { startLoad(); obs.disconnect(); } },
      { rootMargin: '100% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [render]);

  useEffect(() => {
    const onScroll = () => {
      if (touchActiveRef.current) return;
      const container = containerRef.current;
      if (!container) return;
      const total    = totalFramesRef.current;
      const scrolled = window.scrollY - container.offsetTop;
      const animMax  = scrollHeightRef.current - window.innerHeight;
      const t        = Math.max(0, Math.min(1, scrolled / animMax));
      scrollTRef.current = t;
      setScrollT(t);
      const idx = Math.min(Math.floor(t * total), total - 1);
      if (idx !== frameRef.current) {
        frameRef.current = idx;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => render(idx));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [render]);

  useEffect(() => {
    if (!('ontouchstart' in window)) return;
    const SENSITIVITY = 1 / 300;
    const LERP        = 0.18;
    let touchY = 0, localT = 0, displayT = 0;
    let lerpRaf: number | null = null;
    let syncOnLerpEnd = false;
    let s0Mode = false, s0TouchY = 0;

    const animMaxScroll = () => scrollHeightRef.current - window.innerHeight;

    const doScrollSync = () => {
      const c = containerRef.current;
      if (!c) return;
      if (localT >= 1)      window.scrollTo(0, c.offsetTop + animMaxScroll());
      else if (localT <= 0) window.scrollTo(0, c.offsetTop);
      else                  window.scrollTo(0, c.offsetTop + localT * animMaxScroll());
    };

    const startLerp = () => {
      if (lerpRaf !== null) return;
      const loop = () => {
        const total = totalFramesRef.current;
        const diff = localT - displayT;
        if (Math.abs(diff) < 0.0015) {
          displayT = localT; lerpRaf = null;
          const idx = Math.min(Math.floor(displayT * total), total - 1);
          if (idx !== frameRef.current) { frameRef.current = idx; render(idx); }
          scrollTRef.current = displayT;
          setScrollT(displayT);
          if (syncOnLerpEnd) { syncOnLerpEnd = false; doScrollSync(); }
          return;
        }
        displayT += diff * LERP;
        const idx = Math.min(Math.floor(displayT * total), total - 1);
        if (idx !== frameRef.current) { frameRef.current = idx; render(idx); }
        scrollTRef.current = displayT;
        setScrollT(displayT);
        const cs = containerRef.current;
        if (cs) window.scrollTo(0, Math.round(cs.offsetTop + displayT * animMaxScroll()));
        lerpRaf = requestAnimationFrame(loop);
      };
      lerpRaf = requestAnimationFrame(loop);
    };

    const inAnimZone = () => {
      const c = containerRef.current;
      if (!c) return false;
      const s = window.scrollY - c.offsetTop;
      return s >= 0 && s < animMaxScroll() - 4;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!inAnimZone()) return;
      const c = containerRef.current!;
      const s = window.scrollY - c.offsetTop;
      if (s <= 1) {
        s0Mode = true; s0TouchY = e.touches[0].clientY;
        localT = 0; displayT = 0; return;
      }
      s0Mode = false;
      e.preventDefault();
      touchActiveRef.current = true;
      syncOnLerpEnd = false;
      touchY = e.touches[0].clientY;
      localT = displayT = Math.max(0, Math.min(1, s / animMaxScroll()));
    };

    const onTouchMove = (e: TouchEvent) => {
      if (s0Mode) {
        const dy = s0TouchY - e.touches[0].clientY;
        if (Math.abs(dy) < 3) return;
        s0Mode = false;
        if (dy > 0) {
          e.preventDefault();
          touchActiveRef.current = true; syncOnLerpEnd = false;
          touchY = e.touches[0].clientY;
          const c = containerRef.current!;
          localT = displayT = Math.max(0, Math.min(1, (window.scrollY - c.offsetTop) / animMaxScroll()));
        }
        return;
      }
      if (!touchActiveRef.current) return;
      e.preventDefault();
      const dy = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      if (localT >= 1 && dy > 0) { touchActiveRef.current = false; doScrollSync(); return; }
      if (localT <= 0 && dy < 0) { touchActiveRef.current = false; doScrollSync(); return; }
      localT = Math.max(0, Math.min(1, localT + dy * SENSITIVITY));
      startLerp();
    };

    const onTouchEnd = () => {
      s0Mode = false;
      if (!touchActiveRef.current) return;
      touchActiveRef.current = false;
      if (lerpRaf !== null) syncOnLerpEnd = true;
      else doScrollSync();
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

  const sceneOpacity = !entered ? 0
    : scrollT < 0.08 ? scrollT / 0.08
    : scrollT > 0.85 ? Math.max(0, 1 - (scrollT - 0.85) / 0.15)
    : 1;
  const introOpacity = Math.max(0, 1 - scrollT / 0.08);
  const introScale   = 1 + scrollT * 0.15;

  const textVisible = scrollT > 0.08 && scrollT < 0.85;

  return (
    <div ref={containerRef} style={{ height: `${containerH}px` }} className="relative w-full">
      <div className="sticky top-0 w-full overflow-hidden bg-black" style={{ height: '100dvh' }}>

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"
          style={{ opacity: sceneOpacity }} />

        <div className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{ height: '30%', background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, transparent 100%)' }} />

        <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.5) 60%, transparent 100%)' }} />

        <div className="absolute top-0 right-0 bottom-0 pointer-events-none md:hidden"
          style={{ width: '25%', background: 'linear-gradient(to left, rgba(0,0,0,0.9) 0%, transparent 100%)' }} />

        <div className="absolute inset-y-0 left-0 w-[48%] hidden md:flex flex-col justify-center px-16 z-10"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.88) 55%, transparent 100%)' }}>
          <div className="transition-all duration-700"
            style={{ opacity: textVisible ? 1 : 0, transform: textVisible ? 'translateY(0)' : 'translateY(24px)' }}>
            <p className="text-white/50 text-xs tracking-[0.45em] uppercase mb-5">
              Precision. Protection. Style.
            </p>
            <h2 className="text-white font-black tracking-tight leading-tight mb-4"
              style={{ fontSize: 'clamp(2.5rem, 4.5vw, 4.5rem)' }}>
              Protection<br />That Performs
            </h2>
            <div style={{ width: '48px', height: '3px', borderRadius: '9999px', backgroundColor: '#44ff55', boxShadow: '0 0 12px #44ff55', marginBottom: '20px' }} />
            <p className="text-white/55 text-base leading-relaxed max-w-xs mb-8">
              High-performance PPF and vinyl wraps engineered to protect and elevate.
            </p>
            <a href="#stickers-benefits"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full border text-white/80 text-sm font-medium tracking-wide transition-all duration-300 hover:border-white/40 hover:text-white active:scale-95 w-fit"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              Learn More
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M7 2.5l4.5 4.5L7 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="absolute bottom-24 left-0 right-0 px-6 text-center md:hidden z-10 pointer-events-none"
          style={{ opacity: textVisible ? 1 : 0, transform: textVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
          <p className="text-white/50 text-xs tracking-[0.4em] uppercase mb-3">
            Precision. Protection. Style.
          </p>
          <h2 className="text-white font-black tracking-tight leading-tight mb-3"
            style={{ fontSize: 'clamp(1.8rem, 7vw, 2.8rem)' }}>
            Protection That Performs
          </h2>
          <div className="mx-auto mb-3" style={{ width: '40px', height: '3px', borderRadius: '9999px', backgroundColor: '#44ff55', boxShadow: '0 0 10px #44ff55' }} />
          <p className="text-white/50 text-sm leading-relaxed mb-5">
            High-performance PPF and vinyl wraps engineered to protect and elevate.
          </p>
          <a href="#stickers-benefits"
            className="pointer-events-auto inline-flex items-center gap-2 px-7 py-3 rounded-full border text-white/80 text-sm font-medium tracking-wide transition-all duration-300 hover:border-white/40 hover:text-white active:scale-95 mx-auto"
            style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
            Learn More
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7h9M7 2.5l4.5 4.5L7 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30"
          style={{
            opacity:   !entered ? 0 : introOpacity,
            transform: `scale(${introScale})`,
            transition: entered && scrollT === 0 ? 'opacity 0.8s ease, transform 0.8s ease' : 'none',
          }}>
          <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-5">Custom Stickers</p>
          <h2 className="text-white font-black tracking-tighter leading-none text-center"
            style={{ fontSize: 'clamp(3rem, 12vw, 11rem)' }}>
            STICKERS
          </h2>
          <div style={{ width: '64px', height: '3px', marginTop: '16px', borderRadius: '9999px', backgroundColor: '#44ff55', boxShadow: '0 0 12px #44ff55' }} />
          <p className="text-white/25 text-sm mt-6 tracking-wide text-center max-w-xs px-6">
            Precision-cut. Built to last.
          </p>
        </div>

      </div>
    </div>
  );
}
