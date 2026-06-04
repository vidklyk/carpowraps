'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SCROLL_HEIGHT } from '@/lib/constants';

const SERVICES = [
  { label: 'Paint Protection', href: '/services/paint-protection' },
  { label: 'Window Tinting',   href: '/services/window-tinting' },
  { label: 'Vinyl Wrap',       href: '/services/vinyl-wrap' },
  { label: 'Ceramic Coating',  href: '/services/ceramic-coating' },
  { label: 'Custom Stickers',  href: '/services/custom-stickers' },
];

type NavLink = { label: string; href: string; dropdown?: { label: string; href: string }[] };

const NAV_LINKS: NavLink[] = [
  { label: 'Our Work', href: '#our-work' },
  { label: 'Services', href: '#services', dropdown: SERVICES },
  { label: 'Car Configurator', href: '#configurator' },
  { label: 'Contact', href: '#contact' },
];

function Logo() {
  return (
    <Link href="/" className="flex-shrink-0">
      <Image
        src="/logo.svg"
        alt="CarWrap Logo"
        width={90}
        height={22}
        className="h-5 w-auto object-contain"
        priority
      />
    </Link>
  );
}

const Chevron = ({ className = '' }: { className?: string }) => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className={className}>
    <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const animEnd = SCROLL_HEIGHT - window.innerHeight;
      setSolid(window.scrollY >= animEnd);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobile = () => { setMenuOpen(false); setSvcOpen(false); };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b"
      style={{
        background: solid ? 'rgba(0,0,0,0.85)' : 'transparent',
        backdropFilter: solid ? 'blur(12px)' : 'none',
        borderColor: solid ? 'rgba(255,255,255,0.08)' : 'transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) =>
            link.dropdown ? (
              <div key={link.href} className="relative group">
                <Link
                  href={link.href}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors duration-200"
                >
                  {link.label}
                  <Chevron className="transition-transform duration-300 group-hover:rotate-180 text-white/50" />
                </Link>

                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 opacity-0 invisible translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
                  <div
                    className="min-w-[220px] rounded-2xl py-2 overflow-hidden"
                    style={{
                      background: 'rgba(10,10,10,0.95)',
                      backdropFilter: 'blur(14px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
                    }}
                  >
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-5 py-2.5 text-sm text-white/65 hover:text-white hover:bg-white/[0.06] transition-colors duration-150"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors duration-200"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="#contact"
            className="hidden md:inline-flex items-center h-9 px-5 rounded-full bg-white text-black text-sm font-semibold tracking-wide hover:bg-white/85 transition-colors duration-200"
          >
            Get a Quote
          </Link>

          <button
            className="md:hidden flex flex-col gap-[5px] min-w-[44px] min-h-[44px] items-center justify-center"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-[2px] bg-white transition-transform duration-300 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block w-6 h-[2px] bg-white transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-[2px] bg-white transition-transform duration-300 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-[560px] border-t border-white/10' : 'max-h-0'
        } bg-black/95 backdrop-blur-md`}
      >
        <nav className="flex flex-col px-6 py-4 gap-1">
          {NAV_LINKS.map((link) =>
            link.dropdown ? (
              <div key={link.href} className="border-b border-white/5">
                <button
                  onClick={() => setSvcOpen((o) => !o)}
                  className="w-full flex items-center justify-between text-white/70 hover:text-white text-base font-medium py-3 transition-colors duration-200"
                >
                  {link.label}
                  <Chevron className={`transition-transform duration-300 text-white/50 ${svcOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`${svcOpen ? 'block' : 'hidden'} pb-2`}>
                  {link.dropdown.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobile}
                      className="block pl-4 py-2.5 text-sm text-white/55 hover:text-white transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="text-white/70 hover:text-white text-base font-medium py-3 border-b border-white/5 transition-colors duration-200"
              >
                {link.label}
              </Link>
            )
          )}
          <Link
            href="#contact"
            onClick={closeMobile}
            className="mt-3 inline-flex items-center justify-center h-11 rounded-full bg-white text-black text-sm font-semibold"
          >
            Get a Quote
          </Link>
        </nav>
      </div>
    </header>
  );
}
