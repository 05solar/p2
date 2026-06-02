// 출석 성공/실패/대기 상태를 표현하는 캐릭터 페이스 (프로토타입 이식)
type Mood = 'happy' | 'sad' | 'idle';

export function Face({
  size = 100,
  mood = 'happy',
  fg = '#fff',
  opacity = 0.92,
}: {
  size?: number;
  mood?: Mood;
  fg?: string;
  opacity?: number;
}) {
  const s = size;
  const stroke = Math.max(2.2, s * 0.028);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: 'block' }}>
      {/* 눈 */}
      {mood !== 'idle' && (
        <g fill={fg} opacity={opacity}>
          <circle cx="36" cy="42" r="2.6" />
          <circle cx="64" cy="42" r="2.6" />
        </g>
      )}
      {mood === 'idle' && (
        <g fill={fg} opacity={opacity}>
          <circle cx="36" cy="44" r="2.2" />
          <circle cx="64" cy="44" r="2.2" />
        </g>
      )}
      {/* 입 */}
      {mood === 'happy' && (
        <path d="M40 58 Q50 67 60 58" stroke={fg} strokeWidth={stroke} strokeLinecap="round" fill="none" opacity={opacity} />
      )}
      {mood === 'sad' && (
        <path d="M42 64 Q50 58 58 64" stroke={fg} strokeWidth={stroke} strokeLinecap="round" fill="none" opacity={opacity} />
      )}
      {mood === 'idle' && (
        <path d="M44 60 L56 60" stroke={fg} strokeWidth={stroke} strokeLinecap="round" fill="none" opacity={opacity * 0.7} />
      )}
      {/* 볼 */}
      {mood === 'happy' && (
        <g opacity="0.28">
          <circle cx="28" cy="55" r="3.6" fill={fg} />
          <circle cx="72" cy="55" r="3.6" fill={fg} />
        </g>
      )}
    </svg>
  );
}
