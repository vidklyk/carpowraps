'use client';

import { useState, useRef, useEffect } from 'react';

const ALL_FAQS = [
  {
    q: 'How long does a full car wrap take?',
    a: 'A professional full-body wrap typically takes 2–3 days from start to finish. This includes surface preparation, film application and a quality inspection before handover. Partial wraps or single panels can often be completed same-day.',
  },
  {
    q: 'Will the wrap damage my original paint?',
    a: 'No — when installed and removed correctly, vinyl wrap causes zero damage to factory paint. The pressure-sensitive adhesive is designed to release cleanly, leaving no residue even after years of use. This is one of the key reasons wrapping is preferred over repainting.',
  },
  {
    q: 'How long does a vinyl wrap last?',
    a: 'A quality vinyl wrap lasts 5–7 years with proper maintenance. Factors like UV exposure, washing frequency and storage conditions affect longevity. Garaged vehicles and regular hand washing significantly extend the wrap\'s lifespan.',
  },
  {
    q: 'What is the difference between PPF and vinyl wrap?',
    a: 'PPF (Paint Protection Film) is a clear, self-healing urethane film designed purely for protection against stone chips, scratches and UV damage. Vinyl wrap is primarily for aesthetics — colour change and finish. They can be layered: PPF underneath, vinyl on top for both protection and style.',
  },
  {
    q: 'Can I wash my car after wrapping?',
    a: 'Yes. We recommend hand washing with a pH-neutral soap and a soft microfibre mitt. Avoid high-pressure jets directly on edges and seams. Automatic brushless car washes are acceptable, but traditional brush washes should be avoided as they can lift edges over time.',
  },
  {
    q: 'How much does ceramic coating cost?',
    a: 'Ceramic coating packages vary based on vehicle size and the number of coating layers applied. Prices typically range from entry-level single-coat protection to multi-layer professional packages. Contact us for a precise quote tailored to your vehicle.',
  },
  {
    q: 'Can I wrap a leased vehicle?',
    a: 'Absolutely. Wrapping a leased car is one of the smartest moves you can make — it protects the factory paint from chips and scratches, and the wrap removes cleanly at lease end revealing perfect paint underneath, helping you avoid end-of-lease damage charges.',
  },
  {
    q: 'Do you offer a warranty on your work?',
    a: 'Yes. All our installations come with a workmanship warranty. PPF carries a manufacturer warranty of up to 10 years depending on the film selected. Ceramic coatings include a 2-year warranty on professional packages. Details are provided on your quote.',
  },
];

const INITIAL = 4;
const BATCH   = 4;

export default function FAQSection() {
  const [openIdx,  setOpenIdx]  = useState<number | null>(null);
  const [shown,    setShown]    = useState(INITIAL);
  const [inView,   setInView]   = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const listRef    = useRef<HTMLDivElement>(null);

  const prevShown = useRef(INITIAL);
  useEffect(() => {
    if (shown > prevShown.current && listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
    prevShown.current = shown;
  }, [shown]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); else if (e.boundingClientRect.top > 0) setInView(false); },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const hasMore = shown < ALL_FAQS.length;
  const isExpanded = shown > INITIAL;

  return (
    <section ref={sectionRef} className="bg-black min-h-screen flex flex-col justify-center py-16 md:py-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-12 overflow-hidden">
          <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-3"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(-16px)',
              transition: 'opacity 0.7s ease 0s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0s',
            }}>Got questions?</p>
          <h2 className="text-white font-black tracking-tight leading-none mb-4"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              opacity: inView ? 1 : 0,
              transform: inView ? 'scale(1) translateY(0)' : 'scale(1.18) translateY(32px)',
              filter: inView ? 'blur(0px)' : 'blur(16px)',
              transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.1s, filter 0.9s ease 0.1s',
            }}>
            FAQ
          </h2>
          <div className="mx-auto" style={{
            width: '48px', height: '3px', borderRadius: '9999px',
            backgroundColor: '#44ff55', boxShadow: '0 0 10px #44ff55',
            opacity: inView ? 1 : 0,
            transform: inView ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'center',
            transition: 'opacity 0.6s ease 0.35s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s',
          }} />
        </div>

        <div ref={listRef}>
          {ALL_FAQS.slice(0, shown).map((faq, i) => {
            const open = openIdx === i;
            const fromLeft = i % 2 === 0;
            return (
              <div key={i}
                style={{
                  borderTop: `1px solid ${open ? 'rgba(68,255,85,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  opacity:   inView ? 1 : 0,
                  transform: inView ? 'translateX(0)' : `translateX(${fromLeft ? '-80px' : '80px'})`,
                  transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${0.2 + Math.min(i, 3) * 0.1}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${0.2 + Math.min(i, 3) * 0.1}s, border-color 0.3s ease`,
                }}>
                <button
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                  onClick={() => setOpenIdx(open ? null : i)}>
                  <span className="text-white font-semibold leading-snug transition-colors duration-300"
                    style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: open ? '#fff' : 'rgba(255,255,255,0.8)' }}>
                    {faq.q}
                  </span>
                  <span className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: open ? 'rgba(68,255,85,0.12)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${open ? 'rgba(68,255,85,0.35)' : 'rgba(255,255,255,0.1)'}`,
                      rotate: open ? '180deg' : '0deg',
                    }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" stroke={open ? '#44ff55' : 'rgba(255,255,255,0.5)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>

                <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1)' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <p className="text-white/50 text-sm md:text-base leading-relaxed pb-5 pr-10">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
        </div>

        {hasMore && (
          <div className="flex justify-center mt-8"
            style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s' }}>
            <button
              onClick={() => setShown(s => Math.min(s + BATCH, ALL_FAQS.length))}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full border text-white/80 text-sm font-medium tracking-wide transition-all duration-300 hover:border-white/30 hover:text-white active:scale-95"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              View More
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2.5v9M2.5 7l4.5 4.5L11.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
