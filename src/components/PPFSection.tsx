'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PPFScrollAnimation from './PPFScrollAnimation';


function useInView(threshold = 0.2, once = true) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); }
        else if (!once && entry.boundingClientRect.top > 0) { setInView(false); }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, once]);
  return { ref, inView };
}


function PPFChapter() {
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLeaving(false);
          setEntered(true);
        } else if (entry.boundingClientRect.top > 0) {
          setEntered(false);
          setLeaving(false);
        } else {
          setLeaving(true);
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const show = entered && !leaving;

  return (
    <div ref={ref} className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent to-white/20 transition-all duration-1000"
        style={{ height: show ? '96px' : '0px' }} />

      <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-6 transition-all duration-500"
        style={{ opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(12px)', transitionDelay: show ? '200ms' : '0ms' }}>
        Paint Protection Film
      </p>

      <h2 className="text-white font-black tracking-tighter leading-none select-none transition-all duration-700"
        style={{
          fontSize: 'clamp(6rem, 20vw, 18rem)',
          opacity: show ? 1 : 0,
          transform: leaving ? 'scale(1.4)' : entered ? 'scale(1)' : 'scale(1.35)',
          filter: leaving ? 'blur(28px)' : entered ? 'blur(0px)' : 'blur(24px)',
          transitionDelay: show ? '100ms' : '0ms',
          textDecorationLine: 'underline',
          textDecorationColor: '#44ff55',
          textDecorationThickness: '3px',
          textUnderlineOffset: '16px',
        }}>
        PPF
      </h2>

      <p className="text-white/30 text-sm mt-8 tracking-wide max-w-sm text-center transition-all duration-500"
        style={{ opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(16px)', transitionDelay: show ? '500ms' : '0ms' }}>
        The invisible armor that keeps your paint factory-fresh for years
      </p>

      <div className="absolute bottom-12 flex flex-col items-center gap-2 transition-all duration-500"
        style={{ opacity: show ? 1 : 0, transitionDelay: show ? '700ms' : '0ms' }}>
        <span className="text-white/20 text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </div>
  );
}


const BRANDS = [
  { name: 'Xpel',     logo: '/brands/XPEL_id7Zr04aAH_1 1.svg' },
  { name: 'Suntek',   logo: '/brands/suntek-logo 1.svg' },
  { name: 'Stek',     logo: '/brands/svgexport-2 1.svg' },
  { name: 'Pure PPF', logo: '/brands/LOGO 1 [Vectorized].svg' },
  { name: 'Carlas',   logo: '/brands/1281e4_84150adb4dd84c18b8c2a8c5efa0fe0c~mv2 2 [Vectorized].svg' },
];

function Brands() {
  const { ref, inView } = useInView(0.02, false);
  const ticker = [...BRANDS, ...BRANDS, ...BRANDS];
  return (
    <div ref={ref} className="py-16 md:py-28 text-center">
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        .marquee-track { animation: marquee 18s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>

      <h3 className="text-white font-bold px-6"
        style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          opacity: inView ? 1 : 0,
          transform: inView ? 'scale(1) translateY(0)' : 'scale(1.35) translateY(48px)',
          filter: inView ? 'blur(0px)' : 'blur(28px)',
          transition: 'opacity 1.1s ease 0.05s, transform 1.4s cubic-bezier(0.16,1,0.3,1) 0.05s, filter 1.2s ease 0.05s',
        }}>
        Brands We Trust
      </h3>
      <div className="mx-auto mt-3 mb-6 rounded-full"
        style={{
          width: '64px', height: '3px',
          backgroundColor: '#44ff55',
          boxShadow: '0 0 12px #44ff55',
          opacity: inView ? 1 : 0,
          transition: 'opacity 0.8s ease 0.2s',
        }} />
      <p className="text-white/60 mb-16 max-w-md mx-auto px-6"
        style={{
          fontSize: '16px',
          opacity: inView ? 1 : 0,
          transform: inView ? 'none' : 'translateY(16px)',
          transition: 'opacity 0.7s ease 0.2s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s',
        }}>
        You may bring your own material — but warranty does not apply.
      </p>

      <div
        className="overflow-hidden md:hidden"
        style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)' }}
      >
        <div className="marquee-track flex gap-5 w-max">
          {ticker.map((brand, i) => (
            <div key={i}
              className="flex items-center justify-center px-8 py-5 rounded-2xl border border-white/8 bg-white/4 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brand.logo} alt={brand.name} className="h-7 w-auto object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:flex flex-wrap justify-center gap-5">
        {BRANDS.map((brand, i) => (
          <div key={brand.name}
            className="flex items-center justify-center px-8 py-5 rounded-2xl border border-white/8 bg-white/4 hover:bg-white/8 hover:scale-105 transition-all duration-300"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(32px)',
              filter: inView ? 'blur(0px)' : 'blur(6px)',
              transition: `opacity 0.6s ease ${0.28 + i * 0.07}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${0.28 + i * 0.07}s, filter 0.6s ease ${0.28 + i * 0.07}s`,
            }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.logo} alt={brand.name} className="h-7 w-auto object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}


const NOISE_SVG = (freq: string, op: number) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

const FILMS = [
  {
    id: 'gloss',
    label: 'Transparent Gloss',
    sub: 'Crystal-clear with a high-gloss mirror finish',
    bg: '#101010',
    border: '1px solid rgba(255,255,255,0.14)',
    visual: (
      <div className="absolute inset-0 rounded-[inherit] overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(175deg, #222 0%, #0c0c0c 55%, #181818 100%)' }} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(132deg, transparent 15%, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.72) 42%, rgba(255,255,255,0.55) 48%, rgba(255,255,255,0.06) 58%, transparent 68%)',
        }} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 35%, transparent 55%)',
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 60% at 85% 90%, rgba(0,0,0,0.55) 0%, transparent 70%)',
        }} />
        <div className="absolute inset-0 mix-blend-overlay" style={{
          backgroundImage: NOISE_SVG('0.65', 0.07),
          backgroundSize: '300px 300px',
          opacity: 0.07,
        }} />
        <div className="absolute inset-0 rounded-[inherit]" style={{ boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.35), inset -1px -1px 0 rgba(0,0,0,0.3)' }} />
      </div>
    ),
  },
  {
    id: 'matte',
    label: 'Transparent Matte',
    sub: 'Zero reflections, perfectly flat surface',
    bg: '#161616',
    border: '1px solid rgba(255,255,255,0.06)',
    visual: (
      <div className="absolute inset-0 rounded-[inherit] overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #1e1e1e 0%, #141414 50%, #181818 100%)' }} />
        <div className="absolute inset-0" style={{
          backgroundImage: NOISE_SVG('0.55', 0.22),
          backgroundSize: '300px 300px',
          opacity: 0.22,
          mixBlendMode: 'overlay',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: NOISE_SVG('1.2', 0.1),
          backgroundSize: '150px 150px',
          opacity: 0.1,
          mixBlendMode: 'soft-light',
        }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(255,255,255,0.025) 0%, transparent 100%)' }} />
        <div className="absolute inset-0 rounded-[inherit]" style={{ boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.05)' }} />
      </div>
    ),
  },
  {
    id: 'color',
    label: 'Any Color, Any Finish',
    sub: 'Solid colour wraps in any shade imaginable',
    bg: '#0a0a0a',
    border: '1px solid rgba(255,255,255,0.1)',
    visual: (
      <div className="absolute inset-0 rounded-[inherit] overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(160deg, #c020d8 0%, #8020e8 25%, #3040e8 55%, #6010c0 80%, #b010b0 100%)',
        }} />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.38)' }} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(125deg, transparent 25%, rgba(255,255,255,0.22) 42%, rgba(255,255,255,0.06) 52%, transparent 62%)',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: NOISE_SVG('0.55', 0.07),
          backgroundSize: '300px 300px',
          opacity: 0.07,
          mixBlendMode: 'soft-light',
        }} />
        <div className="absolute inset-0 rounded-[inherit]" style={{ boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.15), inset -1px -1px 0 rgba(0,0,0,0.3)' }} />
      </div>
    ),
  },
];

const FILM_ACCORDION = [
  {
    id:      'gloss',
    label:   'Transparent Gloss',
    sub:     'Crystal-clear with a high-gloss mirror finish',
    details: ['Self-healing surface', 'UV protection', 'Preserves original paint', 'Up to 10 year warranty'],
    ideal:   'Factory look + shine',
    bg:      FILMS[0].bg,
    border:  FILMS[0].border,
    visual:  FILMS[0].visual,
  },
  {
    id:      'matte',
    label:   'Transparent Matte',
    sub:     'Zero reflections, perfectly flat surface',
    details: ['Self-healing surface', 'UV protection', 'Preserves original paint', 'Up to 10 year warranty'],
    ideal:   'Stealth / OEM matte look',
    bg:      FILMS[1].bg,
    border:  FILMS[1].border,
    visual:  FILMS[1].visual,
  },
  {
    id:      'color',
    label:   'Any Color, Any Finish',
    sub:     'Solid colour wraps in any shade imaginable',
    details: ['Self-healing surface', 'UV protection', 'Full colour change', 'Up to 10 year warranty'],
    ideal:   'Complete transformation',
    bg:      FILMS[2].bg,
    border:  FILMS[2].border,
    visual:  FILMS[2].visual,
  },
];

const FILM_SCENES = [
  {
    id:    'gloss',
    label: 'Transparent Gloss',
    sub:   'Crystal-clear with a high-gloss mirror finish',
    tag:   'PAINT PROTECTION FILM',
    bg:    'linear-gradient(160deg, #0a0a0a 0%, #1a1a1a 60%, #0d0d0d 100%)',
    carFilter: 'none',
    carColor:  null,
    shine: true,
  },
  {
    id:    'matte',
    label: 'Transparent Matte',
    sub:   'Zero reflections — stealth, perfectly flat surface',
    tag:   'SELF-HEALING TECHNOLOGY',
    bg:    'linear-gradient(160deg, #060608 0%, #111116 60%, #08080c 100%)',
    carFilter: 'contrast(0.75) saturate(0.25) brightness(0.88)',
    carColor:  null,
    shine: false,
  },
  {
    id:    'color',
    label: 'Any Color, Any Finish',
    sub:   'Full colour change — any shade imaginable',
    tag:   'UP TO 10 YEAR WARRANTY',
    bg:    'linear-gradient(160deg, #060a14 0%, #0d1a2e 60%, #08060f 100%)',
    carFilter: 'contrast(0.6) saturate(0.15) brightness(0.72)',
    carColor:  '#2563eb',
    shine: false,
  },
];

function FilmScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollT, setScrollT]   = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const scrolled  = window.scrollY - el.offsetTop;
      const maxScroll = el.offsetHeight - window.innerHeight;
      setScrollT(Math.max(0, Math.min(1, scrolled / maxScroll)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const idx     = scrollT < 0.33 ? 0 : scrollT < 0.66 ? 1 : 2;
  const localT  = scrollT < 0.33 ? scrollT / 0.33
                : scrollT < 0.66 ? (scrollT - 0.33) / 0.33
                : (scrollT - 0.66) / 0.34;
  const textOpacity = localT < 0.15 ? localT / 0.15
                    : localT > 0.85 ? (1 - localT) / 0.15
                    : 1;

  return (
    <div ref={containerRef} style={{ height: '300vh' }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden">

        {FILM_SCENES.map((scene, i) => (
          <div key={scene.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ background: scene.bg, opacity: idx === i ? 1 : 0 }} />
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          {FILM_SCENES.map((scene, i) => (
            <div key={scene.id}
              className="absolute inset-0 flex items-center justify-end pr-8 md:pr-16 transition-opacity duration-700"
              style={{ opacity: idx === i ? 1 : 0 }}>

              <div className="relative w-full max-w-xl md:max-w-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/car_nobg.png" alt={scene.label}
                  className="w-full object-contain"
                  style={{ filter: scene.carFilter, transition: 'filter 0.7s ease' }} />

                {scene.carColor && (
                  <div className="absolute inset-0 pointer-events-none rounded-xl"
                    style={{ background: scene.carColor, mixBlendMode: 'multiply', opacity: 0.7 }} />
                )}

                {scene.shine && (
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.12) 48%, rgba(255,255,255,0.22) 52%, transparent 80%)' }} />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute inset-y-0 left-0 w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 z-10"
          style={{ opacity: textOpacity, transition: 'opacity 0.3s ease' }}>
          <p className="text-white/40 text-xs tracking-[0.45em] uppercase mb-5">
            {FILM_SCENES[idx].tag}
          </p>
          <h3 className="text-white font-black tracking-tight leading-none mb-6"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>
            {FILM_SCENES[idx].label}
          </h3>
          <p className="text-white/50 text-base max-w-sm leading-relaxed">
            {FILM_SCENES[idx].sub}
          </p>
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
          {FILM_SCENES.map((_, i) => (
            <div key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width:      '4px',
                height:     i === idx ? '28px' : '8px',
                background: i === idx ? '#fff' : 'rgba(255,255,255,0.25)',
              }} />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #000, transparent)' }} />
      </div>
    </div>
  );
}


const FILM_CARDS = [
  {
    id: 'suntech-gloss',
    brand: 'SunTek',
    name: 'Transparent Gloss',
    sub: 'Crystal-clear high-gloss finish',
    img: '/films/suntech-gloss.png',
  },
  {
    id: 'suntech-matte',
    brand: 'SunTek',
    name: 'Transparent Matte',
    sub: 'Zero reflections, flat surface',
    img: '/films/suntech-matte.png',
  },
  {
    id: 'carlas-blue',
    brand: 'Carlas',
    name: 'Metal Blue Matte',
    sub: 'TPU PPF · TPUM7105B',
    img: '/films/carlas-blue.png',
  },
  {
    id: 'carlas-red',
    brand: 'Carlas',
    name: 'Metal Ruby Red',
    sub: 'TPU PPF · TPU7101B',
    img: '/films/carlas-red.png',
  },
];

function FilmTicker() {
  const ticker       = [...FILM_CARDS, ...FILM_CARDS, ...FILM_CARDS,
                        ...FILM_CARDS, ...FILM_CARDS, ...FILM_CARDS];
  const COPIES       = 6;
  const wrapRef      = useRef<HTMLDivElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);
  const offsetRef    = useRef(0);
  const rafRef       = useRef<number | null>(null);
  const copyWidthRef = useRef(0);
  const touchRef     = useRef<{ startX: number; startOffset: number } | null>(null);
  const SPEED        = 0.5;

  const apply = () => {
    if (trackRef.current)
      trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
  };

  const normalize = () => {
    const w = copyWidthRef.current;
    if (!w) return;
    while (offsetRef.current < -w) offsetRef.current += w;
    while (offsetRef.current > 0)  offsetRef.current -= w;
  };

  const startRAF = useCallback(() => {
    if (rafRef.current) return;
    const loop = () => {
      offsetRef.current -= SPEED;
      normalize();
      apply();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const stopRAF = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  useEffect(() => {
    let id1: number, id2: number;
    id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => {
        if (!trackRef.current) return;
        copyWidthRef.current = trackRef.current.scrollWidth / COPIES;
        offsetRef.current = -copyWidthRef.current;
        apply();
        startRAF();
      });
    });
    return () => { cancelAnimationFrame(id1); cancelAnimationFrame(id2); stopRAF(); };
  }, [startRAF, stopRAF]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const onTouchStart = (e: TouchEvent) => {
      stopRAF();
      touchRef.current = { startX: e.touches[0].clientX, startOffset: offsetRef.current };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touchRef.current) return;
      e.preventDefault();
      offsetRef.current = touchRef.current.startOffset + (e.touches[0].clientX - touchRef.current.startX);
      normalize(); apply();
    };
    const onTouchEnd = () => {
      if (!touchRef.current) return;
      touchRef.current = null;
      normalize(); apply(); startRAF();
    };

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      stopRAF();
      wrap.style.cursor = 'grabbing';
      touchRef.current = { startX: e.clientX, startOffset: offsetRef.current };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!touchRef.current) return;
      offsetRef.current = touchRef.current.startOffset + (e.clientX - touchRef.current.startX);
      normalize(); apply();
    };
    const onMouseUp = () => {
      if (!touchRef.current) return;
      wrap.style.cursor = 'grab';
      touchRef.current = null;
      normalize(); apply(); startRAF();
    };

    wrap.style.cursor = 'grab';
    wrap.addEventListener('touchstart',  onTouchStart, { passive: true  });
    wrap.addEventListener('touchmove',   onTouchMove,  { passive: false });
    wrap.addEventListener('touchend',    onTouchEnd,   { passive: true  });
    wrap.addEventListener('touchcancel', onTouchEnd,   { passive: true  });
    wrap.addEventListener('mousedown',   onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    return () => {
      wrap.removeEventListener('touchstart',  onTouchStart);
      wrap.removeEventListener('touchmove',   onTouchMove);
      wrap.removeEventListener('touchend',    onTouchEnd);
      wrap.removeEventListener('touchcancel', onTouchEnd);
      wrap.removeEventListener('mousedown',   onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, [startRAF, stopRAF]);

  return (
    <div ref={wrapRef} className="overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}>
      <div ref={trackRef} className="flex gap-4 w-max will-change-transform select-none"
        draggable="false">
        {ticker.map((film, i) => <FilmCard key={i} film={film} width={200} />)}
      </div>
    </div>
  );
}

function FilmCard({ film, width }: { film: typeof FILM_CARDS[0]; width?: number }) {
  return (
    <div className="group rounded-2xl overflow-hidden border border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/6 transition-all duration-300 flex-shrink-0"
      style={{ width: width ? `${width}px` : '160px' }}>
      <div className="flex items-center justify-center p-4" style={{ aspectRatio: '1 / 1', backgroundColor: '#1c1c1e' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={film.img} alt={film.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-3">
        <p className="text-white/40 text-xs tracking-widest uppercase mb-1">{film.brand}</p>
        <p className="text-white font-semibold text-sm leading-tight mb-1">{film.name}</p>
        <p className="text-white/40 text-xs leading-snug">{film.sub}</p>
      </div>
    </div>
  );
}

function FilmCarouselDesktop() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir === 'right' ? 260 : -260, behavior: 'smooth' });
  };

  return (
    <div className="hidden md:block relative max-w-5xl mx-auto">
      <button onClick={() => scroll('left')}
        className="absolute left-0 top-[45%] -translate-y-1/2 -translate-x-5 z-10 w-10 h-10 flex items-center justify-center rounded-full border border-white/15 bg-black text-white/60 hover:text-white hover:border-white/35 transition-all duration-200">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div ref={trackRef} className="flex gap-5 overflow-x-auto px-6 pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {FILM_CARDS.map((film) => (
          <FilmCard key={film.id} film={film} width={240} />
        ))}
      </div>
      <button onClick={() => scroll('right')}
        className="absolute right-0 top-[45%] -translate-y-1/2 translate-x-5 z-10 w-10 h-10 flex items-center justify-center rounded-full border border-white/15 bg-black text-white/60 hover:text-white hover:border-white/35 transition-all duration-200">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

function FilmCards() {
  return (
    <div>
      <FilmTicker />
      <div className="flex justify-center mt-10 px-4">
        <a href="#contact"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/15 text-white/80 text-sm font-medium tracking-wide hover:bg-white/8 hover:border-white/30 hover:text-white transition-all duration-300">
          View Full Catalog
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  );
}


export default function PPFSection() {
  const filmsRef = useInView(0.05);
  return (
    <section className="bg-black text-white">
      <PPFScrollAnimation />

      <Brands />

      <div className="pb-32">
        <div ref={filmsRef.ref} className="text-center mb-12 px-6 max-w-4xl mx-auto">
          <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-3"
            style={{ opacity: filmsRef.inView ? 1 : 0, transition: 'all 0.6s ease' }}>
            Choose your finish
          </p>
          <h3 className="text-white text-4xl md:text-5xl font-bold"
            style={{ opacity: filmsRef.inView ? 1 : 0, transform: filmsRef.inView ? 'none' : 'translateY(16px)', transition: 'all 0.7s ease 0.1s' }}>
            Film Options
          </h3>
          <div className="mx-auto mt-4 rounded-full"
            style={{
              width: '64px', height: '3px',
              backgroundColor: '#44ff55',
              boxShadow: '0 0 12px #44ff55',
              opacity: filmsRef.inView ? 1 : 0,
              transition: 'opacity 0.8s ease 0.25s',
            }} />
        </div>
        <FilmCards />
      </div>
    </section>
  );
}
