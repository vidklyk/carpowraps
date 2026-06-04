'use client';

import { useState, useEffect } from 'react';

interface Prefs {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const DEFAULT_PREFS: Prefs = { analytics: false, marketing: false, functional: false };

export default function CookieConsent() {
  const [visible, setVisible]   = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs]       = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) setVisible(true);
  }, []);

  const save = (accepted: Prefs) => {
    localStorage.setItem('cookie_consent', JSON.stringify(accepted));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none"
      style={{ padding: '0 0 max(24px, env(safe-area-inset-bottom))' }}>
      <div className="pointer-events-auto w-full max-w-xl mx-4 rounded-2xl border border-white/10 overflow-hidden"
        style={{ background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)' }}>

        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
              style={{ backgroundColor: 'rgba(68,255,85,0.12)', border: '1px solid rgba(68,255,85,0.3)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#44ff55" strokeWidth="1.4"/>
                <path d="M7 4v3.5M7 9.5v.5" stroke="#44ff55" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-1">We use cookies</p>
              <p className="text-white/50 text-xs leading-relaxed">
                This site uses cookies to enhance your experience, analyse traffic and personalise content. You can customise your preferences below.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => save({ analytics: true, marketing: true, functional: true })}
              className="flex-1 h-10 rounded-full bg-white text-black text-sm font-semibold tracking-wide transition-all duration-200 hover:bg-white/85 active:scale-95">
              Accept All
            </button>
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex-1 h-10 rounded-full border text-white/80 text-sm font-medium tracking-wide transition-all duration-200 hover:border-white/30 hover:text-white active:scale-95"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              Configure
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateRows: expanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <div style={{ overflow: 'hidden' }}>
            <div className="px-6 pb-5 border-t border-white/8 pt-5">

              <p className="text-white/40 text-xs leading-relaxed mb-5">
                Choose which cookie categories you allow. Essential cookies are required for the site to function and cannot be disabled.
              </p>

              <div className="flex flex-col gap-4 mb-5">
                <Toggle
                  label="Essential"
                  desc="Required for the site to function. Always active."
                  checked={true}
                  disabled
                  onChange={() => {}}
                />
                <Toggle
                  label="Analytics"
                  desc="Help us understand how visitors interact with the site."
                  checked={prefs.analytics}
                  onChange={v => setPrefs(p => ({ ...p, analytics: v }))}
                />
                <Toggle
                  label="Marketing"
                  desc="Used to deliver relevant ads and retargeting campaigns."
                  checked={prefs.marketing}
                  onChange={v => setPrefs(p => ({ ...p, marketing: v }))}
                />
                <Toggle
                  label="Functional"
                  desc="Remember your preferences to improve your experience."
                  checked={prefs.functional}
                  onChange={v => setPrefs(p => ({ ...p, functional: v }))}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => save(prefs)}
                  className="flex-1 h-10 rounded-full bg-white text-black text-sm font-semibold tracking-wide transition-all duration-200 hover:bg-white/85 active:scale-95">
                  Accept Selected
                </button>
                <button
                  onClick={() => save(DEFAULT_PREFS)}
                  className="flex-1 h-10 rounded-full border text-white/80 text-sm font-medium tracking-wide transition-all duration-200 hover:border-white/30 hover:text-white active:scale-95"
                  style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                  Essential Only
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function Toggle({ label, desc, checked, disabled, onChange }: {
  label: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-white/85 text-sm font-medium mb-0.5">{label}</p>
        <p className="text-white/35 text-xs leading-snug">{desc}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className="shrink-0 relative flex items-center justify-center w-12 h-10 rounded-full transition-all duration-300 focus:outline-none -mr-1"
        style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
        <span className="relative w-10 h-6 rounded-full flex items-center transition-all duration-300"
          style={{
            backgroundColor: checked ? '#44ff55' : 'rgba(255,255,255,0.12)',
            boxShadow: checked ? '0 0 10px rgba(68,255,85,0.4)' : 'none',
          }}>
          <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300"
            style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }} />
        </span>
      </button>
    </div>
  );
}
