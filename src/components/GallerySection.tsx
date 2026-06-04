'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const GALLERY = [
  {
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=85&auto=format&fit=crop',
    title: 'Porsche 911 GT3',
    service: 'Full PPF + Ceramic Tint',
    desc: 'Complete paint protection film installation with ceramic tint on all windows. Factory finish preserved for years.',
  },
  {
    image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=1200&q=85&auto=format&fit=crop',
    title: 'Lamborghini Huracán',
    service: 'Full PPF',
    desc: 'Full body PPF wrap to protect the exotic factory paint from stone chips, road debris and UV damage.',
  },
  {
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85&auto=format&fit=crop',
    title: 'Mercedes AMG G63',
    service: 'Full PPF + Tint',
    desc: 'PPF protection combined with premium ceramic window tinting for privacy and heat rejection.',
  },
  {
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1200&q=85&auto=format&fit=crop',
    title: 'Audi R8',
    service: 'Full PPF + Ceramic',
    desc: 'High-gloss PPF and ceramic coating for ultimate protection and showroom-level shine.',
  },
  {
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=85&auto=format&fit=crop',
    title: 'BMW M4',
    service: 'PPF + Tint',
    desc: 'Satin PPF wrap with privacy window tinting. Zero compromise on performance or aesthetics.',
  },
  {
    image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=1200&q=85&auto=format&fit=crop',
    title: 'Ferrari 488',
    service: 'Ceramic Coating',
    desc: 'Multi-layer ceramic coating delivering permanent gloss and chemical resistance on the iconic red.',
  },
  {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85&auto=format&fit=crop',
    title: 'McLaren 720S',
    service: 'Full PPF',
    desc: 'Full body PPF preserving the factory finish. Every panel hand-cut and heat-formed to perfection.',
  },
  {
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85&auto=format&fit=crop',
    title: 'Bugatti Chiron',
    service: 'Full PPF + Ceramic',
    desc: 'The ultimate protection package for the ultimate hypercar. PPF + ceramic on every surface.',
  },
  {
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=85&auto=format&fit=crop',
    title: 'Bentley Continental',
    service: 'Vinyl Wrap',
    desc: 'Matte black vinyl wrap transforming factory silver into a stealth masterpiece.',
  },
  {
    image: 'https://images.unsplash.com/photo-1570733577524-3a047079e80d?w=1200&q=85&auto=format&fit=crop',
    title: 'Lamborghini Urus',
    service: 'Full PPF + Tint',
    desc: 'Complete PPF installation with ceramic window tinting on the world\'s fastest SUV.',
  },
  {
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=85&auto=format&fit=crop',
    title: 'Rolls-Royce Ghost',
    service: 'Full PPF + Ceramic',
    desc: 'Premium PPF and ceramic coating — the pinnacle of automotive protection for the pinnacle of luxury.',
  },
  {
    image: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=1200&q=85&auto=format&fit=crop',
    title: 'Porsche Taycan',
    service: 'Ceramic Coating + Tint',
    desc: 'Ceramic coating with full window tinting on Porsche\'s flagship EV — zero compromise protection.',
  },
];

const POSITIONS = [
  { rotY: 0,   rotX: -48 },
  { rotY: 90,  rotX: -48 },
  { rotY: 180, rotX: -48 },
  { rotY: 270, rotX: -48 },
  { rotY: 45,  rotX: 0   },
  { rotY: 135, rotX: 0   },
  { rotY: 225, rotX: 0   },
  { rotY: 315, rotX: 0   },
  { rotY: 0,   rotX: 48  },
  { rotY: 90,  rotX: 48  },
  { rotY: 180, rotX: 48  },
  { rotY: 270, rotX: 48  },
];

function Modal({ item, onClose }: { item: typeof GALLERY[0]; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 md:p-8"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 40px 120px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}>

        <div className="relative aspect-video w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.title}
            className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0"
            style={{ height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)' }} />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <p className="text-white/50 text-xs tracking-[0.4em] uppercase mb-2">{item.service}</p>
            <h3 className="text-white font-black tracking-tight"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              {item.title}
            </h3>
            <p className="text-white/60 text-sm mt-2 max-w-lg">{item.desc}</p>
          </div>
        </div>

        <button onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/20"
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function GallerySection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const sphereRef   = useRef<HTMLDivElement>(null);
  const wrapRef     = useRef<HTMLDivElement>(null);
  const rotYRef     = useRef(0);
  const rotXRef     = useRef(-10);
  const rafRef      = useRef<number | null>(null);
  const dragRef     = useRef<{ x: number; y: number } | null>(null);
  const isDragging  = useRef(false);

  const targetRotYRef = useRef<number | null>(null);
  const targetRotXRef = useRef<number | null>(null);

  const [selected,  setSelected]  = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [inView,    setInView]    = useState(false);

  const [sphereConfig, setSphereConfig] = useState({ radius: 260, cardW: 160, cardH: 110, height: 580, perspective: 900 });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) {
        setSphereConfig({ radius: 130, cardW: 98,  cardH: 68,  height: 310, perspective: 600 });
      } else if (w < 768) {
        setSphereConfig({ radius: 160, cardW: 118, cardH: 82,  height: 370, perspective: 700 });
      } else if (w < 1024) {
        setSphereConfig({ radius: 210, cardW: 140, cardH: 96,  height: 480, perspective: 800 });
      } else {
        setSphereConfig({ radius: 260, cardW: 160, cardH: 110, height: 580, perspective: 900 });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const applyRotation = useCallback(() => {
    if (sphereRef.current) {
      sphereRef.current.style.transform =
        `rotateX(${rotXRef.current}deg) rotateY(${rotYRef.current}deg)`;
    }
  }, []);

  const navigateTo = useCallback((i: number) => {
    const pos = POSITIONS[i];
    const rawY = -pos.rotY;
    const rawX = pos.rotX;
    const curY = ((rotYRef.current % 360) + 360) % 360;
    let dY = rawY - curY;
    while (dY > 180)  dY -= 360;
    while (dY < -180) dY += 360;
    targetRotYRef.current = rotYRef.current + dY;
    targetRotXRef.current = rawX;
    setSelected(i);
  }, []);

  useEffect(() => {
    const loop = () => {
      if (!isDragging.current) {
        if (targetRotYRef.current !== null && targetRotXRef.current !== null) {
          const dY = targetRotYRef.current - rotYRef.current;
          const dX = targetRotXRef.current - rotXRef.current;
          rotYRef.current += dY * 0.07;
          rotXRef.current += dX * 0.07;
          if (Math.abs(dY) < 0.3 && Math.abs(dX) < 0.3) {
            rotYRef.current = targetRotYRef.current;
            rotXRef.current = targetRotXRef.current;
            targetRotYRef.current = null;
            targetRotXRef.current = null;
          }
        } else {
          rotYRef.current += 0.12;
        }
      }
      applyRotation();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [applyRotation]);

  useEffect(() => {
    const el = sectionRef.current;
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

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      dragRef.current = { x: e.clientX, y: e.clientY };
      wrap.style.cursor = 'grabbing';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !dragRef.current) return;
      rotYRef.current += (e.clientX - dragRef.current.x) * 0.4;
      rotXRef.current -= (e.clientY - dragRef.current.y) * 0.25;
      dragRef.current  = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      isDragging.current = false;
      dragRef.current = null;
      wrap.style.cursor = 'grab';
    };
    const onTouchStart = (e: TouchEvent) => {
      isDragging.current = true;
      dragRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || !dragRef.current) return;
      e.preventDefault();
      rotYRef.current += (e.touches[0].clientX - dragRef.current.x) * 0.4;
      rotXRef.current -= (e.touches[0].clientY - dragRef.current.y) * 0.25;
      dragRef.current  = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => { isDragging.current = false; dragRef.current = null; };

    wrap.style.cursor = 'grab';
    wrap.addEventListener('mousedown',   onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    wrap.addEventListener('touchstart',  onTouchStart, { passive: true  });
    wrap.addEventListener('touchmove',   onTouchMove,  { passive: false });
    wrap.addEventListener('touchend',    onTouchEnd,   { passive: true  });

    return () => {
      wrap.removeEventListener('mousedown',   onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
      wrap.removeEventListener('touchstart',  onTouchStart);
      wrap.removeEventListener('touchmove',   onTouchMove);
      wrap.removeEventListener('touchend',    onTouchEnd);
    };
  }, []);

  const sel = GALLERY[selected];

  return (
    <section ref={sectionRef} id="our-work"
      className="bg-black py-10 md:py-20 px-4 md:px-12 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-6 md:mb-12"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'none' : 'translateY(24px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}>
          <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-3">Results speak louder</p>
          <h2 className="text-white font-black tracking-tight leading-none mb-4"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            Our Work
          </h2>
          <div className="mx-auto" style={{
            width: '48px', height: '3px', borderRadius: '9999px',
            backgroundColor: '#44ff55', boxShadow: '0 0 10px #44ff55',
          }} />
          <p className="text-white/20 text-xs tracking-[0.3em] uppercase mt-4">Drag · Click to explore</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12">

          <div ref={wrapRef}
            className="relative w-full md:flex-1 flex items-center justify-center select-none"
            style={{
              height: `${sphereConfig.height}px`,
              perspective: `${sphereConfig.perspective}px`,
              position: 'relative',
              zIndex: 1,           /* lower stacking context than info panel */
            }}>

            <div ref={sphereRef}
              style={{ width: 0, height: 0, transformStyle: 'preserve-3d' }}>
              {GALLERY.map((item, i) => {
                const pos = POSITIONS[i];
                const isSelected = selected === i;
                return (
                  <div key={i}
                    onClick={() => navigateTo(i)}
                    className="absolute cursor-pointer"
                    style={{
                      width: `${sphereConfig.cardW}px`, height: `${sphereConfig.cardH}px`,
                      marginLeft: `${-sphereConfig.cardW / 2}px`, marginTop: `${-sphereConfig.cardH / 2}px`,
                      transform: `rotateY(${pos.rotY}deg) rotateX(${-pos.rotX}deg) translateZ(${sphereConfig.radius}px) ${isSelected ? 'scale(1.18)' : 'scale(1)'}`,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: isSelected
                        ? '2px solid rgba(255,255,255,0.9)'
                        : '1px solid rgba(255,255,255,0.12)',
                      boxShadow: isSelected
                        ? '0 0 0 3px rgba(68,255,85,0.35), 0 20px 60px rgba(0,0,0,0.7)'
                        : '0 8px 32px rgba(0,0,0,0.5)',
                      transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), border 0.3s ease, box-shadow 0.3s ease',
                      zIndex: isSelected ? 10 : 1,
                    }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.title}
                      draggable={false}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: isSelected ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.32)',
                      transition: 'background 0.3s ease',
                    }} />
                    {isSelected && (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        onClick={e => { e.stopPropagation(); setModalOpen(true); }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
                          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          <div className="w-full md:w-72 text-center md:text-left px-4 md:px-0 pb-4 bg-black md:bg-transparent"
            style={{ position: 'relative', zIndex: 10,
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateX(0)' : 'translateX(32px)',
              transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
            }}>
            <style>{`
              @keyframes fadeSlideIn {
                from { opacity: 0; transform: translateY(12px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            <div style={{ height: '160px', overflow: 'hidden' }} className="md:!h-[220px]">
              <div key={selected} style={{ animation: 'fadeSlideIn 0.4s ease forwards' }}>
                <p className="text-white/40 text-xs tracking-[0.45em] uppercase mb-3">{sel.service}</p>
                <h3 className="text-white font-black tracking-tight leading-none mb-4"
                  style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>
                  {sel.title}
                </h3>
                <div style={{
                  width: '40px', height: '3px', borderRadius: '9999px',
                  backgroundColor: '#44ff55', boxShadow: '0 0 8px #44ff55',
                  marginBottom: '16px',
                }} className="mx-auto md:mx-0" />
                <p className="text-white/55 text-sm leading-relaxed line-clamp-3">{sel.desc}</p>
              </div>
            </div>

              <div className="flex items-center gap-3 justify-center md:justify-start mb-4 md:mb-8">
                <button
                  onClick={() => navigateTo((selected - 1 + GALLERY.length) % GALLERY.length)}
                  className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 hover:border-white/35 hover:text-white active:scale-95 text-white/60"
                  style={{ borderColor: 'rgba(255,255,255,0.15)', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {GALLERY.map((_, i) => (
                    <button key={i} onClick={() => navigateTo(i)}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === selected ? '20px' : '5px',
                        height: '5px',
                        backgroundColor: i === selected ? '#fff' : 'rgba(255,255,255,0.2)',
                      }} />
                  ))}
                </div>
                <button
                  onClick={() => navigateTo((selected + 1) % GALLERY.length)}
                  className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 hover:border-white/35 hover:text-white active:scale-95 text-white/60"
                  style={{ borderColor: 'rgba(255,255,255,0.15)', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-3 max-w-xs mx-auto md:mx-0">
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 active:scale-95"
                  style={{ backgroundColor: 'white', color: 'black' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  View Full
                </button>

                <a href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border text-white/80 text-sm font-medium tracking-wide transition-all duration-300 hover:border-white/35 hover:text-white active:scale-95"
                  style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                  Get Similar Result
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7h9M7 2.5l4.5 4.5L7 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

      {modalOpen && <Modal item={sel} onClose={() => setModalOpen(false)} />}
    </section>
  );
}
