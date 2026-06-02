import { store } from '../db/store.js';
import { HttpError } from '../middleware/error.js';
import { newId, newAttendanceCode } from '../utils/id.js';
import { nowISO, todayStr, minutesBetween } from '../utils/time.js';
import {
  isEnrolled,
  enrolledStudents,
  buildRoster,
  findRecord,
  upsertRecord,
  statusForElapsed,
  liveSession,
} from '../services/attendance.service.js';

// 강의 소유 교수자 확인
function ownedLecture(lectureId, user) {
  const lecture = store.lectures.find((l) => l.id === lectureId);
  if (!lecture) throw new HttpError(404, '강의를 찾을 수 없습니다.');
  if (lecture.professorId !== user.id) {
    throw new HttpError(403, '담당 강의가 아닙니다.');
  }
  return lecture;
}

function getSession(id) {
  const session = store.sessions.find((s) => s.id === id);
  if (!session) throw new HttpError(404, '출석 세션을 찾을 수 없습니다.');
  return session;
}

// POST /api/lectures/:id/sessions — 교수자: 출석 세션 시작
export function startSession(req, res) {
  const lecture = ownedLecture(req.params.id, req.user);

  const existing = liveSession(lecture.id);
  if (existing) {
    return res.status(200).json({ session: existing, reused: true });
  }

  const { lateAfterMin, absentAfterMin } = req.body || {};
  const session = {
    id: newId('ses'),
    lectureId: lecture.id,
    date: todayStr(),
    status: 'live',
    code: newAttendanceCode(),
    startedAt: nowISO(),
    endedAt: null,
    lateAfterMin: Number(lateAfterMin) > 0 ? Number(lateAfterMin) : 10,
    absentAfterMin: Number(absentAfterMin) > 0 ? Number(absentAfterMin) : 30,
    createdAt: nowISO(),
  };
  store.sessions.push(session);
  store.save();
  res.status(201).json({ session });
}

// GET /api/lectures/:id/sessions/active — 진행 중 세션
// 교수자에게는 인증번호를 포함해서, 학생에게는 제외하고 반환합니다.
export function getActiveSession(req, res) {
  const lecture = store.lectures.find((l) => l.id === req.params.id);
  if (!lecture) throw new HttpError(404, '강의를 찾을 수 없습니다.');

  const session = liveSession(lecture.id);
  if (!session) return res.json({ session: null });

  const isOwner = req.user.role === 'professor' && lecture.professorId === req.user.id;
  const enrolled = isEnrolled(lecture.id, req.user.id);
  if (!isOwner && !enrolled) throw new HttpError(403, '접근 권한이 없습니다.');

  const elapsed = Math.floor(minutesBetween(session.startedAt));
  const base = {
    id: session.id,
    lectureId: session.lectureId,
    status: session.status,
    startedAt: session.startedAt,
    lateAfterMin: session.lateAfterMin,
    absentAfterMin: session.absentAfterMin,
    elapsedMin: elapsed,
    lecture: { id: lecture.id, code: lecture.code, name: lecture.name, room: lecture.room },
  };
  if (isOwner) {
    base.code = session.code;
    base.summary = buildRoster(session).summary;
  } else {
    base.myStatus = findRecord(session.id, req.user.id)?.status || 'pending';
  }
  res.json({ session: base });
}

// POST /api/sessions/:id/checkin — 학생: 출석 체크
// 성공/실패 모두 200 으로 반환 (출석 실패는 정상 흐름)
export function checkin(req, res) {
  const session = getSession(req.params.id);
  if (!isEnrolled(session.lectureId, req.user.id)) {
    throw new HttpError(403, '수강 중인 강의가 아닙니다.');
  }
  if (session.status !== 'live') {
    return res.json({ result: 'fail', reason: 'closed', message: '진행 중인 출석이 아닙니다.' });
  }

  const { method = 'auto', code, device } = req.body || {};
  const minutes = minutesBetween(session.startedAt);
  const timeStatus = statusForElapsed(session, minutes);

  if (timeStatus === 'closed') {
    return res.json({
      result: 'fail',
      reason: 'time',
      message: '출석 시간이 마감되었습니다. 교수자에게 문의해 주세요.',
    });
  }

  // 인증 방식별 검증
  if (method === 'code' || method === 'qr') {
    if (String(code || '').trim() !== session.code) {
      return res.json({
        result: 'fail',
        reason: 'code',
        message: '인증번호가 일치하지 않습니다.',
      });
    }
  } else {
    // 자동 출석: 단말 상태(블루투스/위치/네트워크) 확인
    const d = device || {};
    const offline = [];
    if (d.bluetooth === false) offline.push('블루투스');
    if (d.location === false) offline.push('위치');
    if (d.network === false) offline.push('네트워크');
    if (offline.length) {
      return res.json({
        result: 'fail',
        reason: 'device',
        offline,
        message: `${offline.join(', ')}가 꺼져 있어 자동 출석에 실패했습니다.`,
      });
    }
  }

  const record = upsertRecord(session.id, req.user.id, {
    status: timeStatus, // present | late
    method,
    checkedAt: nowISO(),
  });
  store.save();

  res.json({
    result: 'ok',
    status: record.status,
    checkedAt: record.checkedAt,
    method: record.method,
    message: record.status === 'late' ? '지각으로 출석 처리되었습니다.' : '출석이 완료되었습니다.',
  });
}

// GET /api/sessions/:id/roster — 교수자: 전체 로스터 + 요약 + 피드
export function getRoster(req, res) {
  const session = getSession(req.params.id);
  ownedLecture(session.lectureId, req.user);
  const lecture = store.lectures.find((l) => l.id === session.lectureId);
  const { rows, summary, feed } = buildRoster(session);
  res.json({
    session: {
      id: session.id,
      status: session.status,
      code: session.code,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      lateAfterMin: session.lateAfterMin,
      absentAfterMin: session.absentAfterMin,
      elapsedMin: Math.floor(minutesBetween(session.startedAt, session.endedAt || undefined)),
    },
    lecture: lecture
      ? { id: lecture.id, code: lecture.code, name: lecture.name, room: lecture.room, date: session.date }
      : null,
    roster: rows,
    summary,
    feed,
  });
}

// PATCH /api/sessions/:id/records/:studentId — 교수자: 출결 수동 수정
export function updateRecord(req, res) {
  const session = getSession(req.params.id);
  ownedLecture(session.lectureId, req.user);

  const { status } = req.body || {};
  if (!['present', 'late', 'absent'].includes(status)) {
    throw new HttpError(400, '상태 값이 올바르지 않습니다.');
  }
  if (!isEnrolled(session.lectureId, req.params.studentId)) {
    throw new HttpError(404, '해당 강의 수강생이 아닙니다.');
  }

  const record = upsertRecord(session.id, req.params.studentId, {
    status,
    method: 'manual',
    checkedAt: status === 'absent' ? null : (findRecord(session.id, req.params.studentId)?.checkedAt || nowISO()),
  });
  store.save();
  res.json({ record });
}

// POST /api/sessions/:id/close — 교수자: 출석 마감
export function closeSession(req, res) {
  const session = getSession(req.params.id);
  ownedLecture(session.lectureId, req.user);

  if (session.status === 'closed') {
    return res.json({ session });
  }

  // 미출석 학생을 모두 결석 처리
  for (const student of enrolledStudents(session.lectureId)) {
    if (!findRecord(session.id, student.id)) {
      upsertRecord(session.id, student.id, {
        status: 'absent',
        method: '',
        checkedAt: null,
      });
    }
  }
  session.status = 'closed';
  session.endedAt = nowISO();
  store.save();
  res.json({ session });
}

// GET /api/sessions/:id/late — 교수자: 지각 학생 목록
export function getLate(req, res) {
  const session = getSession(req.params.id);
  ownedLecture(session.lectureId, req.user);

  const { rows, summary } = buildRoster(session);
  const late = rows.filter((r) => r.status === 'late');
  const avgLate = late.length
    ? Math.round(late.reduce((sum, r) => sum + (r.lateMinutes || 0), 0) / late.length)
    : 0;

  res.json({
    session: {
      id: session.id,
      status: session.status,
      lateAfterMin: session.lateAfterMin,
      absentAfterMin: session.absentAfterMin,
    },
    summary,
    avgLate,
    late,
  });
}
