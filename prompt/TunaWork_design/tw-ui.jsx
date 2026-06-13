// tw-ui.jsx — TunaWork shared atoms, icons, furigana helpers
// Exports to window. Loaded after React + Babel, before screens.

// ── Furigana ruby helper ───────────────────────────────────
// <R k="仕事" y="しごと" /> renders ruby; furigana hidden via CSS when off.
function R({ k, y }) {
  return (
    <ruby>{k}<rt>{y}</rt></ruby>
  );
}

// ── Money ──────────────────────────────────────────────────
function Yen({ amount, unit, size = 28 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, fontFamily: 'var(--tw-num)', fontWeight: 800, color: 'var(--tw-ink)' }}>
      <span style={{ fontSize: size * 0.62, fontWeight: 700, transform: 'translateY(-1px)' }}>¥</span>
      <span style={{ fontSize: size, lineHeight: 1, letterSpacing: -0.5 }}>{amount.toLocaleString()}</span>
      {unit && <span style={{ fontSize: size * 0.42, fontWeight: 600, color: 'var(--tw-muted)', marginLeft: 1 }}>{unit}</span>}
    </span>
  );
}

// ── Star rating ────────────────────────────────────────────
function Star({ filled, half, size = 18, onClick, color }) {
  const c = color || 'var(--tw-yellow)';
  const id = React.useMemo(() => 'half' + Math.random().toString(36).slice(2, 7), []);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', flexShrink: 0 }}>
      {half && (
        <defs>
          <linearGradient id={id}>
            <stop offset="50%" stopColor={c} />
            <stop offset="50%" stopColor="rgba(23,59,55,0.13)" />
          </linearGradient>
        </defs>
      )}
      <path d="M12 2.6l2.7 5.9 6.4.7-4.8 4.3 1.3 6.3L12 17.3 6.4 19.8l1.3-6.3L2.9 9.2l6.4-.7L12 2.6z"
        fill={half ? `url(#${id})` : (filled ? c : 'rgba(23,59,55,0.13)')} />
    </svg>
  );
}

function Stars({ value, size = 18, gap = 1 }) {
  return (
    <span style={{ display: 'inline-flex', gap, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size}
          filled={value >= i}
          half={value < i && value > i - 1} />
      ))}
    </span>
  );
}

function RatingPill({ value, count, size = 14 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--tw-num)' }}>
      <Star filled size={size} />
      <span style={{ fontWeight: 800, fontSize: size, color: 'var(--tw-ink)' }}>{value.toFixed(1)}</span>
      {count != null && <span style={{ fontSize: size - 2, color: 'var(--tw-muted)', fontWeight: 600 }}>({count})</span>}
    </span>
  );
}

// ── Tag chip ───────────────────────────────────────────────
function Tag({ children, tone = 'soft' }) {
  const tones = {
    soft: { bg: 'var(--tw-primary-soft)', fg: 'var(--tw-primary-dark)' },
    coral: { bg: 'var(--tw-coral-soft)', fg: '#C2452A' },
    sun: { bg: '#FFF1CE', fg: '#9A6B00' },
    plain: { bg: 'rgba(23,59,55,0.06)', fg: 'var(--tw-muted)' },
  };
  const t = tones[tone] || tones.soft;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: t.bg, color: t.fg, borderRadius: 999,
      padding: '4px 10px', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

// ── Striped image placeholder ──────────────────────────────
function Placeholder({ label, h = 150, r = 18, tone }) {
  const hue = tone || 'var(--tw-primary)';
  return (
    <div style={{
      height: h, borderRadius: r, position: 'relative', overflow: 'hidden',
      background: `repeating-linear-gradient(135deg, color-mix(in oklab, ${hue} 12%, #fff) 0 10px, color-mix(in oklab, ${hue} 7%, #fff) 10px 20px)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid var(--tw-line)',
    }}>
      <span style={{
        fontFamily: 'var(--tw-mono)', fontSize: 11, letterSpacing: 0.5,
        color: 'color-mix(in oklab, ' + hue + ' 60%, #555)', textTransform: 'uppercase',
        background: 'rgba(255,255,255,0.7)', padding: '3px 8px', borderRadius: 6,
      }}>{label}</span>
    </div>
  );
}

// ── Avatar (initial in colored circle) ─────────────────────
function Avatar({ name, size = 44, tone = 'var(--tw-primary)', emoji }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: emoji ? '#fff' : `color-mix(in oklab, ${tone} 22%, #fff)`,
      border: '1.5px solid color-mix(in oklab, ' + tone + ' 35%, #fff)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.42, color: tone,
      fontFamily: 'var(--tw-num)', overflow: 'hidden',
    }}>{emoji || (name ? name[0] : '?')}</div>
  );
}

// ── Section header ─────────────────────────────────────────
function SectionHead({ children, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 0 11px' }}>
      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--tw-ink)', letterSpacing: -0.2 }}>{children}</h3>
      {action && <button onClick={onAction} style={{
        border: 'none', background: 'none', color: 'var(--tw-primary-dark)',
        fontWeight: 700, fontSize: 13.5, cursor: 'pointer', padding: 0, fontFamily: 'inherit',
      }}>{action}</button>}
    </div>
  );
}

// ── Primary / soft buttons ─────────────────────────────────
function Btn({ children, onClick, kind = 'primary', full, disabled, size = 'lg' }) {
  const pads = size === 'lg' ? '15px 22px' : '10px 16px';
  const fs = size === 'lg' ? 16.5 : 14;
  const kinds = {
    primary: { background: 'var(--tw-primary)', color: '#fff', boxShadow: '0 6px 16px -6px color-mix(in oklab, var(--tw-primary) 70%, #000)' },
    coral: { background: 'var(--tw-coral)', color: '#fff', boxShadow: '0 6px 16px -6px color-mix(in oklab, var(--tw-coral) 70%, #000)' },
    soft: { background: 'var(--tw-primary-soft)', color: 'var(--tw-primary-dark)' },
    ghost: { background: 'transparent', color: 'var(--tw-ink)', boxShadow: 'inset 0 0 0 1.5px var(--tw-line)' },
  };
  const k = kinds[disabled ? 'soft' : kind] || kinds.primary;
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      border: 'none', borderRadius: 16, padding: pads, fontSize: fs, fontWeight: 800,
      fontFamily: 'inherit', cursor: disabled ? 'default' : 'pointer',
      width: full ? '100%' : undefined, opacity: disabled ? 0.55 : 1,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      whiteSpace: 'nowrap', transition: 'transform .12s ease', ...k,
    }}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.97)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >{children}</button>
  );
}

// ── Card ───────────────────────────────────────────────────
function Card({ children, onClick, style = {}, pad = 14 }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--tw-card)', borderRadius: 22, padding: pad,
      boxShadow: '0 1px 2px rgba(23,59,55,0.04), 0 8px 22px -16px rgba(23,59,55,0.3)',
      border: '1px solid var(--tw-line)', cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>{children}</div>
  );
}

// ── Icons (simple line set) ────────────────────────────────
const Ic = {
  search: (p) => <svg width={p.s||24} height={p.s||24} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={p.c} strokeWidth={p.w||2}/><path d="M20 20l-3.2-3.2" stroke={p.c} strokeWidth={p.w||2} strokeLinecap="round"/></svg>,
  brief: (p) => <svg width={p.s||24} height={p.s||24} viewBox="0 0 24 24" fill="none"><rect x="3" y="7.5" width="18" height="12.5" rx="3" stroke={p.c} strokeWidth={p.w||2}/><path d="M8.5 7.5V6a2.5 2.5 0 012.5-2.5h2A2.5 2.5 0 0115.5 6v1.5" stroke={p.c} strokeWidth={p.w||2} strokeLinecap="round"/><path d="M3 12.5h18" stroke={p.c} strokeWidth={p.w||2}/></svg>,
  book: (p) => <svg width={p.s||24} height={p.s||24} viewBox="0 0 24 24" fill="none"><path d="M4 5.5A2.5 2.5 0 016.5 3H12v16H6.5A2.5 2.5 0 004 21.5V5.5z" stroke={p.c} strokeWidth={p.w||2} strokeLinejoin="round"/><path d="M20 5.5A2.5 2.5 0 0017.5 3H12v16h5.5A2.5 2.5 0 0120 21.5V5.5z" stroke={p.c} strokeWidth={p.w||2} strokeLinejoin="round"/></svg>,
  doc: (p) => <svg width={p.s||24} height={p.s||24} viewBox="0 0 24 24" fill="none"><path d="M6 3.5h7l5 5V20a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 20V5A1.5 1.5 0 016 3.5z" stroke={p.c} strokeWidth={p.w||2} strokeLinejoin="round"/><path d="M13 3.5V8.5h5" stroke={p.c} strokeWidth={p.w||2} strokeLinejoin="round"/><path d="M9 13h6M9 16.5h6" stroke={p.c} strokeWidth={p.w||2} strokeLinecap="round"/></svg>,
  user: (p) => <svg width={p.s||24} height={p.s||24} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8.5" r="3.8" stroke={p.c} strokeWidth={p.w||2}/><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" stroke={p.c} strokeWidth={p.w||2} strokeLinecap="round"/></svg>,
  pin: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none"><path d="M12 21c4-4.5 6.5-7.8 6.5-11A6.5 6.5 0 005.5 10c0 3.2 2.5 6.5 6.5 11z" stroke={p.c} strokeWidth={p.w||2} strokeLinejoin="round"/><circle cx="12" cy="10" r="2.3" fill={p.c}/></svg>,
  clock: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke={p.c} strokeWidth={p.w||2}/><path d="M12 7.5V12l3 2" stroke={p.c} strokeWidth={p.w||2} strokeLinecap="round" strokeLinejoin="round"/></svg>,
  cal: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none"><rect x="4" y="5.5" width="16" height="15" rx="3" stroke={p.c} strokeWidth={p.w||2}/><path d="M4 10h16M8.5 3.5v3.5M15.5 3.5v3.5" stroke={p.c} strokeWidth={p.w||2} strokeLinecap="round"/></svg>,
  check: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.2 4.2L19 7" stroke={p.c} strokeWidth={p.w||2.4} strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevR: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke={p.c} strokeWidth={p.w||2.2} strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevL: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke={p.c} strokeWidth={p.w||2.2} strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke={p.c} strokeWidth={p.w||2.2} strokeLinecap="round"/></svg>,
  bell: (p) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none"><path d="M6 16V10a6 6 0 1112 0v6l1.5 2.2H4.5L6 16z" stroke={p.c} strokeWidth={p.w||2} strokeLinejoin="round"/><path d="M10 19.5a2 2 0 004 0" stroke={p.c} strokeWidth={p.w||2}/></svg>,
  globe: (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke={p.c} strokeWidth={p.w||2}/><path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17" stroke={p.c} strokeWidth={p.w||1.6}/></svg>,
  chat: (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none"><path d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7A2.5 2.5 0 0117.5 16H9l-4 3.5V16H6.5A2.5 2.5 0 014 13.5v-7z" stroke={p.c} strokeWidth={p.w||2} strokeLinejoin="round"/></svg>,
  spark: (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z" fill={p.c}/></svg>,
  shield: (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none"><path d="M12 3l7 2.5v6c0 4.2-3 7.4-7 9-4-1.6-7-4.8-7-9v-6L12 3z" stroke={p.c} strokeWidth={p.w||2} strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke={p.c} strokeWidth={p.w||2} strokeLinecap="round" strokeLinejoin="round"/></svg>,
  play: (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none"><path d="M8 5.5l11 6.5-11 6.5v-13z" fill={p.c}/></svg>,
  flame: (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none"><path d="M12 3c.5 3-2.5 4-2.5 7.5A2.5 2.5 0 0012 13a2.5 2.5 0 002.5-2.5C14.5 12 16 12.5 16 15a4 4 0 11-8 0c0-4.5 4-6 4-12z" fill={p.c}/></svg>,
  dl: (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none"><path d="M12 4v10m0 0l-3.5-3.5M12 14l3.5-3.5" stroke={p.c} strokeWidth={p.w||2} strokeLinecap="round" strokeLinejoin="round"/><path d="M5 18.5h14" stroke={p.c} strokeWidth={p.w||2} strokeLinecap="round"/></svg>,
  support: (p) => <svg width={p.s||24} height={p.s||24} viewBox="0 0 24 24" fill="none"><path d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7A2.5 2.5 0 0117.5 16H9l-4 3.5V16H6.5A2.5 2.5 0 014 13.5v-7z" stroke={p.c} strokeWidth={p.w||2} strokeLinejoin="round"/><path d="M12 12.6c-1.5-1.1-2.6-1.8-2.6-2.8 0-.8.6-1.3 1.3-1.3.5 0 .9.2 1.3.7.4-.5.8-.7 1.3-.7.7 0 1.3.5 1.3 1.3 0 1-1.1 1.7-2.6 2.8z" fill={p.c}/></svg>,
  bot: (p) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="16" height="11" rx="4" stroke={p.c} strokeWidth={p.w||2}/><circle cx="9.5" cy="13.5" r="1.4" fill={p.c}/><circle cx="14.5" cy="13.5" r="1.4" fill={p.c}/><path d="M12 8V4.8M12 4.5a1.3 1.3 0 100-.1z" stroke={p.c} strokeWidth={p.w||2} strokeLinecap="round"/><circle cx="12" cy="4" r="1.4" fill={p.c}/></svg>,
  send: (p) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none"><path d="M4 11.5L20 4l-7 16-2.2-6.3L4 11.5z" fill={p.c}/></svg>,
  lock: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none"><rect x="5" y="10.5" width="14" height="9.5" rx="2.5" stroke={p.c} strokeWidth={p.w||2}/><path d="M8 10.5V8a4 4 0 018 0v2.5" stroke={p.c} strokeWidth={p.w||2}/></svg>,
  phone: (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none"><path d="M6 3.5h3l1.5 4-2 1.5a11 11 0 005 5l1.5-2 4 1.5v3a2 2 0 01-2 2C10.6 22 2 13.4 2 5.5a2 2 0 012-2z" stroke={p.c} strokeWidth={p.w||2} strokeLinejoin="round"/></svg>,
  heartHand: (p) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none"><path d="M12 9.2c-1.8-1.7-3.6-2-4.6-1-1 1-.7 2.6 1 4.3L12 16l3.6-3.5c1.7-1.7 2-3.3 1-4.3-1-1-2.8-.7-4.6 1z" fill={p.c}/></svg>,
};

Object.assign(window, {
  R, Yen, Star, Stars, RatingPill, Tag, Placeholder, Avatar, SectionHead, Btn, Card, Ic,
});
