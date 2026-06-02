import bcrypt from 'bcryptjs';

// 순수 JS 구현(bcryptjs)이라 네이티브 빌드 없이 모든 OS에서 동작합니다.
export const hashPassword = (plain) => bcrypt.hashSync(plain, 10);
export const verifyPassword = (plain, hash) => bcrypt.compareSync(plain, hash || '');
