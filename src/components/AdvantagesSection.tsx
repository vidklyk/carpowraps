'use client';

import { useState, useRef, useEffect } from 'react';

const SPRING = 'transform 0.5s cubic-bezier(0.16,1,0.3,1), filter 0.5s ease, opacity 0.5s ease';

const PORTRAIT_AUTHOR  = { w: 300, h: 346 };
const LANDSCAPE_AUTHOR = { w: 480, h: 348 };
const BASE_H = 380;

const SLOTS = [
  { tyR: 0,         scale: 1.00, bright: 1.00, blur: 0   },
  { tyR: 94  / 380, scale: 0.88, bright: 0.52, blur: 0.6 },
  { tyR: 150 / 380, scale: 0.78, bright: 0.30, blur: 1.8 },
  { tyR: 188 / 380, scale: 0.72, bright: 0.16, blur: 3   },
];
const MOBILE_SLOTS = [
  { tyR: 0,    scale: 1.00, bright: 1.00, blur: 0   },
  { tyR: 0.34, scale: 0.85, bright: 0.50, blur: 0.6 },
  { tyR: 0.56, scale: 0.72, bright: 0.27, blur: 1.6 },
  { tyR: 0.70, scale: 0.66, bright: 0.13, blur: 2.6 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function cfgForRel(rel: number, h: number, slots: typeof SLOTS) {
  const sign = rel < 0 ? -1 : 1;
  const a    = Math.min(Math.abs(rel), 3);
  const lo   = Math.floor(a);
  const hi   = Math.min(lo + 1, 3);
  const f    = a - lo;
  const A = slots[lo], B = slots[hi];
  const k = h / BASE_H;
  return {
    ty:     sign * lerp(A.tyR,    B.tyR,    f) * h,
    scale:         lerp(A.scale,  B.scale,  f),
    bright:        lerp(A.bright, B.bright, f),
    blur:          lerp(A.blur,   B.blur,   f) * k,
    z:      Math.round(100 - a * 10),
    hidden: a >= 2.6,
  };
}

function relPos(i: number, active: number, n: number): number {
  let r = i - active;
  while (r >  n / 2) r -= n;
  while (r <= -n / 2) r += n;
  return r;
}

function computeCardSize(vw: number, vh: number): { w: number; h: number; landscape: boolean; containerH: number } {
  const landscape = vw >= 768;
  const author = landscape ? LANDSCAPE_AUTHOR : PORTRAIT_AUTHOR;
  const ratio = author.h / author.w;
  let w = landscape
    ? clamp(vw - 380, 440, 540)
    : Math.min(vw - 72, 300);
  let h = w * ratio;
  const maxH = vh * (landscape ? 0.60 : 0.26);
  if (h > maxH) { h = maxH; w = h / ratio; }
  w = Math.round(w); h = Math.round(h);

  const RESERVED = 320;
  const containerH = landscape
    ? Math.round(h * (660 / BASE_H))
    : Math.round(clamp(vh - RESERVED, h * 1.32, h * 2.2));

  return { w, h, landscape, containerH };
}

const ADVANTAGES = [
  { num: '01', title: 'Warranty',          desc: "Up to 6 months' warranty when using our materials. We stand behind every installation." },
  { num: '02', title: 'Safety',            desc: "Specialized uniforms and protective equipment on every job to protect your car's parts." },
  { num: '03', title: 'Premium Materials', desc: "Only original certified premium brands — no compromises on quality, ever." },
  { num: '04', title: 'Precision',         desc: "Precise measurements and calculations before every installation for a perfect fit." },
  { num: '05', title: 'Invisible Edges',   desc: "Fold-over technology — no visible edges, no lifting. Seamless factory finish." },
  { num: '06', title: 'Team of Experts',   desc: "Experienced specialists with over 10 years in automotive protection and vinyl work." },
  { num: '07', title: 'Deep Cleaning',     desc: "Vehicle thoroughly cleaned before and after each job for a flawless result." },
];

const ICONS: Record<string, React.ReactElement> = {
  '01': <svg viewBox="0 0 28 28" fill="none" width="22" height="22"><path d="M14 3L5 7v7c0 5.5 3.8 10.6 9 12 5.2-1.4 9-6.5 9-12V7L14 3z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.5 14l3 3 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  '02': <svg viewBox="0 0 28 28" fill="none" width="22" height="22"><circle cx="14" cy="9" r="4" stroke="currentColor" strokeWidth="1.7"/><path d="M6 24c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  '03': <svg viewBox="0 0 28 28" fill="none" width="22" height="22"><path d="M14 3l7 7-7 15L7 10l7-7z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 10h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  '04': <svg viewBox="0 0 28 28" fill="none" width="22" height="22"><circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="1.7"/><circle cx="14" cy="14" r="3.5" stroke="currentColor" strokeWidth="1.7"/><line x1="14" y1="5" x2="14" y2="2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><line x1="14" y1="23" x2="14" y2="25.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><line x1="5" y1="14" x2="2.5" y2="14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><line x1="23" y1="14" x2="25.5" y2="14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  '05': <svg viewBox="0 0 28 28" fill="none" width="22" height="22"><path d="M4 10l10-5 10 5-10 5L4 10z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 15l10 5 10-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  '06': <svg viewBox="0 0 28 28" fill="none" width="22" height="22"><circle cx="10" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.7"/><circle cx="19" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.7"/><path d="M3 23c0-3.9 3.1-7 7-7h8c3.9 0 7 3.1 7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  '07': <svg viewBox="0 0 28 28" fill="none" width="22" height="22"><path d="M14 3C14 3 6 12.5 6 18a8 8 0 0016 0c0-5.5-8-15-8-15z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

function IconChip({ num, size }: { num: string; size: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, flexShrink: 0, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.8)' }}>
      {ICONS[num]}
    </div>
  );
}

export default function AdvantagesSection() {
  const N = ADVANTAGES.length;

  const [active,   setActive]   = useState(0);
  const [dragDy,   setDragDy]   = useState(0);
  const [dragging, setDragging] = useState(false);
  const [inView,   setInView]   = useState(false);
  const [dims,     setDims]     = useState({ w: LANDSCAPE_AUTHOR.w, h: LANDSCAPE_AUTHOR.h, landscape: true, containerH: Math.round(LANDSCAPE_AUTHOR.h * 660 / BASE_H) });

  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const startY     = useRef<number | null>(null);

  const CARD_W      = dims.w;
  const CARD_H      = dims.h;
  const landscape   = dims.landscape;
  const author      = landscape ? LANDSCAPE_AUTHOR : PORTRAIT_AUTHOR;
  const k           = CARD_W / author.w;
  const CONTAINER_H = dims.containerH;
  const DRAG_SPAN   = CARD_H * (130 / BASE_H);

  useEffect(() => {
    const calc = () => setDims(computeCardSize(window.innerWidth, window.innerHeight));
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.08 }
    );
    obs.observe(el);
    const t = setTimeout(() => setInView(true), 2500);
    return () => { obs.disconnect(); clearTimeout(t); };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    setDragging(true);
    setDragDy(0);
    try { wrapRef.current?.setPointerCapture(e.pointerId); } catch { /* unsupported */ }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startY.current === null) return;
    setDragDy(e.clientY - startY.current);
  };
  const endDrag = (e: React.PointerEvent) => {
    if (startY.current === null) return;
    const dy = e.clientY - startY.current;
    startY.current = null;
    setDragging(false);
    setDragDy(0);
    const progress = dy / DRAG_SPAN;
    if      (progress >=  0.5) setActive(a => (a - 1 + N) % N);
    else if (progress <= -0.5) setActive(a => (a + 1) % N);
  };

  const go = (dir: number) => setActive(a => (a + dir + N) % N);

  const progress      = dragging ? clamp(dragDy / DRAG_SPAN, -1, 1) : 0;
  const virtualActive = active - progress;

  const renderInner = (item: typeof ADVANTAGES[number]) => {
    if (landscape) {
      return (
        <div style={{ width: author.w, height: author.h, transform: `scale(${k})`, flexShrink: 0, boxSizing: 'border-box', padding: '40px 46px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 36 }}>
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 18, width: 116 }}>
            <IconChip num={item.num} size={56} />
            <span style={{ fontFamily: 'monospace', fontSize: '2.6rem', fontWeight: 700, lineHeight: 1, color: 'rgba(255,255,255,0.12)', letterSpacing: '-0.02em' }}>{item.num}</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontWeight: 900, fontSize: '1.9rem', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 14 }}>{item.title}</h3>
            <div style={{ width: 30, height: 2, borderRadius: 999, background: '#44ff55', boxShadow: '0 0 8px #44ff55', marginBottom: 18 }} />
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.6 }}>{item.desc}</p>
          </div>
        </div>
      );
    }
    return (
      <div style={{ width: author.w, height: author.h, transform: `scale(${k})`, flexShrink: 0, boxSizing: 'border-box', padding: 28, display: 'flex', flexDirection: 'column' }}>
        <IconChip num={item.num} size={42} />
        <span style={{ fontFamily: 'monospace', fontSize: '0.62rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.22)', display: 'block', margin: '18px 0 6px' }}>{item.num}</span>
        <h3 style={{ fontWeight: 900, fontSize: '1.45rem', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 12 }}>{item.title}</h3>
        <div style={{ width: 26, height: 2, borderRadius: 999, background: '#44ff55', boxShadow: '0 0 8px #44ff55', marginBottom: 16 }} />
        <p style={{ color: 'rgba(255,255,255,0.56)', fontSize: '1.28rem', lineHeight: 1.5, flex: 1 }}>{item.desc}</p>
      </div>
    );
  };

  const edgeFade = 0.06;
  const maskGrad = `linear-gradient(to bottom, transparent 0%, #000 ${(edgeFade * 100).toFixed(1)}%, #000 ${((1 - edgeFade) * 100).toFixed(1)}%, transparent 100%)`;

  const carousel = (
    <div
      ref={wrapRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{
        position:    'relative',
        width:       `${CARD_W}px`,
        height:      `${CONTAINER_H}px`,
        overflow:    'hidden',
        cursor:      dragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        flexShrink:  0,
        maskImage:        maskGrad,
        WebkitMaskImage:  maskGrad,
      }}
    >
      {ADVANTAGES.map((item, i) => {
        const rel     = relPos(i, virtualActive, N);
        const cfg     = cfgForRel(rel, CARD_H, landscape ? SLOTS : MOBILE_SLOTS);
        const isFront = Math.abs(rel) < 0.5;
        return (
          <div key={i}
            style={{
              position:      'absolute',
              left:          '50%',
              top:           '50%',
              width:         `${CARD_W}px`,
              height:        `${CARD_H}px`,
              borderRadius:  `${Math.round(22 * k)}px`,
              background:    'linear-gradient(155deg, #282828 0%, #1e1e1e 100%)',
              border:        '1px solid rgba(255,255,255,0.1)',
              boxShadow:     isFront ? '0 24px 70px rgba(0,0,0,0.65)' : 'none',
              transform:     `translate(-50%, calc(-50% + ${cfg.ty}px)) scale(${cfg.scale})`,
              filter:        `brightness(${cfg.bright}) blur(${cfg.blur}px)`,
              opacity:       cfg.hidden ? 0 : 1,
              zIndex:        cfg.z,
              transition:    dragging ? 'none' : SPRING,
              pointerEvents: 'none',
              display:       'flex',
              alignItems:    'center',
              justifyContent:'center',
              overflow:      'hidden',
              userSelect:    'none',
              willChange:    'transform, opacity',
            }}
          >
            {renderInner(item)}
          </div>
        );
      })}
    </div>
  );

  const Dot = ({ i, vertical }: { i: number; vertical: boolean }) => (
    <button onClick={() => setActive(i)}
      className="rounded-full transition-all duration-300"
      style={{
        width:  vertical ? '5px' : (i === active ? '20px' : '5px'),
        height: vertical ? (i === active ? '20px' : '5px') : '5px',
        backgroundColor: i === active ? '#fff' : 'rgba(255,255,255,0.2)',
        flexShrink: 0,
      }}
    />
  );

  const arrowBtn = "w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 hover:border-white/35 hover:text-white active:scale-95 text-white/60";

  return (
    <section ref={sectionRef} id="advantages" className="bg-black pt-28 pb-10 md:py-28 px-4">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-3 md:mb-10"
          style={{ opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(20px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
          <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-3">Why Choose Us</p>
          <h2 className="text-white font-black tracking-tight leading-none mb-4"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            Our Advantages
          </h2>
          <div className="mx-auto" style={{ width: '48px', height: '3px', borderRadius: '9999px', backgroundColor: '#44ff55', boxShadow: '0 0 10px #44ff55' }} />
          <p className="text-white/20 text-xs tracking-[0.3em] uppercase mt-4">↑ Swipe up · Swipe down ↓</p>
        </div>

        {/* Carousel (centred on the page) with the vertical nav floated to its
            right via absolute positioning, so the nav never shifts the cards. */}
        <div className="flex justify-center mb-2 md:mb-8"
          style={{
            opacity:   inView ? 1 : 0,
            transform: inView ? 'none' : 'translateY(56px) scale(0.92)',
            filter:    inView ? 'blur(0px)' : 'blur(8px)',
            transition: 'opacity 0.8s ease 0.15s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s, filter 0.8s ease 0.15s',
          }}>
          <div className="relative" style={{ width: `${CARD_W}px` }}>
            {carousel}

            <div className="hidden md:flex flex-col items-center gap-4"
              style={{
                position: 'absolute',
                left: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                marginLeft: '28px',
                opacity: inView ? 1 : 0,
                transition: 'opacity 0.6s ease 0.3s',
              }}>
              <button onClick={() => go(-1)} aria-label="Previous" className={arrowBtn} style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 9l5-5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <div className="flex flex-col items-center gap-1.5 py-1">
                {ADVANTAGES.map((_, i) => <Dot key={i} i={i} vertical />)}
              </div>
              <button onClick={() => go(1)} aria-label="Next" className={arrowBtn} style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex md:hidden items-center justify-center gap-3 mb-5"
          style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.6s ease 0.3s' }}>
          <button onClick={() => go(-1)} aria-label="Previous" className={arrowBtn} style={{ borderColor: 'rgba(255,255,255,0.15)', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="flex gap-1.5 flex-wrap justify-center">
            {ADVANTAGES.map((_, i) => <Dot key={i} i={i} vertical={false} />)}
          </div>
          <button onClick={() => go(1)} aria-label="Next" className={arrowBtn} style={{ borderColor: 'rgba(255,255,255,0.15)', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="flex justify-center" style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.6s ease 0.45s' }}>
          <a href="#contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border text-white/80 text-sm font-medium tracking-wide transition-all duration-300 hover:border-white/35 hover:text-white active:scale-95"
            style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
            Calculate Cost
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M7 2.5l4.5 4.5L7 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>

      </div>
    </section>
  );
}
