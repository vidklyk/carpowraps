'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const SERVICES = [
  {
    id: 'tint', label: 'Window Tinting',
    icon: <svg viewBox="0 0 28 28" width="26" height="26" fill="none"><circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="1.7"/><path d="M14 2.5v3M14 22.5v3M2.5 14h3M22.5 14h3M5.8 5.8l2.1 2.1M20.1 20.1l2.1 2.1M22.2 5.8l-2.1 2.1M7.9 20.1l-2.1 2.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  },
  {
    id: 'vinyl', label: 'Vinyl Wrap',
    icon: <svg viewBox="0 0 28 28" width="26" height="26" fill="none"><path d="M6 4h12a2 2 0 012 2v10l-6 6H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M20 16l-6 6v-4a2 2 0 012-2h4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  },
  {
    id: 'ppf', label: 'PPF Protection',
    icon: <svg viewBox="0 0 28 28" width="26" height="26" fill="none"><path d="M14 3l9 4v6c0 5.5-3.8 10.6-9 12-5.2-1.4-9-6.5-9-12V7l9-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M10 14l3 3 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    id: 'ceramic', label: 'Ceramic Coating',
    icon: <svg viewBox="0 0 28 28" width="26" height="26" fill="none"><path d="M13 5c3.6 4 5.8 6.9 5.8 10.5a5.8 5.8 0 11-11.6 0C7.2 11.9 9.4 9 13 5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M10.4 15.6a2.6 2.6 0 002.6 2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/><path d="M21 5l.9 1.9 1.9.9-1.9.9L21 11l-.9-1.9-1.9-.9 1.9-.9L21 5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" opacity="0.75"/></svg>,
  },
  {
    id: 'lettering', label: 'Custom Lettering',
    icon: <svg viewBox="0 0 28 28" width="26" height="26" fill="none"><path d="M16.5 5.5l6 6L11 23l-6 .9.9-6L16.5 5.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14.5 7.5l6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  },
];

const ACCENT = '#ffffff';
const GREEN  = '#44ff55';
const ERR    = '#ff5d5d';

function fmtNational(d: string): string {
  const a = d.slice(0, 3), b = d.slice(3, 6), c = d.slice(6, 10);
  let s = '';
  if (d.length > 0)  s += '(' + a;
  if (d.length >= 3) s += ') ';
  if (d.length >= 3) s += b;
  if (d.length >= 6) s += '-' + c;
  return s;
}

const isName  = (v: string) => /^[A-Za-zА-Яа-яЁёЇїІіЄєҐґ' -]+$/.test(v.trim()) && v.trim().length >= 1;
const isEmail = (v: string) => v.includes('@') && v.includes('.');

export default function ContactSection() {
  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [email,   setEmail]   = useState('');
  const [car,     setCar]     = useState('');
  const [image,   setImage]   = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [services, setServices] = useState<string[]>([]);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [done, setDone]     = useState(false);
  const [inView, setInView] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.06 });
    obs.observe(el);
    const t = setTimeout(() => setInView(true), 2500);
    return () => { obs.disconnect(); clearTimeout(t); };
  }, []);

  const ingestImage = useCallback((src: string) => { if (src) setImage(src); }, []);
  useEffect(() => {
    const onOrder = (e: Event) => {
      const src = (e as CustomEvent<string>).detail;
      if (typeof src === 'string') ingestImage(src);
    };
    window.addEventListener('carwrap:order-image', onOrder as EventListener);
    try {
      const stored = sessionStorage.getItem('carwrap:order-image');
      if (stored) { ingestImage(stored); sessionStorage.removeItem('carwrap:order-image'); }
    } catch { /* ignore */ }
    return () => window.removeEventListener('carwrap:order-image', onOrder as EventListener);
  }, [ingestImage]);

  const onPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    if (errors.phone) setErrors(p => ({ ...p, phone: false }));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(f);
  };

  const clearError = (k: string) => { if (errors[k]) setErrors(p => ({ ...p, [k]: false })); };

  const toggleService = (id: string) => {
    setServices(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    if (errors.services) setErrors(p => ({ ...p, services: false }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, boolean> = {
      name:     !isName(name),
      phone:    phone.length !== 10,
      email:    email.length > 0 && !isEmail(email),
      car:      car.trim().length === 0,
      services: services.length === 0,
      consent:  !consent,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setDone(true);
  };

  const labelCls = 'block text-white/45 text-[0.7rem] tracking-[0.18em] uppercase mb-1.5';
  const fieldStyle = (err?: boolean): React.CSSProperties => ({
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${err ? ERR : 'rgba(255,255,255,0.12)'}`,
    borderRadius: 12,
    color: '#fff',
    fontSize: '0.92rem',
    padding: '10px 14px',
    outline: 'none',
    transition: 'border-color 0.2s ease, background 0.2s ease',
  });
  const errText = (msg: string) => <span style={{ color: ERR, fontSize: '0.72rem', display: 'block', marginTop: 4 }}>{msg}</span>;

  const selectedServices = SERVICES.filter(s => services.includes(s.id));

  return (
    <section ref={sectionRef} id="contact"
      className="bg-black min-h-screen flex items-center justify-center py-6 md:py-16 px-4">
      <div className="w-full max-w-2xl"
        style={{ opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(28px)', transition: 'opacity 0.7s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)' }}>

        <div className="text-center mb-4 md:mb-8">
          <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-2 md:mb-3">Get started</p>
          <h2 className="text-white font-black tracking-tight leading-none mb-3 md:mb-4" style={{ fontSize: 'clamp(1.7rem, 5vw, 3.6rem)' }}>
            Request a Quote
          </h2>
          <div className="mx-auto" style={{ width: 48, height: 3, borderRadius: 9999, backgroundColor: GREEN, boxShadow: `0 0 10px ${GREEN}` }} />
        </div>

        {done ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${ACCENT}` }}>
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none"><path d="M6 14l5 5 11-11" stroke={ACCENT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3 className="text-white text-2xl font-black mb-2">Thank you!</h3>
            <p className="text-white/55 text-sm">We&apos;ve received your request and will get back to you shortly.</p>
          </div>
        ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-3 md:space-y-4">

          <div className="grid md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input value={name}
                onChange={e => { setName(e.target.value); clearError('name'); }}
                placeholder="Enter your name"
                style={fieldStyle(errors.name)} />
              {errors.name && errText('Letters only — please enter your name')}
            </div>
            <div>
              <label className={labelCls}>Phone Number *</label>
              <div className="flex items-stretch" style={{ ...fieldStyle(errors.phone), padding: 0, overflow: 'hidden' }}>
                <span className="flex items-center px-3 text-white/55 text-[0.92rem] select-none" style={{ background: 'rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>+1</span>
                <input value={fmtNational(phone)} onChange={onPhone} inputMode="tel"
                  placeholder="Enter your phone number"
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.92rem', padding: '11px 14px' }} />
              </div>
              {errors.phone && errText('Enter a 10-digit phone number')}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className={labelCls}>Email</label>
              <input value={email} type="email"
                onChange={e => { setEmail(e.target.value); clearError('email'); }}
                placeholder="Enter your email"
                style={fieldStyle(errors.email)} />
              {errors.email && errText('Enter a valid email (must contain @ and .)')}
            </div>
            <div>
              <label className={labelCls}>Car (Make, Model, Year) *</label>
              <input value={car}
                onChange={e => { setCar(e.target.value); clearError('car'); }}
                placeholder="Enter your vehicle"
                style={fieldStyle(errors.car)} />
              {errors.car && errText('Please specify your vehicle')}
            </div>
          </div>

          <div>
            <label className={labelCls}>Service *</label>
            <button type="button" onClick={() => setServiceOpen(true)}
              className="w-full flex items-center justify-between text-left"
              style={fieldStyle(errors.services)}>
              <span className={selectedServices.length ? 'text-white' : 'text-white/40'} style={{ fontSize: '0.92rem' }}>
                {selectedServices.length ? selectedServices.map(s => s.label).join(', ') : 'Choose services'}
              </span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginLeft: 8 }}><path d="M2 5l5 5 5-5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {errors.services && errText('Select at least one service')}
          </div>

          <div className="space-y-3 md:space-y-4">
            <div>
              <label className={labelCls}>Upload an Example</label>
              {image ? (
                <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="example" className="w-full object-cover" style={{ height: 78 }} />
                  <button type="button" onClick={() => { setImage(null); if (fileRef.current) fileRef.current.value = ''; }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.25)' }} aria-label="Remove image">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-1.5 text-white/45 hover:text-white/70 transition-colors"
                  style={{ ...fieldStyle(false), height: 78, borderStyle: 'dashed', cursor: 'pointer' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 16V4m0 0L7 9m5-5l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  <span className="text-xs">Click to upload</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <span onClick={() => { setConsent(c => !c); clearError('consent'); }}
                  className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-0.5 transition-all"
                  style={{ background: consent ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.04)', border: `1px solid ${errors.consent ? ERR : consent ? ACCENT : 'rgba(255,255,255,0.2)'}` }}>
                  {consent && <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 4" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </span>
                <span className="text-white/55 text-xs leading-relaxed" onClick={() => { setConsent(c => !c); clearError('consent'); }}>
                  By submitting the form you agree to the{' '}
                  <a href="#" onClick={e => e.stopPropagation()} className="underline hover:text-white" style={{ color: ACCENT }}>terms</a>.
                </span>
              </label>
            </div>
          </div>

          <button type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide bg-white text-black hover:bg-white/85 transition-colors duration-200 active:scale-[0.98]"
            style={{ padding: '14px', boxShadow: '0 8px 30px rgba(0,0,0,0.4)', fontSize: '0.95rem' }}>
            Calculate
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M7 2.5L11.5 7 7 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </form>
        )}
      </div>

      {serviceOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
          onClick={() => setServiceOpen(false)}>
          <div className="relative w-full max-w-2xl rounded-2xl p-6 md:p-8"
            style={{ background: 'linear-gradient(155deg, #161616 0%, #0d0d0d 100%)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 120px rgba(0,0,0,0.8)' }}
            onClick={e => e.stopPropagation()}>

            <button onClick={() => setServiceOpen(false)} aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.18)' }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>

            <p className="text-white/30 text-xs tracking-[0.4em] uppercase mb-1">Select what you need</p>
            <h3 className="text-white font-black tracking-tight mb-5" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)' }}>Services</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SERVICES.map((s, i) => {
                const on = services.includes(s.id);
                const span = i === 0 ? 'col-span-2 md:col-span-2' : '';
                return (
                  <button key={s.id} type="button" onClick={() => toggleService(s.id)}
                    className={`${span} relative flex flex-col justify-between rounded-xl p-4 text-left transition-all duration-200 active:scale-[0.98]`}
                    style={{
                      minHeight: 104,
                      background: on ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${on ? ACCENT : 'rgba(255,255,255,0.1)'}`,
                      color: on ? ACCENT : 'rgba(255,255,255,0.85)',
                    }}>
                    <span style={{ color: on ? ACCENT : 'rgba(255,255,255,0.7)' }}>{s.icon}</span>
                    <span className="font-semibold mt-3" style={{ fontSize: '0.95rem', color: '#fff' }}>{s.label}</span>
                    {on && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: ACCENT }}>
                        <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 4" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button type="button" onClick={() => setServiceOpen(false)}
              className="w-full mt-6 rounded-full font-semibold tracking-wide bg-white text-black hover:bg-white/85 transition-colors duration-200 active:scale-[0.98]"
              style={{ padding: '13px', fontSize: '0.95rem' }}>
              Done{services.length ? ` (${services.length})` : ''}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
