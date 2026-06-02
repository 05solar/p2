import { store } from '../db/store.js';
import { HttpError } from '../middleware/error.js';
import { newId } from '../utils/id.js';
import { nowISO, todayStr } from '../utils/time.js';
import {
  todaySession,
  buildRoster,
  enrolledStudents,
  findRecord,
} from '../services/attendance.service.js';

// GET /api/lectures — 역할별 목록
export function listLectures(req, res) {
  const user = req.user;
  const date = todayStr();

  if (user.role === 'professor') {
    const lectures = store.lectures
      .filter((l) => l.professorId === user.id)
      .map((l) => {
        const session = todaySession(l.id, date);
        const enrolled = enrolledStudents(l.id).length;
        let summary = null;
        if (session) summary = buildRoster(session).summary;
        return {
          ...l,
          enrolled,
          session: session
            ? { id: session.id, status: session.status, code: session.code }
            : null,
          status: session ? session.status : 'idle',
          present: summary?.present ?? 0,
          late: summary?.late ?? 0,
          absent: summary?.absent ?? 0,
        };
      });
    return res.json({ lectures });
  }

  // 학생: 수강 중인 강의
  const myLectureIds = store.enrollments
    .filter((e) => e.studentId === user.id)
    .map((e) => e.lectureId);
  const lectures = store.lectures
    .filter((l) => myLectureIds.includes(l.id))
    .map((l) => {
      const session = todaySession(l.id, date);
      const rec = session ? findRecord(session.id, user.id) : null;
      const myStatus = rec
        ? rec.status
        : session
          ? session.status === 'closed' ? 'absent' : 'pending'
          : null;
      return {
        id: l.id,
        code: l.code,
        name: l.name,
        section: l.section,
        room: l.room,
        startTime: l.startTime,
        endTime: l.endTime,
        professorName: l.professorName,
        session: session
          ? { id: session.id, status: session.status }
          : null,
        status: session ? session.status : 'idle',
        myStatus,
      };
    })
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  res.json({ lectures });
}

// GET /api/lectures/:id
export function getLecture(req, res) {
  const lecture = store.lectures.find((l) => l.id === req.params.id);
  if (!lecture) throw new HttpError(404, '강의를 찾을 수 없습니다.');

  const user = req.user;
  const enrolled = store.enrollments.some(
    (e) => e.lectureId === lecture.id && e.studentId === user.id,
  );
  if (user.role === 'professor' && lecture.professorId !== user.id) {
    throw new HttpError(403, '담당 강의가 아닙니다.');
  }
  if (user.role === 'student' && !enrolled) {
    throw new HttpError(403, '수강 중인 강의가 아닙니다.');
  }

  const session = todaySession(lecture.id, todayStr());
  res.json({
    lecture: { ...lecture, enrolledCount: enrolledStudents(lecture.id).length },
    session: session || null,
  });
}

// POST /api/lectures — 교수자 강의 개설
export function createLecture(req, res) {
  const { code, name, section, room, day, startTime, endTime } = req.body || {};
  if (!code || !name) {
    throw new HttpError(400, '강의 코드와 이름을 입력해 주세요.');
  }
  const lecture = {
    id: newId('lec'),
    code: String(code).trim().toUpperCase(),
    name: String(name).trim(),
    section: section || '01분반',
    room: room || '',
    day: Number.isInteger(day) ? day : 1,
    startTime: startTime || '09:00',
    endTime: endTime || '10:30',
    professorId: req.user.id,
    professorName: req.user.name,
    joinCode: String(code).trim().toUpperCase(),
    createdAt: nowISO(),
  };
  store.lectures.push(lecture);
  store.save();
  res.status(201).json({ lecture });
}

// POST /api/lectures/enroll — 학생이 강의 코드로 수강신청
export function enrollByCode(req, res) {
  const { code } = req.body || {};
  if (!code) throw new HttpError(400, '강의(수강) 코드를 입력해 주세요.');

  const lecture = store.lectures.find(
    (l) => l.joinCode?.toUpperCase() === String(code).trim().toUpperCase(),
  );
  if (!lecture) throw new HttpError(404, '해당 코드의 강의를 찾을 수 없습니다.');

  const exists = store.enrollments.some(
    (e) => e.lectureId === lecture.id && e.studentId === req.user.id,
  );
  if (exists) throw new HttpError(409, '이미 수강 중인 강의입니다.');

  store.enrollments.push({
    id: newId('enr'),
    lectureId: lecture.id,
    studentId: req.user.id,
    createdAt: nowISO(),
  });
  store.save();
  res.status(201).json({ lecture: { id: lecture.id, code: lecture.code, name: lecture.name } });
}
