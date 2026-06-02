// 비밀번호 해시 등 민감 필드를 제거한 안전한 사용자 객체
export function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...safe } = u;
  return safe;
}
