import { store } from './store.js';
import { newId, newAttendanceCode } from '../utils/id.js';
import { hashPassword } from '../utils/password.js';
import { nowISO, todayStr } from '../utils/time.js';

// 데모 비밀번호는 모두 demo1234 입니다.
const DEMO_PW = hashPassword('demo1234');

// ─────────────────────────────────────────────────────────────
// 서버 최초 실행 시 한 번만 채워지는 데모 데이터.
// (이미 사용자가 있으면 건너뜁니다. 초기화하려면 server/data/db.json 삭제)
// ─────────────────────────────────────────────────────────────
export function seedIfEmpty() {
  if (!store.isEmpty()) return;

  const now = nowISO();

  // ── 교수자 ───────────────────────────────────────────────
  const prof = {
    id: newId('user'),
    role: 'professor',
    name: '박재현',
    email: 'prof@demo.com',
    passwordHash: DEMO_PW,
    employeeNo: 'P100245',
    department: '컴퓨터공학부',
    createdAt: now,
  };
  store.users.push(prof);

  // ── 학생 (로그인 데모 계정 1명 + 로스터용 학생들) ─────────
  const demoStudent = {
    id: newId('user'),
    role: 'student',
    name: '김지훈',
    email: 'student@demo.com',
    passwordHash: DEMO_PW,
    studentNo: '20211045',
    department: '컴퓨터공학부',
    createdAt: now,
  };
  store.users.push(demoStudent);

  const rosterSeed = [
    ['박서연', '20211088'],
    ['이도현', '20211103'],
    ['정수아', '20211129'],
    ['한가람', '20211167'],
    ['오민채', '20211188'],
    ['윤서린', '20211204'],
    ['강지유', '20211231'],
    ['서준호', '20211244'],
    ['조하늘', '20211279'],
  ];
  const rosterStudents = rosterSeed.map(([name, studentNo]) => {
    const u = {
      id: newId('user'),
      role: 'student',
      name,
      email: `${studentNo}@demo.com`,
      passwordHash: DEMO_PW,
      studentNo,
      department: '컴퓨터공학부',
      createdAt: now,
    };
    store.users.push(u);
    return u;
  });
  const allStudents = [demoStudent, ...rosterStudents];

  // ── 강의 ─────────────────────────────────────────────────
  const lectureSeed = [
    { code: 'CSE3045', name: '인공지능 개론', section: '01분반', room: '공학관 308', day: 1, startTime: '11:00', endTime: '12:30' },
    { code: 'CSE3013', name: '컴파일러', section: '01분반', room: '공학관 401', day: 1, startTime: '09:00', endTime: '10:30' },
    { code: 'CSE3098', name: '소프트웨어 공학', section: '01분반', room: '공학관 415', day: 1, startTime: '15:30', endTime: '17:00' },
    { code: 'CSE4051', name: '졸업 설계', section: '02분반', room: '연구동 라운지', day: 1, startTime: '14:00', endTime: '17:00' },
  ];
  const lectures = lectureSeed.map((l) => {
    const lecture = {
      id: newId('lec'),
      ...l,
      professorId: prof.id,
      professorName: prof.name,
      joinCode: l.code, // 학생이 이 코드로 수강신청
      createdAt: now,
    };
    store.lectures.push(lecture);
    return lecture;
  });

  // ── 수강신청: 모든 학생을 4개 강의에 등록 ────────────────
  for (const lecture of lectures) {
    for (const s of allStudents) {
      store.enrollments.push({
        id: newId('enr'),
        lectureId: lecture.id,
        studentId: s.id,
        createdAt: now,
      });
    }
  }

  // ── 진행 중 데모 세션: '인공지능 개론' ───────────────────
  // 솔로 테스트도 가능하도록 넉넉한 임계값(지각 15분 / 결석 180분)으로 시작.
  const aiLecture = lectures[0];
  const liveSession = {
    id: newId('ses'),
    lectureId: aiLecture.id,
    date: todayStr(),
    status: 'live',
    code: newAttendanceCode(),
    startedAt: now,
    endedAt: null,
    lateAfterMin: 15,
    absentAfterMin: 180,
    createdAt: now,
  };
  store.sessions.push(liveSession);

  // 일부 로스터 학생은 이미 출석/지각한 상태로 미리 채워 둡니다.
  const preset = [
    [rosterStudents[0], 'present', 'qr'],   // 박서연
    [rosterStudents[1], 'present', 'auto'], // 이도현
    [rosterStudents[2], 'present', 'auto'], // 정수아
    [rosterStudents[3], 'present', 'auto'], // 한가람
    [rosterStudents[4], 'late', 'auto'],    // 오민채
  ];
  preset.forEach(([s, status, method], i) => {
    store.records.push({
      id: newId('rec'),
      sessionId: liveSession.id,
      studentId: s.id,
      status,
      method,
      checkedAt: new Date(Date.now() - (preset.length - i) * 60000).toISOString(),
      note: '',
    });
  });

  store.save();
  // eslint-disable-next-line no-console
  console.log('✓ 데모 데이터 시드 완료 (student@demo.com / prof@demo.com / pw: demo1234)');
}
