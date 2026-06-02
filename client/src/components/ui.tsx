import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import './ui.css';

type Tone = 'mute' | 'brand' | 'ok' | 'warn' | 'danger' | 'ink';

export function Pill({
  tone = 'mute',
  dot,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={`pill pill-${tone}`}>
      {dot && <span className="pill-dot" />}
      {children}
    </span>
  );
}

export function Card({
  children,
  active,
  onClick,
  className = '',
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`card ${active ? 'card-active' : ''} ${onClick ? 'card-tap' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </div>
  );
}

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'soft' | 'danger';
  block?: boolean;
  size?: 'md' | 'lg';
}
export function Button({
  variant = 'primary',
  block,
  size = 'md',
  className = '',
  children,
  ...rest
}: BtnProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${block ? 'btn-block' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}
export function Field({ label, hint, error, ...rest }: FieldProps) {
  return (
    <label className={`field ${error ? 'field-error' : ''}`}>
      <span className="field-label">{label}</span>
      <input className="field-input" {...rest} />
      {error ? (
        <span className="field-msg field-msg-error">{error}</span>
      ) : hint ? (
        <span className="field-msg">{hint}</span>
      ) : null}
    </label>
  );
}

export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`toggle ${on ? 'toggle-on' : ''}`}
      onClick={onToggle}
      aria-pressed={on}
    >
      <span className="toggle-knob" />
    </button>
  );
}

export function Stat({
  label,
  value,
  tone = 'ink',
  unit = '회',
}: {
  label: string;
  value: ReactNode;
  tone?: Tone;
  unit?: string;
}) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-row">
        <span className={`stat-value tone-${tone}`}>{value}</span>
        {unit && <span className="stat-unit">{unit}</span>}
      </span>
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="spinner-wrap">
      <span className="spinner" />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
}

export function EmptyState({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {sub && <span>{sub}</span>}
    </div>
  );
}

export function Avatar({ name, tone = 'mute' }: { name: string; tone?: 'brand' | 'mute' | 'warn' }) {
  return <span className={`avatar avatar-${tone}`}>{name?.[0] || '?'}</span>;
}

// 도넛 차트 (출석/지각/결석 비율)
export function Donut({
  present,
  late,
  absent,
}: {
  present: number;
  late: number;
  absent: number;
}) {
  const total = present + late + absent || 1;
  const p = (present / total) * 100;
  const l = (late / total) * 100;
  const a = (absent / total) * 100;
  return (
    <div className="donut">
      <svg width="96" height="96" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--surf3)" strokeWidth="4.4" />
        <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--ok)" strokeWidth="4.4"
          strokeDasharray={`${p} ${100 - p}`} strokeDashoffset="25" transform="rotate(-90 18 18)" />
        <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--warn)" strokeWidth="4.4"
          strokeDasharray={`${l} ${100 - l}`} strokeDashoffset={`${25 - p}`} transform="rotate(-90 18 18)" />
        <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--danger)" strokeWidth="4.4"
          strokeDasharray={`${a} ${100 - a}`} strokeDashoffset={`${25 - p - l}`} transform="rotate(-90 18 18)" />
      </svg>
      <div className="donut-center">
        <strong>{Math.round(p)}<small>%</small></strong>
        <span>출석률</span>
      </div>
    </div>
  );
}
