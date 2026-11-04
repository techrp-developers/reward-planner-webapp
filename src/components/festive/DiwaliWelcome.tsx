// src/components/festive/DiwaliWelcome.tsx
// Full-screen Diwali greeting shown once per login session, after sign-in and before the dashboard.
// It only reads auth state; login, routing and the dashboard are untouched. "Enter Dashboard" simply
// reveals the page the login flow already sent the user to.
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import lanternImg from '../../assets/festive/diwali-lantern.webp';
import './DiwaliWelcome.css';

// Festive window: the overlay retires itself automatically once the season is over.
export const DIWALI_CONFIG = {
  startDate: '2026-10-20',
  endDate: '2026-11-15', // inclusive
  brandLine: 'Celebrate the Festival of Lights with Reward Planners!',
};

const SEEN_KEY = 'rp_diwali_welcome_session';

// A short fingerprint of the access token: a fresh login gets a new token, a refresh or
// navigation keeps the same one, so the greeting appears once per login and never again in it.
const sessionFingerprint = (token: string) => {
  let h = 5381;
  for (let i = 0; i < token.length; i++) h = (h * 33) ^ token.charCodeAt(i);
  return (h >>> 0).toString(36);
};

const isFestiveSeason = (now = new Date()) => {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return today >= DIWALI_CONFIG.startDate && today <= DIWALI_CONFIG.endDate;
};

const readSeen = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY);
  } catch {
    return null;
  }
};

const markSeen = (fingerprint: string) => {
  try {
    sessionStorage.setItem(SEEN_KEY, fingerprint);
  } catch {
    // storage blocked: the overlay simply closes for this page view
  }
};

// ---------- artwork ----------

const RANGOLI_COLORS = ['#F6C75A', '#E8483F', '#D93A7C', '#8665FF', '#2BB3A3', '#FF9F43'];

const Rangoli: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg viewBox="-100 -100 200 200" className={className} style={style} aria-hidden="true">
    {[
      { count: 16, r: 92, rx: 7, ry: 15, color: 0 },
      { count: 12, r: 72, rx: 9, ry: 19, color: 1 },
      { count: 10, r: 52, rx: 8, ry: 16, color: 2 },
      { count: 8, r: 34, rx: 7, ry: 13, color: 3 },
      { count: 8, r: 18, rx: 5, ry: 9, color: 0 },
    ].map((ring, ri) =>
      Array.from({ length: ring.count }, (_, i) => {
        const angle = (360 / ring.count) * i + (ri % 2 ? 360 / ring.count / 2 : 0);
        return (
          <ellipse
            key={`${ri}-${i}`}
            cx="0"
            cy={-ring.r}
            rx={ring.rx}
            ry={ring.ry}
            transform={`rotate(${angle})`}
            fill={RANGOLI_COLORS[(ring.color + i) % RANGOLI_COLORS.length]}
            fillOpacity={0.85}
            stroke="#FFE9A8"
            strokeOpacity={0.55}
            strokeWidth={0.8}
          />
        );
      }),
    )}
    {[86, 62, 42, 25].map((r, i) => (
      <circle key={r} r={r} fill="none" stroke="#FFE29A" strokeOpacity={0.5} strokeWidth={0.8} strokeDasharray={i % 2 ? '2 3' : undefined} />
    ))}
    <circle r={9} fill="#F6C75A" />
    <circle r={4.5} fill="#E8483F" />
  </svg>
);

const Diya: React.FC<{ size: number; delay: number }> = ({ size, delay }) => (
  <span className="dw-diya" style={{ width: size, height: size * 1.15 }} aria-hidden="true">
    <span className="dw-diya-glow" style={{ animationDelay: `${delay}s` }} />
    <svg className="dw-diya-layer dw-diya-flame" viewBox="0 0 100 115" style={{ animationDelay: `${delay}s` }}>
      <defs>
        <linearGradient id="dw-flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFBEA" />
          <stop offset="45%" stopColor="#FFD24A" />
          <stop offset="100%" stopColor="#FF6A1A" />
        </linearGradient>
      </defs>
      <path d="M50 8 C60 26 63 36 58 46 C55 52 45 52 42 46 C37 36 40 26 50 8 Z" fill="url(#dw-flame)" />
      <path d="M50 30 C54 38 54 43 50 47 C46 43 46 38 50 30 Z" fill="#FFFFFF" fillOpacity="0.85" />
    </svg>
    <svg className="dw-diya-layer" viewBox="0 0 100 115">
      <defs>
        <linearGradient id="dw-clay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3A341" />
          <stop offset="55%" stopColor="#C2561B" />
          <stop offset="100%" stopColor="#7A2A0C" />
        </linearGradient>
        <linearGradient id="dw-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#B8862B" />
          <stop offset="50%" stopColor="#FFE9A8" />
          <stop offset="100%" stopColor="#B8862B" />
        </linearGradient>
      </defs>
      <path d="M8 62 C14 92 34 104 50 104 C66 104 86 92 92 62 C76 70 24 70 8 62 Z" fill="url(#dw-clay)" />
      <path d="M8 62 C24 54 76 54 92 62 C76 70 24 70 8 62 Z" fill="#5C1E08" />
      <path d="M8 62 C24 70 76 70 92 62" fill="none" stroke="url(#dw-rim)" strokeWidth="3" />
      <path d="M22 82 Q50 92 78 82" fill="none" stroke="#FFE29A" strokeOpacity="0.7" strokeWidth="2" strokeDasharray="3 4" />
      <circle cx="50" cy="90" r="3" fill="#FFE29A" fillOpacity="0.8" />
    </svg>
  </span>
);

// Hanging kandil (photo cut-out) on a gold cord; `length` is the cord drop above it.
const Lantern: React.FC<{ side: 'left' | 'right'; offset: string; length: number; width: number; delay: number }> = ({ side, offset, length, width, delay }) => (
  <div className="dw-lantern" style={{ [side]: offset, animationDelay: `${delay}s`, width }} aria-hidden="true">
    <span className="dw-lantern-cord" style={{ height: length }} />
    <span className="dw-lantern-glow" />
    <img src={lanternImg} alt="" width={width} height={Math.round(width * 2.36)} className="dw-lantern-img" draggable={false} />
  </div>
);

// Gold gradient text with a compositor-friendly light sweep (see .dw-gold in the CSS)
const GoldText: React.FC<{ children: string }> = ({ children }) => (
  <span className="dw-gold">
    <span className="dw-gold-text">{children}</span>
    <span className="dw-gold-sweep" aria-hidden="true">
      <span className="dw-gold-sweep-text">{children}</span>
    </span>
  </span>
);

const BURSTS = [
  { left: '14%', top: '20%', color: '#FFD36B', delay: 0.4 },
  { left: '84%', top: '24%', color: '#FF7A8A', delay: 1.6 },
  { left: '72%', top: '78%', color: '#B9A4FF', delay: 2.6 },
  { left: '24%', top: '74%', color: '#FFB347', delay: 3.2 },
];

// ---------- component ----------

export const DiwaliWelcome: React.FC = () => {
  const { token, user, loading, termsAccepted } = useAuth() as { token: string | null; user: any; loading: boolean; termsAccepted: boolean };
  const fingerprint = token ? sessionFingerprint(token) : null;
  const [dismissedFor, setDismissedFor] = useState<string | null>(() => readSeen());
  const [leaving, setLeaving] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const open = Boolean(fingerprint && !loading && termsAccepted && isFestiveSeason() && dismissedFor !== fingerprint);

  const firstName = useMemo(() => {
    const raw = String(user?.first_name || user?.name || '').trim();
    const name = raw.split(/\s+/)[0] || '';
    return /^[\p{L}][\p{L}'-]*$/u.test(name) ? name.charAt(0).toUpperCase() + name.slice(1) : '';
  }, [user]);

  // Three depth layers of rising light; values are derived from the index so they stay stable across renders.
  // Only fixed keyframes are animated, so every particle runs on the compositor.
  const particles = useMemo(() => {
    const golds = ['#ffd36b', '#ffe6a3', '#f6c75a', '#ffc98f', '#fff1c9'];
    const drifts = ['dw-particle--drift-l', '', 'dw-particle--drift-r'];
    const layer = (count: number, kind: 'far' | 'ember' | 'bokeh', seed: number) =>
      Array.from({ length: count }, (_, i) => {
        const n = i + seed;
        const pick = (mod: number) => (n * 37 + mod * 11) % mod;
        const base =
          kind === 'far'
            ? { left: `${(n * 41) % 100}%`, s: 2 + pick(2), dur: 22 + pick(10), o: 0.55, sway: 4 + pick(3), c: '#fff1c9', halo: 'rgba(255,225,160,0.5)', glint: false }
            : kind === 'bokeh'
              ? { left: `${(n * 29 + 13) % 100}%`, s: 16 + pick(10), dur: 26 + pick(8), o: 0.38, sway: 7 + pick(3), c: '#ffe6a3', halo: 'rgba(255,190,90,0.3)', glint: false }
              : { left: `${(n * 37) % 100}%`, s: 5 + pick(5), dur: 13 + pick(9), o: 1, sway: 3 + pick(3), c: golds[n % golds.length], halo: 'rgba(255,190,70,0.75)', glint: n % 3 === 0 };
        return {
          ...base,
          kind,
          drift: drifts[n % 3],
          delay: -((n * 2.3) % base.dur),
          pulse: 2 + (n % 4) * 0.6,
          glintDur: 4 + (n % 5),
        };
      });
    return [...layer(16, 'far', 3), ...layer(22, 'ember', 0), ...layer(6, 'bokeh', 7)];
  }, []);

  const sparkles = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({ left: `${(i * 53 + 7) % 100}%`, top: `${(i * 31 + 11) % 100}%`, delay: (i * 0.37) % 2.8, scale: 0.6 + ((i * 3) % 5) / 6 })),
    [],
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = setTimeout(() => buttonRef.current?.focus(), 900);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(focusTimer);
    };
  }, [open]);

  const enter = () => {
    if (!fingerprint || leaving) return;
    markSeen(fingerprint);
    setLeaving(true);
    setTimeout(() => {
      setDismissedFor(fingerprint);
      setLeaving(false);
    }, 620);
  };

  // Layout effect so Esc works from the very first frame the greeting is visible
  useLayoutEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && enter();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!open) return null;

  return (
    <div className={`dw-root ${leaving ? 'dw-leaving' : ''}`} role="dialog" aria-modal="true" aria-labelledby="dw-title" aria-describedby="dw-message">
      <div className="dw-layer" aria-hidden="true">
      <Rangoli className="dw-rangoli-main" />
      <Rangoli className="dw-rangoli-corner" style={{ top: 'calc(min(46vmin, 380px) / -2)', left: 'calc(min(46vmin, 380px) / -2)' }} />
      <Rangoli className="dw-rangoli-corner" style={{ bottom: 'calc(min(46vmin, 380px) / -2)', right: 'calc(min(46vmin, 380px) / -2)' }} />

      <Lantern side="left" offset="6%" length={70} width={64} delay={0} />
      <Lantern side="left" offset="18%" length={30} width={50} delay={1.2} />
      <Lantern side="right" offset="6%" length={90} width={64} delay={0.6} />
      <Lantern side="right" offset="18%" length={40} width={50} delay={1.8} />

      {particles.map((p, i) => (
        <span
          key={i}
          className={`dw-particle ${p.drift} ${p.kind === 'far' ? 'dw-particle--far' : p.kind === 'bokeh' ? 'dw-particle--bokeh' : ''} ${p.glint ? 'dw-particle--glint' : ''}`}
          style={{ left: p.left, width: p.s, height: p.s, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
        >
          <span className="dw-particle-sway" style={{ opacity: p.o, animationDuration: `${p.sway}s`, animationDelay: `${p.delay}s` }}>
            <span
              className="dw-particle-core"
              style={
                {
                  animationDuration: `${p.pulse}s`,
                  animationDelay: `${p.delay}s`,
                  '--s': `${p.s}px`,
                  '--c': p.c,
                  '--halo': p.halo,
                  '--glint': `${p.glintDur}s`,
                  '--glint-delay': `${-(i % 5) * 0.9}s`,
                } as React.CSSProperties
              }
            />
          </span>
        </span>
      ))}
      {sparkles.map((s, i) => (
        <span key={i} className="dw-sparkle" style={{ left: s.left, top: s.top, animationDelay: `${s.delay}s`, transform: `scale(${s.scale})` }} />
      ))}
      {BURSTS.map((b, bi) => (
        <span key={bi} className="dw-burst" style={{ left: b.left, top: b.top }}>
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} className="dw-burst-arm" style={{ transform: `rotate(${(360 / 14) * i}deg)` }}>
              <b style={{ ['--c' as string]: b.color, animationDelay: `${b.delay}s` } as React.CSSProperties} />
            </span>
          ))}
        </span>
      ))}
      </div>

      <section className="dw-card">
        <p className="dw-cinzel dw-reveal text-[11px] tracking-[0.42em] text-[#F6D38A] uppercase sm:text-xs" style={{ animationDelay: '0.45s' }}>
          ✦ Festival of Lights ✦
        </p>

        <h1 id="dw-title" className="dw-serif dw-reveal mt-3 text-[50px] leading-[0.95] font-bold sm:text-[76px] md:text-[88px]" style={{ animationDelay: '0.6s' }}>
          <GoldText>Happy Diwali!</GoldText>
          <span className="ml-2 inline-block align-[0.08em] text-[36px] sm:text-[54px]" aria-hidden="true">
            🪔
          </span>
        </h1>

        {firstName && (
          <p className="dw-serif dw-reveal mt-3 text-xl text-[#FFE9C2] italic sm:text-2xl" style={{ animationDelay: '0.75s' }}>
            Dear {firstName},
          </p>
        )}

        <div className="dw-divider dw-reveal mx-auto mt-5 w-2/3" style={{ animationDelay: '0.85s' }} />

        <div id="dw-message" className="dw-reveal mx-auto mt-5 max-w-[520px] space-y-3" style={{ animationDelay: '0.95s' }}>
          <p className="text-[15px] leading-relaxed text-[#F7E6D0] sm:text-[17px]">
            May this Diwali bring happiness, prosperity, success, and new opportunities into your life.
          </p>
          <p className="text-[15px] leading-relaxed text-[#F7E6D0] sm:text-[17px]">Wishing you and your family a bright and joyful Diwali!</p>
        </div>

        <div className="dw-reveal mt-7 flex items-end justify-center gap-3 sm:gap-6" style={{ animationDelay: '1.05s' }} aria-hidden="true">
          <Diya size={40} delay={0.2} />
          <Diya size={52} delay={0.7} />
          <Diya size={68} delay={0} />
          <Diya size={52} delay={0.5} />
          <Diya size={40} delay={0.9} />
        </div>
        <div className="mx-auto h-1.5 w-[86%] max-w-[420px] rounded-full bg-gradient-to-r from-transparent via-[#E0A63A] to-transparent opacity-80" aria-hidden="true" />

        <p className="dw-serif dw-reveal mt-6 text-2xl leading-snug font-bold sm:text-[30px]" style={{ animationDelay: '1.15s' }}>
          <GoldText>{DIWALI_CONFIG.brandLine}</GoldText>
        </p>

        <div className="dw-reveal mt-7 flex flex-col items-center gap-3" style={{ animationDelay: '1.3s' }}>
          <span className="dw-button-wrap">
            <span className="dw-button-halo" aria-hidden="true" />
            <button ref={buttonRef} type="button" onClick={enter} className="dw-button">
              Enter Dashboard <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
            </button>
          </span>
          <span className="dw-skip hidden sm:inline">Press Esc to continue</span>
        </div>
      </section>
    </div>
  );
};

export default DiwaliWelcome;
