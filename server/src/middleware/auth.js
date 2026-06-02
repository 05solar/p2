import { verifyToken } from '../utils/jwt.js';
import { store } from '../db/store.js';

// Authorization: Bearer <token> 검증 후 req.user 주입
export function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: '로그인이 필요합니다.' });

  try {
    const payload = verifyToken(token);
    const user = store.users.find((u) => u.id === payload.sub);
    if (!user) return res.status(401).json({ error: '사용자를 찾을 수 없습니다.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: '세션이 만료되었습니다. 다시 로그인해 주세요.' });
  }
}

// 특정 역할만 허용
export function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }
    next();
  };
}
