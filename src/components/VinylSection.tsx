'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  VINYL_TOTAL_FRAMES,
  VINYL_MOBILE_TOTAL_FRAMES,
  VINYL_SCROLL_HEIGHT,
  VINYL_MOBILE_SCROLL_HEIGHT,
} from '@/lib/constants';

const CDN = 'https://pub-2bbcc9d1a232445d9e20eec38de3a44e.r2.dev';

function vinylFrameUrl(i: number, mobile: boolean) {
  if (mobile) return `${CDN}/frames_vinyl_mobile/luxury2_frame_${String(i + 1).padStart(3, '0')}.jpg`;
  return `${CDN}/frames_vinyl/luxury_frame_${String(i + 1).padStart(3, '0')}.jpg`;
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

const SCROLL_OVERLAYS = [
  { from: 0.05, to: 0.33, label: 'VINYL WRAP',           title: 'Transform Your Look'     },
  { from: 0.36, to: 0.63, label: 'PREMIUM FILMS',         title: 'Infinite Color Range'    },
  { from: 0.66, to: 0.88, label: 'FULL COVERAGE',         title: 'Your Vision, Realized'   },
];

function VinylScrollAnimation() {
  const containerRef   = useRef<HTMLDivElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const imagesRef      = useRef<(HTMLImageElement | null)[]>([]);
  const frameRef       = useRef(0);
  const rafRef         = useRef<number | null>(null);
  const touchActiveRef = useRef(false);
  const scrollTRef     = useRef(0);
  const isMobileRef    = useRef(false);
  const totalFramesRef = useRef(VINYL_TOTAL_FRAMES);
  const scrollHeightRef = useRef(VINYL_SCROLL_HEIGHT);

  const [scrollT, setScrollT]       = useState(0);
  const [entered, setEntered]       = useState(false);
  const [containerH, setContainerH] = useState(VINYL_SCROLL_HEIGHT);

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
    const total  = mobile ? VINYL_MOBILE_TOTAL_FRAMES : VINYL_TOTAL_FRAMES;
    const height = mobile ? VINYL_MOBILE_SCROLL_HEIGHT : VINYL_SCROLL_HEIGHT;
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
        img.src = vinylFrameUrl(i, mobile);
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

  return (
    <div ref={containerRef} style={{ height: `${containerH}px` }} className="relative w-full">
      <div className="sticky top-0 w-full overflow-hidden bg-black" style={{ height: '100dvh' }}>

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"
          style={{ opacity: sceneOpacity }} />

        <div className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{ height: '25%', background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)' }} />

        <div className="absolute inset-y-0 left-0 w-[45%] pointer-events-none hidden md:block"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.85) 60%, transparent 100%)' }} />

        <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: '55%', background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, transparent 100%)' }} />

        <div className="absolute inset-y-0 right-0 hidden md:block md:w-96 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #000 0%, #000 25%, rgba(0,0,0,0.7) 60%, transparent 100%)' }} />

        <div className="absolute inset-y-0 left-0 w-[42%] flex-col justify-center px-12 md:px-16 z-10 hidden md:flex"
          style={{ pointerEvents: 'none' }}>
          {SCROLL_OVERLAYS.map((o) => {
            const visible = scrollT >= o.from && scrollT <= o.to;
            return (
              <div key={o.title} className="absolute transition-all duration-700"
                style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}>
                <p className="text-white/50 text-xs tracking-[0.4em] uppercase mb-4">{o.label}</p>
                <h3 className="text-white font-black tracking-tight leading-none"
                  style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)' }}>
                  {o.title}
                </h3>
              </div>
            );
          })}
        </div>

        <div className="absolute left-0 right-0 bottom-36 sm:bottom-44 flex flex-col items-center z-10 md:hidden px-6 text-center"
          style={{ pointerEvents: 'none' }}>
          {SCROLL_OVERLAYS.map((o) => {
            const visible = scrollT >= o.from && scrollT <= o.to;
            return (
              <div key={o.title} className="absolute transition-all duration-500"
                style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}>
                <p className="text-white/50 text-xs tracking-[0.4em] uppercase mb-3">{o.label}</p>
                <h3 className="text-white font-black tracking-tight leading-none"
                  style={{ fontSize: 'clamp(2rem, 8vw, 3rem)' }}>
                  {o.title}
                </h3>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none"
          style={{ opacity: sceneOpacity, transition: 'opacity 0.6s ease' }}>
          <a href="#vinyl-benefits"
            className="pointer-events-auto inline-flex items-center gap-2 px-7 py-3 rounded-full border text-white/80 text-sm font-medium tracking-wide transition-all duration-300 hover:border-white/40 hover:text-white active:scale-95"
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
            transition: entered && scrollT === 0
              ? 'opacity 0.8s ease, transform 0.8s ease'
              : 'none',
          }}>
          <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-5">Vinyl Wrapping</p>
          <h2 className="text-white font-black tracking-tighter leading-none text-center"
            style={{ fontSize: 'clamp(3.5rem, 13vw, 12rem)' }}>
            VINYL
          </h2>
          <div style={{
            width: '64px', height: '3px', marginTop: '16px',
            borderRadius: '9999px',
            backgroundColor: '#44ff55',
            boxShadow: '0 0 12px #44ff55',
          }} />
          <p className="text-white/25 text-sm mt-6 tracking-wide text-center max-w-xs px-6">
            Give your car a new identity — any color, any finish
          </p>
        </div>

      </div>
    </div>
  );
}


const ACCORDION_ITEMS = [
  {
    id: 'colors',
    num: '01',
    title: 'Any Color & Finish',
    preview: 'Matte · Gloss · Satin · Chrome · Chameleon',
    body: 'Over 500 shades and textures to choose from. Matte black for stealth, mirror chrome for drama, color-shifting chameleon for the bold — or anything in between. If you can imagine it, we can wrap it.',
  },
  {
    id: 'protection',
    num: '02',
    title: 'Paint Protection',
    preview: 'Stone chips · Scratches · UV damage',
    body: 'Vinyl film acts as a sacrificial shield between your factory paint and the road. Chips, light scratches and UV oxidation hit the wrap first — your original paint stays factory-fresh underneath.',
  },
  {
    id: 'reversible',
    num: '03',
    title: 'Fully Reversible',
    preview: 'Remove anytime · Zero damage',
    body: 'Changed your mind? Vinyl peels off cleanly with no adhesive residue and no damage to the original paint — even years later. Switch colours whenever you want. Your car, your rules.',
  },
  {
    id: 'value',
    num: '04',
    title: 'Protects Resale Value',
    preview: 'Original paint preserved · Higher resale',
    body: 'Buyers pay more for a car with flawless factory paint. Wrapping now means unwrapping later to reveal a pristine surface — making it one of the smartest investments for your vehicle\'s long-term value.',
  },
  {
    id: 'coverage',
    num: '05',
    title: 'Partial or Full Wrap',
    preview: 'Hood · Roof · Full body · Accents',
    body: 'Wrap just the roof and mirrors for contrast, go full-body for a complete transformation, or accent only the pillars and spoiler. We work panel-by-panel — you decide exactly what gets wrapped.',
  },
  {
    id: 'turnaround',
    num: '06',
    title: 'Fast Turnaround',
    preview: '1–3 days · Ready to drive',
    body: 'A professional full-body wrap is typically done in 1–3 days. Partial wraps are often completed same-day. We prep, apply and quality-check everything before you pick up your car.',
  },
];

function VinylBenefits() {
  const [openId, setOpenId] = useState<string | null>('colors');
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
        else if (e.boundingClientRect.top > 0) setInView(false);
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="vinyl-benefits" ref={ref} className="bg-black py-16 px-6 md:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto">

        <div className="mb-12"
          style={{ opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
          <p className="text-white/40 text-xs tracking-[0.5em] uppercase mb-3">Premium Vinyl</p>
          <h2 className="text-white font-black tracking-tight leading-none mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Why Wrap Your Car
          </h2>
          <div style={{ width: '48px', height: '3px', borderRadius: '9999px', backgroundColor: '#44ff55', boxShadow: '0 0 10px #44ff55' }} />
        </div>

        <div className="flex flex-col" style={{ overflow: 'clip' }}>
          {ACCORDION_ITEMS.map((item, i) => {
            const open = openId === item.id;
            const fromLeft = i % 2 === 0;
            return (
              <div
                key={item.id}
                style={{
                  borderTop: `1px solid ${open ? 'rgba(68,255,85,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  opacity:   inView ? 1 : 0,
                  transform: inView ? 'translateX(0)' : `translateX(${fromLeft ? '-100vw' : '100vw'})`,
                  transition: `opacity 0.55s ease ${i * 0.09}s, transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 0.09}s, border-color 0.3s ease`,
                }}
              >
                <button
                  className="w-full flex items-center gap-5 md:gap-8 py-5 text-left"
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  <span className="shrink-0 font-black tabular-nums transition-colors duration-300"
                    style={{ fontSize: '0.85rem', letterSpacing: '0.06em', color: open ? '#44ff55' : 'rgba(255,255,255,0.22)', minWidth: '2rem' }}>
                    {item.num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-black tracking-tight leading-tight transition-colors duration-300"
                      style={{ fontSize: 'clamp(1.15rem, 2.5vw, 1.7rem)', color: open ? '#ffffff' : 'rgba(255,255,255,0.78)' }}>
                      {item.title}
                    </p>
                    <p className="text-white/35 text-xs mt-0.5 tracking-wide overflow-hidden transition-all duration-300"
                      style={{ maxHeight: open ? '0px' : '20px', opacity: open ? 0 : 1 }}>
                      {item.preview}
                    </p>
                  </div>
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{ backgroundColor: open ? 'rgba(68,255,85,0.12)' : 'rgba(255,255,255,0.06)', rotate: open ? '45deg' : '0deg' }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M6.5 1v11M1 6.5h11" stroke={open ? '#44ff55' : 'rgba(255,255,255,0.5)'} strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  </div>
                </button>
                <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.35s cubic-bezier(0.4,0,0.2,1)' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <p className="text-white/55 text-sm md:text-base leading-relaxed pb-6"
                      style={{ paddingLeft: 'calc(2rem + 1.25rem)', paddingRight: '2.5rem' }}>
                      {item.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10"
          style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.6s ease 0.55s' }}>
          <p className="text-white/35 text-sm max-w-xs text-center sm:text-left">
            Hundreds of colors available — book a free consultation.
          </p>
          <a href="#contact"
            className="shrink-0 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-black font-semibold text-sm tracking-wide transition-all duration-200 hover:bg-white/85 active:scale-95">
            Get a Quote
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7h9M7 2.5l4.5 4.5L7 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
}

export default function VinylSection() {
  return (
    <>
      <VinylScrollAnimation />
      <VinylBenefits />
    </>
  );
}
