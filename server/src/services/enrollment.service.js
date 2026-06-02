import { store } from '../db/store.js';
import { newId } from '../utils/id.js';
import { nowISO } from '../utils/time.js';

// 강의가 부족할 때(시드가 비정상인 경우 등) 채워 넣을 데모 강의 템플릿
const DEMO_LECTURE_TEMPLATES = [
  { code: 'CSE3045', name: '인공지능 개론', section: '01분반', room: '공학관 308', startTime: '11:00', endTime: '12:30' },
  { code: 'CSE3013', name: '컴파일러', section: '01분반', room: '공학관 401', startTime: '09:00', endTime: '10:30' },
  { code: 'CSE3098', name: '소프트웨어 공학', section: '01분반', room: '공학관 415', startTime: '15:30', endTime: '17:00' },
  { code: 'GEN2007', name: '디자인 사고와 혁신', section: '01분반', room: '인문관 220', startTime: '13:30', endTime: '15:00' },
  { code: 'CSE4051', name: '졸업 설계', section: '02분반', room: '연구동 라운지', startTime: '14:00', endTime: '17:00' },
];

// 시스템에 최소 minCount 개의 강의가 존재하도록 보장 (없으면 템플릿으로 생성)
function ensureMinLectures(minCount) {
  if (store.lectures.length >= minCount) return;
  // 강의를 소유할 교수자 (시드가 보장하지만, 없으면 데모 교수자 생성)
  let prof = store.users.find((u) => u.role === 'professor');
  if (!prof) {
    prof = {
      id: newId('user'),
      role: 'professor',
      name: '데모 교수',
      email: `demo-prof-${newId('p')}@demo.com`,
      passwordHash: '',
      employeeNo: '',
      department: '컴퓨터공학부',
      createdAt: nowISO(),
    };
    store.users.push(prof);
  }
  for (const t of DEMO_LECTURE_TEMPLATES) {
    if (store.lectures.length >= minCount) break;
    if (store.lectures.some((l) => l.code === t.code)) continue;
    store.lectures.push({
      id: newId('lec'),
      ...t,
      day: 1,
      professorId: prof.id,
      professorName: prof.name,
      joinCode: t.code,
      createdAt: nowISO(),
    });
  }
}

// ─────────────────────────────────────────────────────────────
// 신규 학생을 강의에 자동 수강 등록.
// 회원가입 즉시 최소 minCount(기본 4)개의 강의가 배정되도록 보장합니다.
// (호출부에서 store.save() 를 수행)
// ─────────────────────────────────────────────────────────────
export function autoEnrollStudent(studentId, minCount = 4) {
  ensureMinLectures(minCount);

  // 시작 시간 순으로 정렬해 최소 minCount 개(부족하지 않으면 전부) 배정
  const lectures = [...store.lectures].sort((a, b) =>
    (a.startTime || '').localeCompare(b.startTime || ''),
  );
  const target = lectures.slice(0, Math.max(minCount, lectures.length));

  let enrolled = 0;
  for (const lecture of target) {
    const exists = store.enrollments.some(
      (e) => e.lectureId === lecture.id && e.studentId === studentId,
    );
    if (!exists) {
      store.enrollments.push({
        id: newId('enr'),
        lectureId: lecture.id,
        studentId,
        createdAt: nowISO(),
      });
      enrolled += 1;
    }
  }
  return enrolled;
}
