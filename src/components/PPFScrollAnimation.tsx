'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PPF_TOTAL_FRAMES, PPF_SCROLL_HEIGHT } from '@/lib/constants';

const CDN = 'https://pub-2bbcc9d1a232445d9e20eec38de3a44e.r2.dev';

function frameUrl(index: number) {
  return `${CDN}/wrap_frames/wrap_clean_${String(index + 1).padStart(3, '0')}.jpg`;
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number, h: number
) {
  const ia = img.naturalWidth / img.naturalHeight;
  const ca = w / h;
  let dw: number, dh: number, dx: number, dy: number;
  if (ia > ca) { dw = w; dh = dw / ia; dx = 0; dy = (h - dh) / 2; }
  else          { dh = h; dw = dh * ia; dx = (w - dw) / 2; dy = 0; }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, dx, dy, dw, dh);
}

const OVERLAYS = [
  { from: 0.05, to: 0.36, label: 'PAINT PROTECTION FILM',  title: 'Invisible Shield' },
  { from: 0.39, to: 0.67, label: 'SELF-HEALING TECHNOLOGY', title: 'Scratches Disappear' },
  { from: 0.70, to: 0.98, label: 'UP TO 10 YEAR WARRANTY',  title: 'Protection That Lasts' },
];

interface ImgBounds { top: number; bottom: number; }

export default function PPFScrollAnimation() {
  const containerRef   = useRef<HTMLDivElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const imagesRef      = useRef<(HTMLImageElement | null)[]>([]);
  const frameRef       = useRef(0);
  const rafRef         = useRef<number | null>(null);
  const totalFramesRef = useRef(PPF_TOTAL_FRAMES);
  const touchActiveRef = useRef(false);
  const [scrollT, setScrollT] = useState(0);
  const [entered, setEntered] = useState(false);
  const [imgBounds, setImgBounds] = useState<ImgBounds | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setEntered(true);
        else if (entry.boundingClientRect.top > 0) setEntered(false);
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const render = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img    = imagesRef.current[index];
    if (!canvas || !img?.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImageContain(ctx, img, canvas.width, canvas.height);
  }, []);

  const computeImgBounds = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imagesRef.current[0];
    if (!canvas || !img?.naturalWidth) return;
    const w = canvas.offsetWidth;
    const h = window.visualViewport?.height ?? window.innerHeight;
    if (!w || !h) return;
    const ia = img.naturalWidth / img.naturalHeight;
    const ca = w / h;
    let dh: number, dy: number;
    if (ia > ca) { dh = w / ia; dy = (h - dh) / 2; }
    else          { dh = h;      dy = 0; }
    setImgBounds({ top: dy, bottom: dy + dh });
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
      computeImgBounds();
    };
    resize();
    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      window.visualViewport?.removeEventListener('resize', resize);
    };
  }, [render, computeImgBounds]);

  useEffect(() => {
    totalFramesRef.current = PPF_TOTAL_FRAMES;
    imagesRef.current = new Array(PPF_TOTAL_FRAMES).fill(null);
    for (let i = 0; i < PPF_TOTAL_FRAMES; i++) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = frameUrl(i);
      img.onload = () => {
        imagesRef.current[i] = img;
        if (i === 0) { render(0); computeImgBounds(); }
      };
    }
  }, [render, computeImgBounds]);

  useEffect(() => {
    const onScroll = () => {
      if (touchActiveRef.current) return;
      const container = containerRef.current;
      if (!container) return;
      const scrolled  = window.scrollY - container.offsetTop;
      const maxScroll = PPF_SCROLL_HEIGHT - window.innerHeight;
      const t         = Math.max(0, Math.min(1, scrolled / maxScroll));
      setScrollT(t);
      const total = totalFramesRef.current;
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

    let touchY        = 0;
    let localT        = 0;
    let displayT      = 0;
    let lerpRaf: number | null = null;
    let syncOnLerpEnd = false;
    let s0Mode        = false;
    let s0TouchY      = 0;

    const maxScroll = () => PPF_SCROLL_HEIGHT - window.innerHeight;

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
          if (idx !== frameRef.current) { frameRef.current = idx; render(idx); }
          setScrollT(displayT);
          if (syncOnLerpEnd) { syncOnLerpEnd = false; doScrollSync(); }
          return;
        }
        displayT += diff * LERP;
        const total = totalFramesRef.current;
        const idx = Math.min(Math.floor(displayT * total), total - 1);
        if (idx !== frameRef.current) { frameRef.current = idx; render(idx); }
        setScrollT(displayT);
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

  const introOpacity = Math.max(0, 1 - scrollT * 8);
  const introScale   = 1 + scrollT * 0.25;

  const mobileTextStyle: React.CSSProperties = imgBounds
    ? { top: `${imgBounds.bottom + 10}px` }
    : { bottom: '80px' };

  return (
    <div ref={containerRef} style={{ height: `${PPF_SCROLL_HEIGHT}px` }} className="relative w-full">
      <div className="sticky top-0 w-full overflow-hidden bg-black" style={{ height: '100dvh' }}>

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="absolute inset-y-0 left-0 w-[45%] pointer-events-none hidden md:block"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.85) 60%, transparent 100%)' }} />

        <div className="absolute inset-0 pointer-events-none md:hidden"
          style={{ background: 'rgba(0,0,0,0.45)' }} />

        <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 40%, transparent 100%)' }} />

        <div className="absolute left-0 right-0 md:hidden pointer-events-none"
          style={{
            top:    imgBounds ? `${imgBounds.bottom - 160}px` : '50%',
            height: '164px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)',
          }} />

        <div className="absolute inset-y-0 right-0 hidden md:block md:w-96 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #000 0%, #000 25%, rgba(0,0,0,0.7) 60%, transparent 100%)' }} />
        <div className="absolute bottom-0 right-0 w-48 h-20 hidden md:block pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 100% 100%, #000 20%, rgba(0,0,0,0.85) 50%, transparent 80%)' }} />

        <div className="absolute inset-y-0 left-0 w-[42%] flex-col justify-center px-12 md:px-16 z-10 hidden md:flex">
          {OVERLAYS.map((o) => {
            const visible = scrollT >= o.from && scrollT <= o.to;
            return (
              <div key={o.title}
                className="absolute transition-all duration-700"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                }}>
                <p className="text-white/50 text-xs tracking-[0.4em] uppercase mb-4">{o.label}</p>
                <h3 className="text-white font-black tracking-tight leading-none"
                  style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)' }}>
                  {o.title}
                </h3>
              </div>
            );
          })}
        </div>

        <div className="absolute left-0 right-0 flex flex-col items-center z-10 md:hidden px-6 text-center"
          style={mobileTextStyle}>
          {OVERLAYS.map((o, i) => {
            const visible = scrollT >= o.from && scrollT <= o.to;
            const isLast = i === OVERLAYS.length - 1;
            return (
              <div key={o.title}
                className="absolute transition-all duration-500"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                }}>
                <p className="text-white/50 text-xs tracking-[0.4em] uppercase mb-3">{o.label}</p>
                <h3 className="text-white font-black tracking-tight leading-none"
                  style={{ fontSize: 'clamp(2rem, 8vw, 3rem)' }}>
                  {o.title}
                </h3>
                {isLast && (
                  <a href="#contact"
                    className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-full border border-white/20 text-white/80 text-sm font-medium tracking-wide"
                    style={{ pointerEvents: visible ? 'auto' : 'none' }}>
                    Learn More
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2.5 6.5h8M6.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {(() => {
          const isScrolling = scrollT > 0.005;
          return (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20"
              style={{
                opacity: !entered ? 0 : introOpacity,
                transform: !entered ? 'scale(1.55)' : `scale(${introScale})`,
                filter: !entered ? 'blur(40px)' : 'blur(0px)',
                transition: !entered || isScrolling
                  ? 'none'
                  : 'opacity 1.4s cubic-bezier(0.16,1,0.3,1), transform 1.6s cubic-bezier(0.16,1,0.3,1), filter 1.4s cubic-bezier(0.16,1,0.3,1)',
              }}>
              <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-5">Paint Protection Film</p>
              <h2 className="text-white font-black tracking-tighter leading-none text-center"
                style={{ fontSize: 'clamp(5rem, 15vw, 14rem)' }}>
                PPF
              </h2>
              <div style={{
                width: '64px', height: '3px', marginTop: '16px',
                borderRadius: '9999px',
                backgroundColor: '#44ff55',
                boxShadow: '0 0 12px #44ff55',
              }} />
              <p className="text-white/25 text-sm mt-6 tracking-wide text-center max-w-sm">
                The invisible armor that keeps your paint factory‑fresh
              </p>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
