'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

function MobileTicker({
  items,
  active,
  onSelect,
}: {
  items: typeof TESTIMONIALS;
  active: number;
  onSelect: (i: number) => void;
}) {
  const trackRef    = useRef<HTMLDivElement>(null);
  const offsetRef   = useRef(0);
  const rafRef      = useRef<number | null>(null);
  const copyWidthRef = useRef(0);
  const touchRef    = useRef<{ startX: number; startOffset: number } | null>(null);
  const SPEED = 0.45;

  const ticker = [...items, ...items, ...items];

  const applyTransform = () => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
    }
  };

  const normalize = () => {
    const w = copyWidthRef.current;
    if (!w) return;
    while (offsetRef.current < -2 * w) offsetRef.current += w;
    while (offsetRef.current > -w)     offsetRef.current -= w;
  };

  const startRAF = useCallback(() => {
    if (rafRef.current) return;
    const loop = () => {
      offsetRef.current -= SPEED;
      normalize();
      applyTransform();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const stopRAF = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let id1: number, id2: number;
    id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => {
        copyWidthRef.current = track.scrollWidth / 3;
        offsetRef.current = -copyWidthRef.current;
        applyTransform();
        startRAF();
      });
    });
    return () => { cancelAnimationFrame(id1); cancelAnimationFrame(id2); stopRAF(); };
  }, [startRAF, stopRAF]);

  const onTouchStart = (e: React.TouchEvent) => {
    stopRAF();
    touchRef.current = { startX: e.touches[0].clientX, startOffset: offsetRef.current };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const dx = e.touches[0].clientX - touchRef.current.startX;
    offsetRef.current = touchRef.current.startOffset + dx;
    normalize();
    applyTransform();
  };

  const onTouchEnd = () => {
    if (!touchRef.current) return;
    touchRef.current = null;
    normalize();
    applyTransform();
    startRAF();
  };

  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div ref={trackRef} className="flex gap-3 w-max will-change-transform">
        {ticker.map((item, i) => {
          const realIdx = i % items.length;
          const isActive = realIdx === active;
          return (
            <button
              key={i}
              onClick={() => onSelect(realIdx)}
              className="rounded-xl overflow-hidden text-left flex-shrink-0"
              style={{
                width: '180px',
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
                background: 'rgba(18,18,18,0.9)',
                opacity: isActive ? 1 : 0.6,
                transform: isActive ? 'scale(1)' : 'scale(0.97)',
                transition: 'border-color 0.3s ease, opacity 0.3s ease, transform 0.3s ease',
              }}>
              <div className="relative aspect-[4/3]">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)' }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" opacity="0.2">
                  <path d="M6 22l2.5-7a2 2 0 011.9-1.4h15.2a2 2 0 011.9 1.4L30 22M6 22v4a1 1 0 001 1h2a1 1 0 001-1v-1h16v1a1 1 0 001 1h2a1 1 0 001-1v-4M6 22h24M10 22l1.5-5h13l1.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10.5" cy="24.5" r="1.5" fill="white"/>
                  <circle cx="25.5" cy="24.5" r="1.5" fill="white"/>
                </svg>
              </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.car}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayButton size={28} />
                </div>
              </div>
              <div className="px-2.5 py-2.5">
                <p className="text-white/70 text-xs leading-snug mb-1 line-clamp-2">
                  "{item.quote.slice(0, 45)}…"
                </p>
                <Stars count={item.stars} />
                <p className="text-white/60 text-xs font-semibold mt-1 truncate">{item.name}</p>
                <p className="text-white/30 text-xs truncate">{item.car}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full truncate max-w-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.55)', fontSize: '9px' }}>
                  {item.service}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const TESTIMONIALS = [
  {
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=900&q=80&auto=format&fit=crop',
    video: '',
    quote: 'The entire experience exceeded expectations. The attention to detail was incredible and the result looked better than I imagined.',
    name: 'Michael R.',
    car: 'Porsche 911 GT3',
    service: 'Full PPF + Ceramic Tint',
    stars: 5,
  },
  {
    image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=900&q=80&auto=format&fit=crop',
    video: '',
    quote: 'Incredible attention to detail. Worth every penny. My Huracán looks absolutely stunning.',
    name: 'David L.',
    car: 'Lamborghini Huracán',
    service: 'Full PPF',
    stars: 5,
  },
  {
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&q=80&auto=format&fit=crop',
    video: '',
    quote: 'Professional, respectful, and the results are perfect. I couldn\'t be happier with the transformation.',
    name: 'Jessica M.',
    car: 'Mercedes AMG G63',
    service: 'Full PPF + Tint',
    stars: 5,
  },
  {
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=900&q=80&auto=format&fit=crop',
    video: '',
    quote: 'They treated my car like their own. The wrap looks factory — you would never know it wasn\'t original.',
    name: 'Andrew K.',
    car: 'Audi R8',
    service: 'Full PPF + Ceramic Tint',
    stars: 5,
  },
  {
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&q=80&auto=format&fit=crop',
    video: '',
    quote: 'Best in LA. My M4 looks unreal. The ceramic coating is something else — water just flies off.',
    name: 'Brandon T.',
    car: 'BMW M4',
    service: 'PPF + Tint',
    stars: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#FFB800">
          <path d="M8 1l1.854 3.756 4.146.602-3 2.924.708 4.128L8 10.5l-3.708 1.91.708-4.128-3-2.924 4.146-.602L8 1z"/>
        </svg>
      ))}
    </div>
  );
}

function PlayButton({ size = 56 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110"
      style={{
        width: size, height: size,
        backgroundColor: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(8px)',
        border: '1.5px solid rgba(255,255,255,0.3)',
      }}>
      <svg width={size * 0.32} height={size * 0.32} viewBox="0 0 18 20" fill="none">
        <path d="M2 2l14 8-14 8V2z" fill="white" fillOpacity="0.95"/>
      </svg>
    </div>
  );
}

export default function TestimonialsSection() {
  const [active, setActive]   = useState(0);
  const [inView, setInView]   = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const total = TESTIMONIALS.length;

  const prev = useCallback(() => setActive(a => (a - 1 + total) % total), [total]);
  const next = useCallback(() => setActive(a => (a + 1) % total), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

  const swipePosRef = useRef<number | null>(null);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    swipePosRef.current = e.touches[0].clientX;
  }, []);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (swipePosRef.current === null) return;
    const dx = swipePosRef.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) dx > 0 ? next() : prev();
    swipePosRef.current = null;
  }, [next, prev]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); else if (e.boundingClientRect.top > 0) setInView(false); },
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const t = TESTIMONIALS[active];

  return (
    <section ref={sectionRef} className="bg-black md:min-h-screen flex flex-col justify-center py-16 md:py-20 px-4 md:px-12 lg:px-20" style={{ overflowX: 'hidden' }}>
      <style>{`
        .testimonial-img-side { height: 200px; }
        @media (min-width: 768px) { .testimonial-img-side { height: auto; min-height: 320px; } }
      `}</style>
      <div className="w-full max-w-5xl mx-auto">

        <div className="text-center mb-10 overflow-hidden">
          <p className="text-white/30 text-xs tracking-[0.45em] uppercase mb-3"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(-20px)',
              transition: 'opacity 0.7s ease 0s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0s',
            }}>
            Trust is earned. One vehicle at a time.
          </p>
          <h2 className="text-white font-black tracking-tight uppercase leading-none mb-3"
            style={{
              fontSize: 'clamp(2rem, 7vw, 5rem)',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(32px)',
              filter: inView ? 'blur(0px)' : 'blur(16px)',
              transition: 'opacity 1s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.1s, filter 0.9s ease 0.1s',
            }}>
            Our Reputation
          </h2>
          <p className="text-white/45 text-sm tracking-wide"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(12px)',
              transition: 'opacity 0.6s ease 0.35s, transform 0.6s ease 0.35s',
            }}>Real Stories. Real Results.</p>
          <div className="mx-auto mt-4" style={{
            width: '48px', height: '3px', borderRadius: '9999px',
            backgroundColor: '#44ff55', boxShadow: '0 0 10px #44ff55',
            opacity: inView ? 1 : 0,
            transform: inView ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'center',
            transition: 'opacity 0.6s ease 0.45s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.45s',
          }} />
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-white/8 mb-4"
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
          style={{
            background: 'rgba(18,18,18,0.9)',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(60px)',
            filter: inView ? 'blur(0px)' : 'blur(4px)',
            transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.3s, filter 0.8s ease 0.3s',
          }}>

          <div className="flex flex-col md:flex-row">
            <div className="testimonial-img-side relative w-full md:w-[55%] flex-shrink-0 group cursor-pointer">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)' }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" opacity="0.2">
                  <path d="M6 22l2.5-7a2 2 0 011.9-1.4h15.2a2 2 0 011.9 1.4L30 22M6 22v4a1 1 0 001 1h2a1 1 0 001-1v-1h16v1a1 1 0 001 1h2a1 1 0 001-1v-4M6 22h24M10 22l1.5-5h13l1.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10.5" cy="24.5" r="1.5" fill="white"/>
                  <circle cx="25.5" cy="24.5" r="1.5" fill="white"/>
                </svg>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.image}
                alt={t.car}
                className="absolute inset-0 w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 60%, rgba(0,0,0,0.4) 100%)' }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <PlayButton size={56} />
                <span className="text-white/70 text-xs tracking-[0.3em] uppercase font-medium">Watch Story</span>
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center px-6 md:px-7 py-6 md:py-10 overflow-hidden">
              <Stars count={t.stars} />
              <blockquote className="text-white font-medium leading-relaxed mt-4 mb-5 line-clamp-4 break-words"
                style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1.2rem)' }}>
                "{t.quote}"
              </blockquote>
              <div className="w-8 h-px bg-white/20 mb-4" />
              <p className="text-white font-bold text-sm tracking-wide uppercase">{t.name}</p>
              <p className="text-white/40 text-xs tracking-widest uppercase mt-0.5 mb-3">{t.car}</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide w-fit"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}>
                {t.service}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-4">
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === active ? '28px' : '6px',
                height: '6px',
                backgroundColor: i === active ? '#fff' : 'rgba(255,255,255,0.2)',
              }} />
          ))}
        </div>


        <div className="md:hidden"
          style={{
            opacity: inView ? 1 : 0,
            transition: 'opacity 0.6s ease 0.45s',
          }}>
          <MobileTicker items={TESTIMONIALS} active={active} onSelect={setActive} />
        </div>

        <div className="relative hidden md:block">
          <button onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 rounded-full border border-white/15 bg-black flex items-center justify-center text-white/60 hover:text-white hover:border-white/35 transition-all duration-200">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 rounded-full border border-white/15 bg-black flex items-center justify-center text-white/60 hover:text-white hover:border-white/35 transition-all duration-200">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="grid grid-cols-5 gap-3">
            {TESTIMONIALS.map((item, i) => (
              <button key={i} onClick={() => setActive(i)}
                className="group relative rounded-xl overflow-hidden text-left transition-all duration-300"
                style={{
                  border: `1px solid ${i === active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  background: 'rgba(18,18,18,0.9)',
                  opacity: inView ? (i === active ? 1 : 0.6) : 0,
                  transform: inView ? (i === active ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(0)') : 'scale(0.9) translateY(32px)',
                  filter: inView ? 'blur(0px)' : 'blur(4px)',
                  transition: `border-color 0.3s ease, opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${0.45 + i * 0.07}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${0.45 + i * 0.07}s, filter 0.6s ease ${0.45 + i * 0.07}s`,
                }}>
                <div className="relative aspect-[4/3]">
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)' }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" opacity="0.2">
                  <path d="M6 22l2.5-7a2 2 0 011.9-1.4h15.2a2 2 0 011.9 1.4L30 22M6 22v4a1 1 0 001 1h2a1 1 0 001-1v-1h16v1a1 1 0 001 1h2a1 1 0 001-1v-4M6 22h24M10 22l1.5-5h13l1.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10.5" cy="24.5" r="1.5" fill="white"/>
                  <circle cx="25.5" cy="24.5" r="1.5" fill="white"/>
                </svg>
              </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.car}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayButton size={32} />
                  </div>
                </div>
                <div className="px-2.5 py-2.5" style={{ minHeight: '110px' }}>
                  <p className="text-white/70 text-xs leading-snug mb-1.5 line-clamp-2">
                    "{item.quote.slice(0, 45)}…"
                  </p>
                  <Stars count={item.stars} />
                  <p className="text-white/60 text-xs font-semibold mt-1 truncate">{item.name}</p>
                  <p className="text-white/30 text-xs truncate">{item.car}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full truncate max-w-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.55)', fontSize: '9px' }}>
                    {item.service}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
