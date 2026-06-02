import { store } from '../db/store.js';
import { minutesBetween } from '../utils/time.js';

// 한 강의에 수강 등록된 학생 목록
export function enrolledStudents(lectureId) {
  const ids = store.enrollments
    .filter((e) => e.lectureId === lectureId)
    .map((e) => e.studentId);
  return store.users.filter((u) => ids.includes(u.id));
}

export function isEnrolled(lectureId, studentId) {
  return store.enrollments.some(
    (e) => e.lectureId === lectureId && e.studentId === studentId,
  );
}

// 세션 시작 후 경과 분으로 출석 상태를 판정
//  ≤ lateAfterMin   → 출석(present)
//  ≤ absentAfterMin → 지각(late)
//  그 이후          → 마감(closed, 출석 불가)
export function statusForElapsed(session, minutes) {
  if (minutes <= session.lateAfterMin) return 'present';
  if (minutes <= session.absentAfterMin) return 'late';
  return 'closed';
}

// 학생 한 명의 세션 기록 조회
export function findRecord(sessionId, studentId) {
  return store.records.find(
    (r) => r.sessionId === sessionId && r.studentId === studentId,
  );
}

// 출석 기록 생성/갱신 (upsert)
export function upsertRecord(sessionId, studentId, patch) {
  let rec = findRecord(sessionId, studentId);
  if (rec) {
    Object.assign(rec, patch);
  } else {
    rec = {
      id: `rec_${sessionId}_${studentId}`,
      sessionId,
      studentId,
      status: 'absent',
      method: '',
      checkedAt: null,
      note: '',
      ...patch,
    };
    store.records.push(rec);
  }
  return rec;
}

// 교수자용 전체 로스터 + 요약 + 최근 출석 피드
export function buildRoster(session) {
  const students = enrolledStudents(session.lectureId).sort((a, b) =>
    (a.studentNo || '').localeCompare(b.studentNo || ''),
  );

  const rows = students.map((s) => {
    const rec = findRecord(session.id, s.id);
    const status = rec
      ? rec.status
      : session.status === 'closed'
        ? 'absent'
        : 'pending';
    return {
      studentId: s.id,
      name: s.name,
      studentNo: s.studentNo,
      status,
      method: rec?.method || '',
      checkedAt: rec?.checkedAt || null,
      lateMinutes:
        rec && rec.status === 'late' && rec.checkedAt
          ? Math.round(minutesBetween(session.startedAt, rec.checkedAt))
          : null,
    };
  });

  const summary = {
    total: rows.length,
    present: rows.filter((r) => r.status === 'present').length,
    late: rows.filter((r) => r.status === 'late').length,
    absent: rows.filter((r) => r.status === 'absent').length,
    pending: rows.filter((r) => r.status === 'pending').length,
  };

  const feed = rows
    .filter((r) => r.checkedAt)
    .sort((a, b) => new Date(b.checkedAt) - new Date(a.checkedAt))
    .slice(0, 12);

  return { rows, summary, feed };
}

// 강의의 오늘 세션(가장 최근) 조회
export function todaySession(lectureId, date) {
  return [...store.sessions]
    .filter((s) => s.lectureId === lectureId && s.date === date)
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))[0] || null;
}

export function liveSession(lectureId) {
  return store.sessions.find(
    (s) => s.lectureId === lectureId && s.status === 'live',
  ) || null;
}
