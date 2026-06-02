import React, { useEffect, useRef, useState } from 'react';
import { IOSStatusBar } from './ios-frame.jsx';
import symbolMark from './symbolmark_traditional_01.png';

// screens.jsx — 9 screens for the attendance prototype
// Student: S1 Login, S2 Class Select, S3 Auto-Attend, S4 Success, S5 Fail
// Professor: P1 Lecture Select, P2 In-Progress, P3 Overview, P4 Late Filter

// ─── Tokens ────────────────────────────────────────────────────────────────
// Two point colors: #004386 (deep blue) and #A6165F (deep berry).
// Buttons → blue. Status: blue/positive, berry/danger, muted neutral for warn.
const T = {
  brand: '#004386',
  brandDeep: '#002d5c',
  brandHi: '#3a6aa0',
  brandSoft: '#eaf1f8',
  brandTint: '#cfdce8',
  accent: '#A6165F',
  accentDeep: '#73104a',
  accentHi: '#c4517f',
  accentSoft: '#f8e8ef',
  accentTint: '#ecccdb',
  // Status: ok = blue family, danger = berry family, warn = neutral warm-gray
  ok: '#004386',
  okSoft: '#eaf1f8',
  okDeep: '#002d5c',
  warn: '#7a6a4a',
  warnSoft: '#f4f0e8',
  warnDeep: '#4d4232',
  danger: '#A6165F',
  dangerSoft: '#f8e8ef',
  dangerDeep: '#73104a',
  ink: 'oklch(0.22 0.04 255)',
  ink2: 'oklch(0.38 0.02 255)',
  mute: 'oklch(0.55 0.012 255)',
  faint: 'oklch(0.72 0.008 255)',
  line: 'oklch(0.92 0.004 255)',
  line2: 'oklch(0.96 0.003 255)',
  surf: '#ffffff',
  surf2: '#ffffff',
  surf3: 'oklch(0.975 0.003 255)',
  bg: '#ffffff',
  font: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo", sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
};

// ─── Character face (simple, soft features) ────────────────────────────────
// mood: 'happy' (success) | 'sad' (fail) | 'idle' (neutral)
function Face({ size = 100, mood = 'happy', fg = '#fff', opacity = 0.92, faceBg, ring }) {
  const s = size;
  const eyeR = s * 0.025;
  const eyeY = s * 0.42;
  const eyeXL = s * 0.36;
  const eyeXR = s * 0.64;
  const stroke = Math.max(2.2, s * 0.028);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: 'block' }}>
      {faceBg && <circle cx="50" cy="50" r="50" fill={faceBg}/>}
      {ring && <circle cx="50" cy="50" r="49.2" fill="none" stroke={ring} strokeWidth="1.2"/>}
      {/* eyes — soft dots, slightly lifted */}
      {mood === 'happy' && (
        <g fill={fg} opacity={opacity}>
          <circle cx="36" cy="42" r="2.6"/>
          <circle cx="64" cy="42" r="2.6"/>
        </g>
      )}
      {mood === 'sad' && (
        <g fill={fg} opacity={opacity}>
          <circle cx="36" cy="42" r="2.6"/>
          <circle cx="64" cy="42" r="2.6"/>
        </g>
      )}
      {mood === 'idle' && (
        <g fill={fg} opacity={opacity}>
          <circle cx="36" cy="44" r="2.2"/>
          <circle cx="64" cy="44" r="2.2"/>
        </g>
      )}
      {/* mouth */}
      {mood === 'happy' && (
        <path d="M40 58 Q50 67 60 58" stroke={fg} strokeWidth={stroke}
              strokeLinecap="round" fill="none" opacity={opacity}/>
      )}
      {mood === 'sad' && (
        <path d="M42 64 Q50 58 58 64" stroke={fg} strokeWidth={stroke}
              strokeLinecap="round" fill="none" opacity={opacity}/>
      )}
      {mood === 'idle' && (
        <path d="M44 60 L56 60" stroke={fg} strokeWidth={stroke}
              strokeLinecap="round" fill="none" opacity={opacity * 0.7}/>
      )}
      {/* cheeks (very subtle) */}
      {mood === 'happy' && (
        <g opacity="0.28">
          <circle cx="28" cy="55" r="3.6" fill={fg}/>
          <circle cx="72" cy="55" r="3.6" fill={fg}/>
        </g>
      )}
    </svg>
  );
}

// ─── Tiny stroke icons (simple, semantic) ──────────────────────────────────
const Icon = {
  bt: (c = 'currentColor', s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7l10 10-5 5V2l5 5L7 17"/>
    </svg>
  ),
  pin: (c = 'currentColor', s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  wifi: (c = 'currentColor', s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a16 16 0 0 1 20 0"/>
      <path d="M5 12.5a12 12 0 0 1 14 0"/>
      <path d="M8.5 16a7 7 0 0 1 7 0"/>
      <circle cx="12" cy="19" r="1" fill={c}/>
    </svg>
  ),
  chev: (c = 'currentColor', s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6"/>
    </svg>
  ),
  check: (c = 'currentColor', s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7"/>
    </svg>
  ),
  x: (c = 'currentColor', s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6L6 18"/>
    </svg>
  ),
  qr: (c = 'currentColor', s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <path d="M14 14h3v3h-3zM18 18h3M14 21h3" strokeLinecap="round"/>
    </svg>
  ),
  keypad: (c = 'currentColor', s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6">
      <circle cx="6" cy="6" r="1.4"/><circle cx="12" cy="6" r="1.4"/><circle cx="18" cy="6" r="1.4"/>
      <circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>
      <circle cx="6" cy="18" r="1.4"/><circle cx="12" cy="18" r="1.4"/><circle cx="18" cy="18" r="1.4"/>
    </svg>
  ),
  refresh: (c = 'currentColor', s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/>
      <path d="M3 21v-5h5"/>
    </svg>
  ),
  globe: (c = 'currentColor', s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7">
      <circle cx="12" cy="12" r="9"/>
      <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/>
    </svg>
  ),
  filter: (c = 'currentColor', s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16l-6 8v6l-4-2v-4L4 5z"/>
    </svg>
  ),
  more: (c = 'currentColor', s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>
    </svg>
  ),
  edit: (c = 'currentColor', s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M14 6l4 4"/>
    </svg>
  ),
  flag: (c = 'currentColor', s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 21V4M5 4h12l-2 4 2 4H5"/>
    </svg>
  ),
};

// ─── Frame: light background canvas ────────────────────────────────────────
function Phone({ children, time = '오후 1:42', dark = false, statusBg }) {
  return (
    <div style={{
      width: 402, height: 874, position: 'relative',
      background: statusBg || (dark ? T.ink : T.bg),
      color: dark ? '#fff' : T.ink,
      fontFamily: T.font, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <IOSStatusBar time={time} dark={dark} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      <div style={{
        height: 34, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        paddingBottom: 8, flexShrink: 0,
      }}>
        <div style={{ width: 134, height: 5, borderRadius: 100, background: dark ? '#fff' : T.ink }}/>
      </div>
    </div>
  );
}

// ─── Reusable bits ─────────────────────────────────────────────────────────
function LangToggle() {
  const [lang, setLang] = useState('KO');
  return (
    <button onClick={() => setLang(lang === 'KO' ? 'EN' : 'KO')} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      height: 36, padding: '0 11px', borderRadius: 999,
      background: T.surf, border: `1px solid ${T.line}`,
      fontFamily: T.font, fontSize: 11.5, fontWeight: 700, color: T.ink2,
      letterSpacing: '.04em', cursor: 'pointer',
    }} title="언어 변경 / Change language">
      {Icon.globe(T.ink2, 14)}
      <span>{lang}</span>
    </button>
  );
}

function Header({ title, sub, right, back, onBack }) {
  return (
    <div style={{
      padding: '8px 20px 16px', display: 'flex', alignItems: 'center', gap: 8,
      flexShrink: 0,
    }}>
      {back && (
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 18, border: 'none', background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          marginLeft: -8,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {sub && <div style={{ fontSize: 12, color: T.mute, fontWeight: 500, letterSpacing: '.02em', marginBottom: 2 }}>{sub}</div>}
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: T.ink }}>{title}</div>
      </div>
      <LangToggle/>
      {right}
    </div>
  );
}

function Pill({ tone = 'mute', children, dot, style = {} }) {
  const tones = {
    mute: { bg: T.surf3, fg: T.ink2 },
    brand: { bg: T.brandSoft, fg: T.brandDeep },
    ok: { bg: T.okSoft, fg: T.okDeep },
    warn: { bg: T.warnSoft, fg: T.warnDeep },
    danger: { bg: T.dangerSoft, fg: T.dangerDeep },
    ink: { bg: T.ink, fg: '#fff' },
  };
  const t = tones[tone] || tones.mute;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
      background: t.bg, color: t.fg, letterSpacing: '-0.005em', ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: t.fg, opacity: 0.85 }}/>}
      {children}
    </span>
  );
}

function Card({ children, style = {}, onClick, active }) {
  return (
    <div onClick={onClick} style={{
      background: T.surf, borderRadius: 16,
      border: `1px solid ${active ? T.brand : T.line}`,
      boxShadow: active ? `0 0 0 3px ${T.brandTint}` : '0 1px 0 rgba(20,20,40,0.02)',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STUDENT 1 · LOGIN
// ═══════════════════════════════════════════════════════════════════════════
function S1Login({ onLogin }) {
  const [keep, setKeep] = useState(true);
  const [id, setId] = useState('20211045');
  const [pw, setPw] = useState('••••••••');
  const [lang, setLang] = useState('Ko');
  return (
    <Phone>
      <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setLang(lang === 'Ko' ? 'English' : 'Ko')} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: T.surf, border: `1px solid ${T.line}`, borderRadius: 999,
          padding: '6px 12px', fontSize: 12, fontWeight: 600, color: T.ink2,
          fontFamily: T.font, cursor: 'pointer',
        }}>
          {Icon.globe(T.ink2, 14)} {lang}
        </button>
      </div>
      <div style={{ flex: 1, padding: '28px 28px 24px', display: 'flex', flexDirection: 'column' }}>
        {/* Logo mark */}
        <div style={{ marginTop: 36, marginBottom: 44 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 18, border: `1px solid ${T.line}`, overflow: 'hidden',
            boxShadow: '0 10px 24px rgba(0,67,134,0.10)',
          }}>
            <img src={symbolMark} alt="서비스 로고" style={{ width: 42, height: 42, objectFit: 'contain' }} />
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            안녕하세요,<br/>학교 포털로 로그인하세요
          </div>
          <div style={{ fontSize: 14, color: T.mute, marginTop: 10 }}>
            자동출석 · 위치 · 블루투스로 빠르게
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="학번" value={id} setValue={setId} />
          <Field label="비밀번호" value={pw} setValue={setPw} type="password" />
        </div>

        <label style={{
          marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 4px', cursor: 'pointer',
        }}>
          <span style={{ fontSize: 14, color: T.ink2, fontWeight: 500 }}>자동 로그인</span>
          <Toggle on={keep} setOn={setKeep} />
        </label>

        <div style={{ flex: 1 }}/>

        <button onClick={onLogin} style={{
          height: 54, borderRadius: 14, border: 'none', cursor: 'pointer',
          background: T.brand, color: '#fff', fontSize: 16, fontWeight: 600,
          fontFamily: T.font, letterSpacing: '-0.01em', marginBottom: 12,
        }}>로그인</button>
        <div style={{ fontSize: 12.5, color: T.mute, textAlign: 'center' }}>
          비밀번호 찾기 · 학교 인증 도움말
        </div>
      </div>
    </Phone>
  );
}

function Field({ label, value, setValue, type }) {
  const [focus, setFocus] = useState(false);
  return (
    <label style={{
      display: 'block', padding: '10px 16px 12px', borderRadius: 12,
      background: T.surf, border: `1.5px solid ${focus ? T.ink : T.line}`,
      transition: 'border-color .15s',
    }}>
      <div style={{ fontSize: 11, color: T.mute, fontWeight: 600, letterSpacing: '.02em', marginBottom: 2 }}>{label}</div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        type={type === 'password' ? 'text' : 'text'}
        style={{
          width: '100%', border: 'none', outline: 'none', background: 'transparent',
          fontSize: 16, fontWeight: 500, color: T.ink, fontFamily: T.font, padding: 0,
        }}
      />
    </label>
  );
}

function Toggle({ on, setOn }) {
  return (
    <button onClick={() => setOn(!on)} style={{
      width: 44, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer',
      background: on ? T.ink : T.line, padding: 2, position: 'relative',
      transition: 'background .15s',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 999, background: '#fff',
        transform: `translateX(${on ? 18 : 0}px)`, transition: 'transform .18s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
      }}/>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STUDENT 2 · CLASS SELECT
// ═══════════════════════════════════════════════════════════════════════════
const CLASSES = [
  { id: 'c1', code: 'CSE3013', name: '컴파일러', prof: '김연수 교수', time: '09:00 – 10:30', room: '공학관 401', status: 'closed', mins: 'DONE', dot: '결석없음' },
  { id: 'c2', code: 'CSE3045', name: '인공지능 개론', prof: '박재현 교수', time: '11:00 – 12:30', room: '공학관 308', status: 'open', live: true, remaining: '9분 12초', mins: 'NOW' },
  { id: 'c3', code: 'GEN2007', name: '디자인 사고와 혁신', prof: '이수민 교수', time: '13:30 – 15:00', room: '인문관 220', status: 'soon', mins: '1h 48m' },
  { id: 'c4', code: 'CSE3098', name: '소프트웨어 공학', prof: '정민호 교수', time: '15:30 – 17:00', room: '공학관 415', status: 'soon', mins: '3h 48m' },
];

function S2Classes({ onPick, activeId = 'c2' }) {
  return (
    <Phone>
      <Header sub="2026. 5. 18  ·  월요일" title="오늘 수업" right={
        <div style={{
          width: 36, height: 36, borderRadius: 999, background: T.brandSoft,
          color: T.brandDeep, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13,
        }}>김</div>
      }/>
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8 }}>
        <Stat label="출석" value="32" tone="ok"/>
        <Stat label="지각" value="2" tone="warn"/>
        <Stat label="결석" value="1" tone="danger"/>
      </div>
      <div style={{ padding: '4px 20px 24px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        {CLASSES.map(c => <ClassCard key={c.id} c={c} onClick={() => onPick && onPick(c)} active={c.id === activeId} />)}
        <div style={{
          padding: '14px 16px', borderRadius: 14, background: T.surf3,
          display: 'flex', alignItems: 'center', gap: 12, marginTop: 4,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: T.surf,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${T.line}`,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.ink2} strokeWidth="1.8"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>이번 주 시간표 보기</div>
            <div style={{ fontSize: 12, color: T.mute }}>총 5과목 · 15시간</div>
          </div>
          {Icon.chev(T.faint, 18)}
        </div>
      </div>
    </Phone>
  );
}

function Stat({ label, value, tone }) {
  const toneColor = { ok: T.ok, warn: T.warn, danger: T.danger }[tone] || T.ink;
  return (
    <div style={{
      flex: 1, background: T.surf, borderRadius: 12, border: `1px solid ${T.line2}`,
      padding: '10px 12px',
    }}>
      <div style={{ fontSize: 11, color: T.mute, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: toneColor, letterSpacing: '-0.03em' }}>{value}</div>
        <div style={{ fontSize: 11, color: T.faint }}>회</div>
      </div>
    </div>
  );
}

function ClassCard({ c, onClick, active }) {
  const isOpen = c.status === 'open';
  return (
    <Card onClick={onClick} active={active && isOpen} style={{
      padding: 16, position: 'relative', overflow: 'hidden',
    }}>
      {isOpen && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: T.brand,
        }}/>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: isOpen ? T.brandSoft : T.surf3,
          color: isOpen ? T.brandDeep : T.mute,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.02em', flexShrink: 0,
          fontFamily: T.mono,
        }}>{c.mins}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: T.faint, fontFamily: T.mono, fontWeight: 600 }}>{c.code}</span>
            {c.status === 'closed' && <Pill tone="mute">완료</Pill>}
            {c.status === 'open' && <Pill tone="brand" dot>출석 가능</Pill>}
            {c.status === 'soon' && <Pill tone="mute">예정</Pill>}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, letterSpacing: '-0.015em', marginBottom: 2 }}>{c.name}</div>
          <div style={{ fontSize: 12.5, color: T.mute }}>
            {c.time} · {c.room}
          </div>
        </div>
      </div>
      {isOpen && (
        <div style={{
          marginTop: 12, padding: '10px 12px', borderRadius: 10,
          background: T.brandSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 8, height: 8, borderRadius: 999, background: T.brand,
              boxShadow: `0 0 0 4px ${T.brandTint}`,
              animation: 'pulse 1.8s ease-in-out infinite',
            }}/>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: T.ink }}>출석 진행 중</span>
          </div>
          <span style={{ fontSize: 12, color: T.brandDeep, fontFamily: T.mono, fontWeight: 600 }}>
            남은 시간 {c.remaining}
          </span>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STUDENT 3 · AUTO-ATTEND (interactive)
// ═══════════════════════════════════════════════════════════════════════════
function S3Attend({ onSuccess, onFail, forceState }) {
  // states: idle, scanning, ok (auto), fail (auto)
  const [state, setState] = useState(forceState || 'idle');
  const [bt, setBt] = useState(true);
  const [loc, setLoc] = useState(true);
  const [net, setNet] = useState(true);
  const allReady = bt && loc && net;
  useEffect(() => { if (forceState) setState(forceState); }, [forceState]);

  const tap = () => {
    if (state === 'scanning') return;
    setState('scanning');
    setTimeout(() => {
      if (allReady) {
        setState('ok');
        if (onSuccess) setTimeout(onSuccess, 800);
      } else {
        setState('fail');
        if (onFail) setTimeout(onFail, 800);
      }
    }, 1400);
  };

  return (
    <Phone>
      <Header sub="CSE3045 · 인공지능 개론" title="자동 출석" back onBack={() => {}} right={
        <button style={{
          background: 'transparent', border: 'none', color: T.ink2, fontFamily: T.font,
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>도움말</button>
      }/>
      <div style={{ padding: '0 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* timer ribbon */}
        <div style={{
          padding: '10px 14px', borderRadius: 12, background: T.brand, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 22, fontSize: 13,
        }}>
          <span style={{ opacity: 0.7 }}>출석 종료까지</span>
          <span style={{ fontFamily: T.mono, fontWeight: 600, letterSpacing: '0.04em' }}>09:12</span>
        </div>

        {/* big auto-attend orb */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          <AttendOrb state={state} onTap={tap} />
          <div style={{ height: 24 }}/>
          <div style={{ fontSize: 19, fontWeight: 600, color: T.ink, letterSpacing: '-0.015em' }}>
            {state === 'idle' && '버튼을 눌러 자동 출석'}
            {state === 'scanning' && '주변 기기 확인 중…'}
            {state === 'ok' && '출석이 처리되었습니다'}
            {state === 'fail' && '출석에 실패했습니다'}
          </div>
          <div style={{ fontSize: 13, color: T.mute, marginTop: 6, textAlign: 'center', maxWidth: 280 }}>
            {state === 'idle' && '블루투스 비콘과 강의실 위치로 자동 인증합니다.'}
            {state === 'scanning' && '비콘 신호를 수집하고 있어요. 강의실 안에서 잠시 기다려 주세요.'}
            {state === 'ok' && '교수자에게 출석 신호가 전달되었어요.'}
            {state === 'fail' && '아래에서 원인을 확인하고 다시 시도하세요.'}
          </div>
        </div>

        {/* status row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '12px 0',
        }}>
          <StatusChip icon={Icon.bt} label="블루투스" on={bt} onClick={() => setBt(!bt)}/>
          <StatusChip icon={Icon.pin} label="위치" on={loc} onClick={() => setLoc(!loc)}/>
          <StatusChip icon={Icon.wifi} label="네트워크" on={net} onClick={() => setNet(!net)}/>
        </div>

        {/* secondary methods */}
        <div style={{ display: 'flex', gap: 10, paddingBottom: 12 }}>
          <SecondaryBtn icon={Icon.qr} label="QR 코드"/>
          <SecondaryBtn icon={Icon.keypad} label="인증번호"/>
        </div>
      </div>
    </Phone>
  );
}

function AttendOrb({ state, onTap }) {
  const ring = state === 'fail' ? T.accent : T.brand;
  const ringInner = state === 'fail' ? T.accentHi : T.brandHi;
  const ringSoft = state === 'fail' ? T.accentSoft : T.brandSoft;
  const big = state === 'ok' || state === 'fail';
  return (
    <button onClick={onTap} disabled={state === 'scanning'} style={{
      position: 'relative', width: 220, height: 220, borderRadius: '50%',
      border: 'none', cursor: state === 'scanning' ? 'wait' : 'pointer',
      background: 'transparent', padding: 0,
    }}>
      {/* outer ripples */}
      <div style={{
        position: 'absolute', inset: -22, borderRadius: '50%',
        background: ringSoft, opacity: state === 'scanning' ? 1 : 0.55,
        animation: state === 'scanning' ? 'ripple 1.6s ease-out infinite' : 'none',
      }}/>
      <div style={{
        position: 'absolute', inset: -8, borderRadius: '50%',
        background: ringSoft,
      }}/>
      {/* core */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle at 30% 25%, ${ringInner}, ${ring} 78%)`,
        boxShadow: `inset 0 -10px 30px rgba(0,0,0,0.18), 0 14px 30px ${ringSoft}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: 28,
        letterSpacing: '-0.04em', lineHeight: 1, whiteSpace: 'pre-line', textAlign: 'center',
        transition: 'all .25s',
      }}>
        {state === 'ok' && <Face size={200} mood="happy" fg="#fff"/>}
        {state === 'fail' && <Face size={200} mood="sad" fg="#fff"/>}
        {state === 'idle' && '자동\n출석'}
        {state === 'scanning' && <Face size={200} mood="idle" fg="#fff" opacity={0.7}/>}
      </div>
    </button>
  );
}

function StatusChip({ icon, label, on, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 8px', borderRadius: 12, background: T.surf, cursor: 'pointer',
      border: `1px solid ${on ? T.line2 : T.dangerSoft}`,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
      fontFamily: T.font, textAlign: 'left',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span style={{ color: on ? T.ink2 : T.danger }}>{icon(on ? T.ink2 : T.danger, 16)}</span>
        <span style={{
          width: 7, height: 7, borderRadius: 999,
          background: on ? T.ok : T.danger,
        }}/>
      </div>
      <div>
        <div style={{ fontSize: 12, color: T.mute, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 13, color: on ? T.ink : T.danger, fontWeight: 600 }}>
          {on ? '연결됨' : '꺼짐'}
        </div>
      </div>
    </button>
  );
}

function SecondaryBtn({ icon, label }) {
  return (
    <button style={{
      flex: 1, padding: '14px 16px', borderRadius: 14,
      background: T.surf, border: `1px solid ${T.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink, cursor: 'pointer',
    }}>
      {icon(T.ink, 18)} {label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STUDENT 4 · SUCCESS
// ═══════════════════════════════════════════════════════════════════════════
function S4Success({ onDone }) {
  return (
    <Phone statusBg={T.surf}>
      <div style={{ padding: '0 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header sub="" title="" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 4px' }}>
          {/* big happy face */}
          <div style={{
            width: 132, height: 132, borderRadius: '50%',
            background: `radial-gradient(circle at 30% 25%, ${T.brandHi}, ${T.brand} 78%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 0 14px ${T.brandSoft}, 0 18px 40px rgba(0,67,134,0.25)`,
            marginBottom: 28,
          }}>
            <Face size={132} mood="happy" fg="#fff"/>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', color: T.ink, marginBottom: 10 }}>
            출석 완료
          </div>
          <div style={{ fontSize: 14.5, color: T.mute, lineHeight: 1.5, maxWidth: 280 }}>
            인공지능 개론 강의에 정상 출석으로<br/>처리되었습니다.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '20px 0 16px' }}>
          <button onClick={onDone} style={{
            height: 54, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: T.brand, color: '#fff', fontSize: 16, fontWeight: 600, fontFamily: T.font,
          }}>확인</button>
          <button style={{
            background: 'transparent', border: 'none', color: T.mute, fontFamily: T.font,
            fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: 6,
          }}>전체 출결 현황 보기</button>
        </div>
      </div>
    </Phone>
  );
}

function ReceiptRow({ k, v, mono, badge }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 12.5, color: T.mute, fontWeight: 500 }}>{k}</span>
      {badge
        ? <Pill tone="brand" dot>{v}</Pill>
        : <span style={{ fontSize: 13.5, color: T.ink, fontWeight: 600, fontFamily: mono ? T.mono : T.font, textAlign: 'right' }}>{v}</span>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STUDENT 5 · FAIL
// ═══════════════════════════════════════════════════════════════════════════
function S5Fail({ onRetry }) {
  return (
    <Phone>
      <Header sub="CSE3045 · 인공지능 개론" title="" back onBack={() => {}}/>
      <div style={{ padding: '0 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '12px 4px 0' }}>
          <div style={{
            width: 104, height: 104, borderRadius: '50%',
            background: `radial-gradient(circle at 30% 25%, ${T.accentHi}, ${T.accent} 78%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 0 10px ${T.accentSoft}, 0 18px 36px rgba(166,22,95,0.22)`,
            marginBottom: 20,
          }}>
            <Face size={104} mood="sad" fg="#fff"/>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', color: T.ink, marginBottom: 8 }}>
            출석 실패
          </div>
          <div style={{ fontSize: 14, color: T.mute, lineHeight: 1.5, maxWidth: 280 }}>
            블루투스가 꺼져 있어 강의실 비콘을<br/>감지하지 못했습니다.
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <FailRow icon={Icon.bt} title="블루투스가 꺼져 있어요" sub="설정에서 켜고 다시 시도해 주세요" tone="danger" cta="설정 열기"/>
          <FailRow icon={Icon.pin} title="위치 권한 확인됨" sub="강의실 좌표와 일치합니다" tone="ok"/>
          <FailRow icon={Icon.wifi} title="네트워크 연결됨" sub="WiFi · 학교망" tone="ok"/>
        </div>

        <div style={{
          marginTop: 14, padding: 14, borderRadius: 14, background: T.warnSoft,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.warnDeep }}>
              13:43까지 처리하면 정상 출석으로 인정됩니다.
            </div>
            <div style={{ fontSize: 12, color: T.warn, marginTop: 2 }}>
              이후엔 지각으로 변경돼요.
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 12 }}>
          <button onClick={onRetry} style={{
            height: 54, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: T.brand, color: '#fff', fontSize: 16, fontWeight: 600, fontFamily: T.font,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>{Icon.refresh('#fff', 18)} 다시 시도</button>
          <button style={{
            height: 50, borderRadius: 14, border: `1px solid ${T.line}`, cursor: 'pointer',
            background: T.surf, color: T.ink, fontSize: 14.5, fontWeight: 600, fontFamily: T.font,
          }}>QR / 인증번호로 출석</button>
        </div>
      </div>
    </Phone>
  );
}

function FailRow({ icon, title, sub, tone, cta }) {
  const bg = tone === 'danger' ? T.dangerSoft : T.okSoft;
  const fg = tone === 'danger' ? T.danger : T.ok;
  return (
    <div style={{
      padding: '12px 14px', borderRadius: 12, background: T.surf,
      border: `1px solid ${T.line2}`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: bg, color: fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon(fg, 18)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{title}</div>
        <div style={{ fontSize: 12, color: T.mute, marginTop: 1 }}>{sub}</div>
      </div>
      {cta && (
        <button style={{
          padding: '7px 12px', borderRadius: 999, background: T.brand, color: '#fff',
          fontSize: 12, fontWeight: 600, fontFamily: T.font, border: 'none', cursor: 'pointer',
          flexShrink: 0,
        }}>{cta}</button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFESSOR 1 · LECTURE SELECT
// ═══════════════════════════════════════════════════════════════════════════
const LECTURES = [
  { id: 'l1', code: 'CSE3013', name: '컴파일러', time: '09:00 – 10:30', room: '공학관 401', section: '01분반', enrolled: 38, status: 'closed', present: 36, late: 1, absent: 1 },
  { id: 'l2', code: 'CSE3045', name: '인공지능 개론', time: '11:00 – 12:30', room: '공학관 308', section: '01분반', enrolled: 64, status: 'live', present: 48, late: 3, absent: 13 },
  { id: 'l3', code: 'CSE4051', name: '졸업 설계', time: '14:00 – 17:00', room: '연구동 라운지', section: '02분반', enrolled: 12, status: 'upcoming' },
];

function P1Lectures({ onPick }) {
  return (
    <Phone>
      <Header sub="2026. 5. 18  ·  월요일" title="오늘 강의" right={
        <div style={{
          width: 36, height: 36, borderRadius: 999, background: T.brand,
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13,
        }}>박</div>
      }/>
      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        {LECTURES.map(l => <LectureCard key={l.id} l={l} onOpen={() => onPick && onPick(l)} />)}
        <div style={{
          marginTop: 8, padding: 16, borderRadius: 14,
          border: `1px dashed ${T.line}`, background: T.surf2,
          fontSize: 13, color: T.mute, textAlign: 'center',
        }}>
          이번 학기 강의 5개 · 보강 1건 예정
        </div>
      </div>
    </Phone>
  );
}

function LectureCard({ l, onOpen }) {
  const live = l.status === 'live';
  const closed = l.status === 'closed';
  return (
    <Card active={live} style={{
      padding: 16,
      opacity: closed ? 0.82 : 1,
      background: closed ? T.surf3 : T.surf,
      borderStyle: closed ? 'dashed' : 'solid',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: T.faint, fontFamily: T.mono, fontWeight: 600 }}>{l.code}</span>
        <span style={{ fontSize: 11, color: T.mute }}>·</span>
        <span style={{ fontSize: 11, color: T.mute, fontWeight: 500 }}>{l.section}</span>
        <div style={{ flex: 1 }}/>
        {live && <Pill tone="brand" dot>진행 중</Pill>}
        {l.status === 'closed' && <Pill tone="ok" dot>완료</Pill>}
        {l.status === 'upcoming' && <Pill tone="mute">예정</Pill>}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: T.ink, letterSpacing: '-0.015em', marginBottom: 4 }}>
        {l.name}
      </div>
      <div style={{ fontSize: 12.5, color: T.mute, marginBottom: 12 }}>
        {l.time} · {l.room} · 수강 {l.enrolled}명
      </div>
      {l.status !== 'upcoming' && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0,
          background: T.surf2, borderRadius: 10, padding: '10px 4px',
          border: `1px solid ${T.line2}`,
        }}>
          <MiniStat label="출석" value={l.present} tone="ok"/>
          <Divider/>
          <MiniStat label="지각" value={l.late} tone="warn"/>
          <Divider/>
          <MiniStat label="결석" value={l.absent} tone="danger"/>
        </div>
      )}
      <button onClick={onOpen} style={{
          marginTop: 12, width: '100%', height: 44, borderRadius: 10,
          background: live ? T.brand : T.surf,
          color: live ? '#fff' : T.ink,
          fontFamily: T.font, fontSize: 14, fontWeight: 600,
          border: live ? 'none' : `1px solid ${T.line}`,
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>출석 현황 열기 {Icon.chev(live ? '#fff' : T.ink, 14)}</button>
    </Card>
  );
}

function MiniStat({ label, value, tone }) {
  const toneColor = { ok: T.ok, warn: T.warn, danger: T.danger }[tone] || T.ink;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ fontSize: 11, color: T.mute, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: toneColor, letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}
function Divider() { return <div style={{ width: 1, background: T.line2, justifySelf: 'center', height: 26, alignSelf: 'center' }}/>; }

// ═══════════════════════════════════════════════════════════════════════════
// PROFESSOR 2 · IN-PROGRESS
// ═══════════════════════════════════════════════════════════════════════════
function P2Progress({ onOpen, onBack, onPause, onEnd }) {
  const [elapsed, setElapsed] = useState(312); // seconds
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  return (
    <Phone>
      <Header sub="CSE3045 · 인공지능 개론" title="출석 진행 중" back onBack={onBack}/>
      <div style={{ padding: '0 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* big timer card */}
        <div style={{
          padding: '22px 22px 18px', borderRadius: 20, color: '#fff',
          background: `linear-gradient(160deg, ${T.brand}, ${T.brandDeep})`,
          marginBottom: 14, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 500, marginBottom: 4 }}>경과 시간</div>
              <div style={{ fontSize: 56, fontWeight: 700, fontFamily: T.mono, letterSpacing: '-0.04em', lineHeight: 1 }}>
                {mm}<span style={{ opacity: 0.5 }}>:</span>{ss}
              </div>
            </div>
            <Pill tone="ink" dot style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}>LIVE</Pill>
          </div>
          <div style={{ marginTop: 18, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
            <div style={{ width: '52%', height: '100%', background: '#fff', borderRadius: 999 }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11.5, opacity: 0.7, fontFamily: T.mono }}>
            <span>11:00 시작</span><span>12:30 종료</span>
          </div>
        </div>

        {/* live attendance count */}
        <div style={{
          padding: '16px 18px', borderRadius: 16, background: T.surf,
          border: `1px solid ${T.line}`, marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: T.mute, fontWeight: 600, marginBottom: 4 }}>현재 출석 인원</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: T.ink, letterSpacing: '-0.03em', fontFamily: T.mono }}>48</span>
                <span style={{ fontSize: 16, color: T.mute, fontWeight: 500 }}>/ 64명</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: T.ok, letterSpacing: '-0.02em', fontFamily: T.mono }}>75<span style={{ fontSize: 18 }}>%</span></div>
              <div style={{ fontSize: 11, color: T.mute }}>출석률</div>
            </div>
          </div>
          {/* avatar row */}
          <div style={{ display: 'flex', marginTop: 14, alignItems: 'center' }}>
            {['김지','박서','이도','정수','한가'].map((n, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: 999,
                background: ['oklch(0.90 0.012 60)','oklch(0.90 0.012 160)','oklch(0.90 0.012 220)','oklch(0.90 0.012 320)','oklch(0.90 0.012 30)'][i],
                color: T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, marginLeft: i === 0 ? 0 : -8,
                border: '2px solid #fff',
              }}>{n[0]}</div>
            ))}
            <div style={{
              width: 28, height: 28, borderRadius: 999, background: T.surf3, color: T.ink2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, marginLeft: -8, border: '2px solid #fff',
            }}>+43</div>
            <div style={{ flex: 1 }}/>
            <button onClick={onOpen} style={{
              padding: '8px 14px', borderRadius: 999, background: T.surf3,
              border: 'none', fontSize: 12.5, fontWeight: 600, color: T.ink, cursor: 'pointer',
              fontFamily: T.font, display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>전체 보기 {Icon.chev(T.ink, 12)}</button>
          </div>
        </div>

        {/* live feed */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ fontSize: 11, color: T.mute, fontWeight: 600, letterSpacing: '.05em', padding: '8px 4px 6px' }}>방금 출석</div>
          <FeedRow time="11:05:12" name="정수아" sub="자동 · BLE+GPS"/>
          <FeedRow time="11:05:03" name="한가람" sub="자동 · BLE+GPS"/>
          <FeedRow time="11:04:51" name="박서연" sub="QR 인증" tag="QR"/>
          <FeedRow time="11:04:30" name="이도현" sub="자동 · BLE+GPS"/>
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '10px 0 12px' }}>
          <button onClick={onPause} style={{
            flex: 1, height: 50, borderRadius: 14, background: T.surf, border: `1px solid ${T.line}`,
            fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink, cursor: 'pointer',
          }}>일시 중지</button>
          <button onClick={onEnd} style={{
            flex: 2, height: 50, borderRadius: 14, background: T.brand, border: 'none',
            fontFamily: T.font, fontSize: 14.5, fontWeight: 600, color: '#fff', cursor: 'pointer',
          }}>출석 마감</button>
        </div>
      </div>
    </Phone>
  );
}

function FeedRow({ time, name, sub, tag }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px',
      borderBottom: `1px solid ${T.line2}`,
    }}>
      <span style={{ fontFamily: T.mono, fontSize: 11.5, color: T.faint, width: 56 }}>{time}</span>
      <div style={{ width: 28, height: 28, borderRadius: 999, background: T.surf3, color: T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{name[0]}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, color: T.ink, fontWeight: 600 }}>{name}</div>
        <div style={{ fontSize: 11.5, color: T.mute }}>{sub}</div>
      </div>
      {tag && <Pill tone="mute">{tag}</Pill>}
      {!tag && <Pill tone="ok" dot>출석</Pill>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFESSOR 3 · OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════
const ROSTER = [
  { num: '20211045', name: '김지훈', t: '11:00:42', state: 'present', via: '자동' },
  { num: '20211088', name: '박서연', t: '11:00:51', state: 'present', via: 'QR' },
  { num: '20211103', name: '이도현', t: '11:01:08', state: 'present', via: '자동' },
  { num: '20211129', name: '정수아', t: '11:01:24', state: 'present', via: '자동' },
  { num: '20211167', name: '한가람', t: '11:02:09', state: 'present', via: '자동' },
  { num: '20211188', name: '오민채', t: '11:11:33', state: 'late', via: '자동' },
  { num: '20211204', name: '윤서린', t: '11:14:20', state: 'late', via: 'QR' },
  { num: '20211231', name: '강지유', t: '—', state: 'absent', via: '' },
  { num: '20211244', name: '서준호', t: '11:01:55', state: 'present', via: '자동' },
];

function P3Overview({ onLate, onBack }) {
  const [tab, setTab] = useState('all');
  const [roster, setRoster] = useState(ROSTER);
  const [selectedNum, setSelectedNum] = useState(null);
  const selectedStudent = roster.find(r => r.num === selectedNum);
  const present = roster.filter(r => r.state === 'present').length;
  const late = roster.filter(r => r.state === 'late').length;
  const absent = roster.filter(r => r.state === 'absent').length;
  const visible = roster.filter(r => tab === 'all' || r.state === tab);
  const updateStudentState = (state) => {
    if (!selectedStudent) return;
    const nextTime = state === 'absent' ? '--' : selectedStudent.t === '--' ? '11:08:00' : selectedStudent.t;
    setRoster(items => items.map(item => item.num === selectedStudent.num
      ? { ...item, state, t: nextTime, via: state === 'absent' ? '' : '수정' }
      : item));
  };
  return (
    <Phone>
      <Header sub="CSE3045 · 인공지능 개론  ·  5/18" title="전체 출결 현황" back onBack={onBack} right={
        <button onClick={() => setSelectedNum(roster[0]?.num)} style={{
          width: 36, height: 36, borderRadius: 999, background: T.surf, border: `1px solid ${T.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>{Icon.more(T.ink, 18)}</button>
      }/>
      <div style={{ padding: '0 20px 12px' }}>
        {/* big donut + numbers */}
        <div style={{
          padding: 18, borderRadius: 16, background: T.surf, border: `1px solid ${T.line}`,
          display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14,
        }}>
          <Donut present={present} late={late} absent={absent}/>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <LegendRow color={T.ok} label="출석" value={present} pct={Math.round(present/ROSTER.length*100)}/>
            <LegendRow color={T.warn} label="지각" value={late} pct={Math.round(late/ROSTER.length*100)}/>
            <LegendRow color={T.danger} label="결석" value={absent} pct={Math.round(absent/ROSTER.length*100)}/>
          </div>
        </div>
        {/* tabs */}
        <div style={{
          display: 'flex', gap: 6, padding: 4, background: T.surf3, borderRadius: 12, marginBottom: 8,
        }}>
          {[['all', '전체', roster.length],['present', '출석', present],['late', '지각', late],['absent', '결석', absent]].map(([k, l, n]) => (
            <button key={k} onClick={() => { setTab(k); if (k === 'late' && onLate) onLate(); }} style={{
              flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none',
              background: tab === k ? T.surf : 'transparent',
              boxShadow: tab === k ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              fontFamily: T.font, fontSize: 13, fontWeight: 600,
              color: tab === k ? T.ink : T.mute, cursor: 'pointer',
            }}>{l} <span style={{ fontFamily: T.mono, fontSize: 11, opacity: 0.6, marginLeft: 2 }}>{n}</span></button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 12px' }}>
        {visible.map(r => (
          <RosterRow
            key={r.num}
            r={r}
            selected={r.num === selectedNum}
            onClick={() => setSelectedNum(r.num)}
          />
        ))}
      </div>
      {selectedStudent && (
        <div style={{
          margin: '0 20px 10px', padding: 14, borderRadius: 14,
          background: T.surf, border: `1px solid ${T.brandTint}`,
          boxShadow: `0 0 0 3px ${T.brandSoft}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, color: T.ink, fontWeight: 700 }}>{selectedStudent.name}</div>
              <div style={{ fontSize: 11.5, color: T.mute, fontFamily: T.mono }}>{selectedStudent.num}</div>
            </div>
            <button onClick={() => setSelectedNum(null)} style={{
              width: 28, height: 28, borderRadius: 999, border: `1px solid ${T.line}`,
              background: T.surf, color: T.mute, cursor: 'pointer',
            }}>{Icon.x(T.mute, 14)}</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              ['present', '출석', T.ok],
              ['late', '지각', T.warn],
              ['absent', '결석', T.danger],
            ].map(([state, label, color]) => (
              <button key={state} onClick={() => updateStudentState(state)} style={{
                height: 38, borderRadius: 10,
                border: `1px solid ${selectedStudent.state === state ? color : T.line}`,
                background: selectedStudent.state === state ? color : T.surf3,
                color: selectedStudent.state === state ? '#fff' : T.ink,
                fontFamily: T.font, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>{label}</button>
            ))}
          </div>
        </div>
      )}
      <div style={{ padding: '8px 20px 12px', display: 'flex', gap: 10 }}>
        <button onClick={() => setSelectedNum(visible[0]?.num)} style={{
          flex: 1, height: 48, borderRadius: 12, background: T.surf, border: `1px solid ${T.line}`,
          fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>{Icon.edit(T.ink, 16)} 일괄 수정</button>
        <button onClick={() => setTab('all')} style={{
          flex: 1, height: 48, borderRadius: 12, background: T.brand, border: 'none',
          fontFamily: T.font, fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer',
        }}>CSV로 내보내기</button>
      </div>
    </Phone>
  );
}

function Donut({ present, late, absent }) {
  const total = present + late + absent;
  const p = (present / total) * 100;
  const l = (late / total) * 100;
  const a = (absent / total) * 100;
  return (
    <div style={{ width: 96, height: 96, position: 'relative', flexShrink: 0 }}>
      <svg width="96" height="96" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.915" fill="none" stroke={T.surf3} strokeWidth="4.4"/>
        <circle cx="18" cy="18" r="15.915" fill="none" stroke={T.ok} strokeWidth="4.4"
                strokeDasharray={`${p} ${100-p}`} strokeDashoffset="25" transform="rotate(-90 18 18)"/>
        <circle cx="18" cy="18" r="15.915" fill="none" stroke={T.warn} strokeWidth="4.4"
                strokeDasharray={`${l} ${100-l}`} strokeDashoffset={`${25 - p}`} transform="rotate(-90 18 18)"/>
        <circle cx="18" cy="18" r="15.915" fill="none" stroke={T.danger} strokeWidth="4.4"
                strokeDasharray={`${a} ${100-a}`} strokeDashoffset={`${25 - p - l}`} transform="rotate(-90 18 18)"/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 21, fontWeight: 700, color: T.ink, letterSpacing: '-0.03em', fontFamily: T.mono }}>{Math.round(p)}<span style={{ fontSize: 11 }}>%</span></div>
        <div style={{ fontSize: 10, color: T.mute }}>출석률</div>
      </div>
    </div>
  );
}

function LegendRow({ color, label, value, pct }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color }}/>
      <span style={{ flex: 1, fontSize: 12.5, color: T.ink2, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: T.ink, fontWeight: 700, fontFamily: T.mono }}>{value}</span>
      <span style={{ fontSize: 11, color: T.faint, width: 32, textAlign: 'right', fontFamily: T.mono }}>{pct}%</span>
    </div>
  );
}

function RosterRow({ r, selected, onClick }) {
  const tone = r.state === 'present' ? 'ok' : r.state === 'late' ? 'warn' : 'danger';
  const label = r.state === 'present' ? '출석' : r.state === 'late' ? '지각' : '결석';
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 6px',
      border: `1px solid ${selected ? T.brand : 'transparent'}`,
      borderBottomColor: selected ? T.brand : T.line2,
      borderRadius: selected ? 12 : 0,
      background: selected ? T.brandSoft : 'transparent',
      width: '100%', textAlign: 'left', fontFamily: T.font, cursor: 'pointer',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 999,
        background: T.surf3, color: T.ink2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700,
      }}>{r.name[0]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13.5, color: T.ink, fontWeight: 600 }}>{r.name}</span>
          <span style={{ fontSize: 11, color: T.faint, fontFamily: T.mono }}>{r.num}</span>
        </div>
        <div style={{ fontSize: 11.5, color: T.mute, fontFamily: T.mono, marginTop: 1 }}>
          {r.t}{r.via && ` · ${r.via}`}
        </div>
      </div>
      <Pill tone={tone} dot>{label}</Pill>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFESSOR 4 · LATE FILTER
// ═══════════════════════════════════════════════════════════════════════════
const LATE = [
  { num: '20211188', name: '오민채', t: '11:11:33', late: '+11분 33초', reason: 'BLE 늦은 감지', via: '자동' },
  { num: '20211204', name: '윤서린', t: '11:14:20', late: '+14분 20초', reason: 'QR 인증', via: 'QR' },
  { num: '20211279', name: '조하늘', t: '11:18:02', late: '+18분 02초', reason: '교수자 수동 처리', via: '수동' },
];

function P4Late({ onClose, onBack }) {
  const [onlySelected, setOnlySelected] = useState(false);
  const [strictRule, setStrictRule] = useState(false);
  const visibleLate = onlySelected ? LATE.slice(0, 1) : LATE;
  return (
    <Phone>
      <Header sub="CSE3045 · 5월 18일" title="지각 학생" back onBack={onBack} right={
        <button onClick={() => setOnlySelected(v => !v)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '7px 12px', background: onlySelected ? T.brandSoft : T.surf,
          border: `1px solid ${onlySelected ? T.brandTint : T.line}`,
          borderRadius: 999, fontSize: 12, fontWeight: 600,
          color: onlySelected ? T.brandDeep : T.ink2,
          fontFamily: T.font, cursor: 'pointer',
        }}>{Icon.filter(onlySelected ? T.brandDeep : T.ink2, 14)} 필터</button>
      }/>
      <div style={{ padding: '0 20px 16px' }}>
        {/* Threshold info */}
        <div style={{
          padding: 14, borderRadius: 14, background: T.warnSoft,
          display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{Icon.flag(T.warn, 18)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.warnDeep }}>
              지각 기준: 시작 후 {strictRule ? '5분' : '10분'} ~ 30분
            </div>
            <div style={{ fontSize: 11.5, color: T.warn, marginTop: 1 }}>
              30분 이후는 자동으로 결석 처리됩니다.
            </div>
          </div>
          <button onClick={() => setStrictRule(v => !v)} style={{
            background: 'transparent', border: 'none', color: T.warnDeep,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: T.font,
          }}>변경</button>
        </div>

        {/* segmented summary */}
        <div style={{
          display: 'flex', gap: 12, padding: '12px 14px', background: T.surf,
          border: `1px solid ${T.line}`, borderRadius: 12, marginBottom: 8,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: T.mute, fontWeight: 600 }}>지각 학생</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.ink, fontFamily: T.mono, letterSpacing: '-0.03em' }}>3<span style={{ fontSize: 13, color: T.mute, fontWeight: 500, marginLeft: 4 }}>/ 64명</span></div>
          </div>
          <div style={{ width: 1, background: T.line2 }}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: T.mute, fontWeight: 600 }}>평균 지각</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.warn, fontFamily: T.mono, letterSpacing: '-0.03em' }}>14<span style={{ fontSize: 13, color: T.mute, fontWeight: 500, marginLeft: 2 }}>분 38초</span></div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 12px' }}>
        <div style={{ fontSize: 11, color: T.mute, fontWeight: 600, letterSpacing: '.05em', padding: '4px 4px 8px' }}>
          지각 학생 목록
        </div>
        {visibleLate.map(s => (
          <LateRow key={s.num} s={s}/>
        ))}
      </div>

      <div style={{ padding: '8px 20px 12px', display: 'flex', gap: 10 }}>
        <button onClick={() => setOnlySelected(true)} style={{
          flex: 1, height: 48, borderRadius: 12, background: T.surf, border: `1px solid ${T.line}`,
          fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>{Icon.edit(T.ink, 16)} 출결 수정</button>
        <button onClick={onClose} style={{
          flex: 1, height: 48, borderRadius: 12, background: T.brand, border: 'none',
          fontFamily: T.font, fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer',
        }}>출결 마감</button>
      </div>
    </Phone>
  );
}

function LateRow({ s }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px',
      background: T.surf,
      border: `1px solid ${T.line2}`,
      borderRadius: 12, marginBottom: 8,
      transition: 'background .12s',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 999, background: T.warnSoft, color: T.warnDeep,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>{s.name[0]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, color: T.ink, fontWeight: 600 }}>{s.name}</span>
          <span style={{ fontSize: 11, color: T.faint, fontFamily: T.mono }}>{s.num}</span>
        </div>
        <div style={{ fontSize: 11.5, color: T.mute, fontFamily: T.mono, marginTop: 1 }}>
          {s.t} · {s.reason}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <Pill tone="warn" dot>지각</Pill>
        <div style={{ fontSize: 11, color: T.warnDeep, fontFamily: T.mono, fontWeight: 600, marginTop: 4 }}>{s.late}</div>
      </div>
    </div>
  );
}

// ─── Export ────────────────────────────────────────────────────────────────
export {
  S1Login,
  S2Classes,
  S3Attend,
  S4Success,
  S5Fail,
  P1Lectures,
  P2Progress,
  P3Overview,
  P4Late,
  T,
};
