import { store } from '../db/store.js';
import { HttpError } from '../middleware/error.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { publicUser } from '../utils/serialize.js';
import { clockStr } from '../utils/time.js';

// GET /api/users/me — 프로필 + 통계
export function getProfile(req, res) {
  const user = req.user;
  const stats = user.role === 'student'
    ? studentStats(user.id)
    : professorStats(user.id);
  res.json({ user: publicUser(user), stats });
}

// PATCH /api/users/me — 프로필/비밀번호 수정
export function updateProfile(req, res) {
  const user = req.user;
  const { name, department, currentPassword, newPassword } = req.body || {};

  if (name !== undefined) user.name = String(name).trim();
  if (department !== undefined) user.department = String(department).trim();

  if (newPassword) {
    if (!verifyPassword(currentPassword || '', user.passwordHash)) {
      throw new HttpError(400, '현재 비밀번호가 올바르지 않습니다.');
    }
    if (String(newPassword).length < 6) {
      throw new HttpError(400, '새 비밀번호는 6자 이상이어야 합니다.');
    }
    user.passwordHash = hashPassword(newPassword);
  }

  store.save();
  res.json({ user: publicUser(user) });
}

// GET /api/users/me/attendance — 학생 출결 이력
export function getAttendanceHistory(req, res) {
  const user = req.user;
  if (user.role !== 'student') {
    return res.json({ history: [] });
  }
  const history = store.records
    .filter((r) => r.studentId === user.id)
    .map((r) => {
      const session = store.sessions.find((s) => s.id === r.sessionId);
      const lecture = session
        ? store.lectures.find((l) => l.id === session.lectureId)
        : null;
      return {
        id: r.id,
        status: r.status,
        method: r.method,
        checkedAt: r.checkedAt,
        time: clockStr(r.checkedAt),
        date: session?.date || '',
        lecture: lecture
          ? { id: lecture.id, code: lecture.code, name: lecture.name }
          : null,
      };
    })
    .filter((h) => h.lecture)
    .sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')));

  res.json({ history });
}

function studentStats(studentId) {
  const records = store.records.filter((r) => r.studentId === studentId);
  const present = records.filter((r) => r.status === 'present').length;
  const late = records.filter((r) => r.status === 'late').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const counted = present + late + absent;
  const enrolledCount = store.enrollments.filter(
    (e) => e.studentId === studentId,
  ).length;
  // 지각은 0.5회 결석으로 간주한 출석률(데모 기준)
  const rate = counted
    ? Math.round(((present + late * 0.5) / counted) * 100)
    : 100;
  return { present, late, absent, enrolledCount, rate };
}

function professorStats(professorId) {
  const lectures = store.lectures.filter((l) => l.professorId === professorId);
  const lectureIds = lectures.map((l) => l.id);
  const sessions = store.sessions.filter((s) => lectureIds.includes(s.lectureId));
  const liveSessions = sessions.filter((s) => s.status === 'live').length;
  const totalStudents = new Set(
    store.enrollments
      .filter((e) => lectureIds.includes(e.lectureId))
      .map((e) => e.studentId),
  ).size;
  return {
    lectureCount: lectures.length,
    sessionCount: sessions.length,
    liveSessions,
    totalStudents,
  };
}
