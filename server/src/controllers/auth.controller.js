import { store } from '../db/store.js';
import { HttpError } from '../middleware/error.js';
import { newId } from '../utils/id.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { publicUser } from '../utils/serialize.js';
import { nowISO } from '../utils/time.js';
import { autoEnrollStudent } from '../services/enrollment.service.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
export function register(req, res) {
  const { name, email, password, role, studentNo, employeeNo, department } =
    req.body || {};

  if (!name || !email || !password) {
    throw new HttpError(400, '이름, 이메일, 비밀번호를 모두 입력해 주세요.');
  }
  if (!EMAIL_RE.test(email)) {
    throw new HttpError(400, '올바른 이메일 형식이 아닙니다.');
  }
  if (String(password).length < 6) {
    throw new HttpError(400, '비밀번호는 6자 이상이어야 합니다.');
  }
  const userRole = role === 'professor' ? 'professor' : 'student';
  if (userRole === 'student' && !studentNo) {
    throw new HttpError(400, '학번을 입력해 주세요.');
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (store.users.some((u) => u.email === normalizedEmail)) {
    throw new HttpError(409, '이미 가입된 이메일입니다.');
  }
  if (userRole === 'student' && store.users.some((u) => u.studentNo === studentNo)) {
    throw new HttpError(409, '이미 등록된 학번입니다.');
  }

  const user = {
    id: newId('user'),
    role: userRole,
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    department: department || '',
    createdAt: nowISO(),
    ...(userRole === 'student'
      ? { studentNo: String(studentNo).trim() }
      : { employeeNo: employeeNo ? String(employeeNo).trim() : '' }),
  };
  store.users.push(user);
  // 신규 학생은 가입 즉시 최소 4개 강의에 자동 수강 등록
  if (userRole === 'student') {
    autoEnrollStudent(user.id, 4);
  }
  store.save();

  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}

// POST /api/auth/login
export function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    throw new HttpError(400, '이메일과 비밀번호를 입력해 주세요.');
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = store.users.find((u) => u.email === normalizedEmail);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new HttpError(401, '이메일 또는 비밀번호가 올바르지 않습니다.');
  }
  res.json({ token: signToken(user), user: publicUser(user) });
}

// GET /api/auth/me
export function me(req, res) {
  res.json({ user: publicUser(req.user) });
}
