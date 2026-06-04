'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaInstagram, FaFacebookF, FaTelegramPlane, FaWhatsapp, FaYelp } from 'react-icons/fa';

const PHONE_DISPLAY = '+1(555) 014-8800';
const PHONE_TEL     = '+15550148800';
const EMAIL         = 'hello@carpowraps.com';
const ADDRESS       = '1234 Sunset Blvd, Los Angeles, CA 90026';
const MAPS_URL      = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ADDRESS)}`;
const SLOGAN        = 'Your car is your autobiography.';

const SERVICE_LINKS = [
  { label: 'Window Tinting',  href: '#contact' },
  { label: 'Vinyl Wrap',      href: '#contact' },
  { label: 'PPF',             href: '#contact' },
  { label: 'Ceramic Coating', href: '#contact' },
  { label: 'Custom Lettering', href: '#contact' },
];
const COMPANY_LINKS = [
  { label: 'Contacts',      href: '#contact' },
  { label: 'Our Work',      href: '#our-work' },
  { label: 'Why Us',        href: '#advantages' },
  { label: 'Get a Quote',   href: '#contact' },
  { label: 'Career',        href: '#', career: true },
];
const LEGAL_LINKS = [
  { label: 'Privacy Policy',     href: '#' },
  { label: 'Warranty',           href: '#' },
  { label: 'Terms & Conditions', href: '#' },
];

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com', icon: <FaInstagram size={17} /> },
  { label: 'Facebook',  href: 'https://facebook.com',  icon: <FaFacebookF size={16} /> },
  { label: 'Telegram',  href: 'https://t.me',          icon: <FaTelegramPlane size={17} /> },
  { label: 'WhatsApp',  href: 'https://wa.me',         icon: <FaWhatsapp size={17} /> },
  { label: 'Yelp',      href: 'https://yelp.com',      icon: <FaYelp size={16} /> },
];

const CopyIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7">
    <rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" strokeLinecap="round" />
  </svg>
);

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 md:border-none">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 md:py-0 md:mb-4 md:cursor-default">
        <span className="text-white/45 text-[0.7rem] tracking-[0.22em] uppercase">{title}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`md:hidden transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          <path d="M2 5l5 5 5-5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ul className={`${open ? 'block' : 'hidden'} md:block pb-4 md:pb-0 space-y-2.5`}>
        {children}
      </ul>
    </div>
  );
}

const linkCls = 'text-white/55 text-sm hover:text-white transition-colors duration-200 inline-block';

export default function Footer() {
  const [copied, setCopied]       = useState<'email' | 'address' | null>(null);
  const [careerOpen, setCareerOpen] = useState(false);
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cSpec, setCSpec] = useState('');
  const [cErr, setCErr] = useState<Record<string, boolean>>({});
  const [cSent, setCSent] = useState(false);

  const copy = (text: string, which: 'email' | 'address') => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(which);
  };
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    if (careerOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [careerOpen]);

  const submitCareer = (e: React.FormEvent) => {
    e.preventDefault();
    const err = { name: cName.trim().length === 0, phone: cPhone.trim().length < 6, spec: cSpec.trim().length === 0 };
    setCErr(err);
    if (Object.values(err).some(Boolean)) return;
    setCSent(true);
  };

  const closeCareer = () => {
    setCareerOpen(false);
    setTimeout(() => { setCSent(false); setCName(''); setCPhone(''); setCSpec(''); setCErr({}); }, 250);
  };

  const fieldStyle = (err?: boolean): React.CSSProperties => ({
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${err ? '#ff5d5d' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: 12, color: '#fff', fontSize: '0.92rem', padding: '11px 14px', outline: 'none',
  });

  return (
    <footer className="relative bg-black border-t border-white/10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 pt-14 md:pt-20 pb-8">

        <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-x-8 gap-y-2 md:gap-y-10">

          <div className="pb-6 md:pb-0">
            <Image src="/logo.svg" alt="CarpoWraps" width={150} height={34} className="h-7 w-auto object-contain mb-5" />
            <p className="text-white font-bold leading-snug mb-7" style={{ fontSize: '1.05rem', maxWidth: 260 }}>{SLOGAN}</p>

            <div className="space-y-3 mb-7">
              <a href={`tel:${PHONE_TEL}`} className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group">
                <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 4h3l1.5 5-2 1.5a12 12 0 0 0 5 5l1.5-2 5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" strokeLinejoin="round"/></svg>
                </span>
                <span className="text-sm font-medium">{PHONE_DISPLAY}</span>
              </a>

              <div className="flex items-center gap-3 text-white/70">
                <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5" strokeLinecap="round"/></svg>
                </span>
                <span className="text-sm">{EMAIL}</span>
                <button onClick={() => copy(EMAIL, 'email')} aria-label="Copy email"
                  className="relative text-white/40 hover:text-white transition-colors">
                  <CopyIcon />
                  {copied === 'email' && <span className="absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap text-xs px-2 py-1 rounded-md" style={{ background: '#fff', color: '#000' }}>Email copied</span>}
                </button>
              </div>

              <div className="flex items-start gap-3 text-white/70">
                <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" strokeLinejoin="round"/><circle cx="12" cy="9" r="2.5"/></svg>
                </span>
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <span className="text-sm leading-snug">{ADDRESS}</span>
                    <button onClick={() => copy(ADDRESS, 'address')} aria-label="Copy address"
                      className="relative text-white/40 hover:text-white transition-colors mt-0.5 shrink-0">
                      <CopyIcon />
                      {copied === 'address' && <span className="absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap text-xs px-2 py-1 rounded-md" style={{ background: '#fff', color: '#000' }}>Address copied</span>}
                    </button>
                  </div>
                  <a href={MAPS_URL} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-white/80 hover:text-white transition-colors">
                    Get Directions
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M7 2.5L11.5 7 7 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white/65 transition-all duration-200 hover:text-black hover:bg-white"
                  style={{ border: '1px solid rgba(255,255,255,0.14)' }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Service">
            {SERVICE_LINKS.map(l => <li key={l.label}><a href={l.href} className={linkCls}>{l.label}</a></li>)}
          </FooterColumn>

          <FooterColumn title="Company">
            {COMPANY_LINKS.map(l => (
              <li key={l.label}>
                {l.career
                  ? <button onClick={() => setCareerOpen(true)} className={linkCls}>{l.label}</button>
                  : <a href={l.href} className={linkCls}>{l.label}</a>}
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Legal">
            {LEGAL_LINKS.map(l => <li key={l.label}><a href={l.href} className={linkCls}>{l.label}</a></li>)}
          </FooterColumn>
        </div>

        <div className="mt-10 md:mt-16 select-none" aria-hidden>
          <div className="leading-[0.8] font-black tracking-tighter text-center"
            style={{
              fontSize: 'clamp(3.2rem, 17vw, 15rem)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.02) 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              whiteSpace: 'nowrap', overflow: 'hidden',
            }}>
            CARPOWRAPS
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-white/35 text-xs tracking-wide">© 2026 Carpo Wraps. All rights reserved.</p>
        </div>
      </div>

      {careerOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
          onClick={closeCareer}>
          <div className="relative w-full max-w-lg rounded-2xl p-6 md:p-8"
            style={{ background: 'linear-gradient(155deg, #161616 0%, #0d0d0d 100%)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 120px rgba(0,0,0,0.8)' }}
            onClick={e => e.stopPropagation()}>

            <button onClick={closeCareer} aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.18)' }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>

            {cSent ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid #fff' }}>
                  <svg width="26" height="26" viewBox="0 0 28 28" fill="none"><path d="M6 14l5 5 11-11" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3 className="text-white text-2xl font-black mb-2">Application sent</h3>
                <p className="text-white/55 text-sm max-w-sm mx-auto">Your application has been sent successfully. We&apos;ll review it and get in touch if you&apos;re a fit. Thank you!</p>
              </div>
            ) : (
              <>
                <p className="text-white/30 text-xs tracking-[0.4em] uppercase mb-1">Join the team</p>
                <h3 className="text-white font-black tracking-tight mb-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.1rem)' }}>Job Application</h3>
                <p className="text-white/55 text-sm mb-6">Want to work with our team? Fill out the form and send your application — we&apos;ll call you back.</p>

                <form onSubmit={submitCareer} noValidate className="space-y-3">
                  <input value={cName} onChange={e => { setCName(e.target.value); setCErr(p => ({ ...p, name: false })); }}
                    placeholder="Enter your name" style={fieldStyle(cErr.name)} />
                  <input value={cPhone} onChange={e => { setCPhone(e.target.value); setCErr(p => ({ ...p, phone: false })); }}
                    placeholder="Enter your phone number" inputMode="tel" style={fieldStyle(cErr.phone)} />
                  <textarea value={cSpec} onChange={e => { setCSpec(e.target.value); setCErr(p => ({ ...p, spec: false })); }}
                    placeholder="Describe your specialization and experience" rows={4}
                    style={{ ...fieldStyle(cErr.spec), resize: 'none' }} />
                  <button type="submit"
                    className="w-full rounded-full font-semibold tracking-wide bg-white text-black hover:bg-white/85 transition-colors duration-200 active:scale-[0.98]"
                    style={{ padding: '13px', fontSize: '0.95rem' }}>
                    Send Application
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
