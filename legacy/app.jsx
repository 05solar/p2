import React, { useMemo, useState } from 'react';
import {
  P1Lectures,
  P2Progress,
  P3Overview,
  P4Late,
  S1Login,
  S2Classes,
  S3Attend,
  S4Success,
  S5Fail,
  T,
} from './screens.jsx';
import symbolMark from './symbolmark_traditional_01.png';
import './styles.css';

const studentSteps = [
  { id: 'login', label: '로그인' },
  { id: 'classes', label: '수업 선택' },
  { id: 'attend', label: '자동 출석' },
  { id: 'success', label: '성공' },
  { id: 'fail', label: '실패' },
];

const professorSteps = [
  { id: 'lectures', label: '강의 선택' },
  { id: 'progress', label: '진행 중' },
  { id: 'overview', label: '전체 현황' },
  { id: 'late', label: '지각 관리' },
];

function App() {
  const [role, setRole] = useState('student');
  const [studentFlow, setStudentFlow] = useState('classes');
  const [professorFlow, setProfessorFlow] = useState('progress');
  const [locale, setLocale] = useState('KO');

  const studentScreen = {
    login: <S1Login onLogin={() => setStudentFlow('classes')} />,
    classes: <S2Classes onPick={() => setStudentFlow('attend')} />,
    attend: (
      <S3Attend
        onSuccess={() => setStudentFlow('success')}
        onFail={() => setStudentFlow('fail')}
      />
    ),
    success: <S4Success onDone={() => setStudentFlow('classes')} />,
    fail: <S5Fail onRetry={() => setStudentFlow('attend')} />,
  }[studentFlow];

  const openLecture = (lecture) => {
    setProfessorFlow(lecture?.status === 'live' ? 'progress' : 'overview');
  };

  const professorScreen = {
    lectures: <P1Lectures onPick={openLecture} />,
    progress: (
      <P2Progress
        onBack={() => setProfessorFlow('lectures')}
        onOpen={() => setProfessorFlow('overview')}
        onPause={() => setProfessorFlow('lectures')}
        onEnd={() => setProfessorFlow('overview')}
      />
    ),
    overview: (
      <P3Overview
        onBack={() => setProfessorFlow('progress')}
        onLate={() => setProfessorFlow('late')}
      />
    ),
    late: (
      <P4Late
        onBack={() => setProfessorFlow('overview')}
        onClose={() => setProfessorFlow('overview')}
      />
    ),
  }[professorFlow];

  const activeSteps = role === 'student' ? studentSteps : professorSteps;
  const activeStep = role === 'student' ? studentFlow : professorFlow;
  const setActiveStep = role === 'student' ? setStudentFlow : setProfessorFlow;
  const screen = role === 'student' ? studentScreen : professorScreen;

  const metrics = useMemo(() => [
    { label: '오늘 수업', value: '5', sub: '자동 출석 가능 2개' },
    { label: '출석률', value: '92%', sub: '최근 4주 기준' },
    { label: '진행 강의', value: '1', sub: '실시간 집계 중' },
  ], []);

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <nav className="topbar" aria-label="주요 메뉴">
          <div className="brand-mark logo-mark">
            <img src={symbolMark} alt="서비스 로고" />
          </div>
          <div className="topbar-title">
            <strong>자동출석 웹 프로토타입</strong>
            <span>Student and professor attendance flow</span>
          </div>
          <button className="global-button" onClick={() => setLocale(locale === 'KO' ? 'EN' : 'KO')}>
            <span aria-hidden="true">◎</span>
            {locale}
          </button>
          <div className="role-switch" role="tablist" aria-label="사용자 유형">
            <button
              className={role === 'student' ? 'is-active' : ''}
              onClick={() => setRole('student')}
              role="tab"
              aria-selected={role === 'student'}
            >
              학생
            </button>
            <button
              className={role === 'professor' ? 'is-active' : ''}
              onClick={() => setRole('professor')}
              role="tab"
              aria-selected={role === 'professor'}
            >
              교수자
            </button>
          </div>
        </nav>

        <section className="control-panel top-flow-panel" aria-label="화면 단계 선택">
          <div>
            <p className="eyebrow">Flow</p>
            <h2>{role === 'student' ? '학생 사용자 흐름' : '교수자 사용자 흐름'}</h2>
          </div>
          <div className="step-grid">
            {activeSteps.map((step, index) => (
              <button
                key={step.id}
                className={activeStep === step.id ? 'step-card is-active' : 'step-card'}
                onClick={() => setActiveStep(step.id)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step.label}</strong>
              </button>
            ))}
          </div>
        </section>

        <div className="hero-grid">
          <div className="intro-copy">
            <p className="eyebrow">Responsive React App</p>
            <h1>모바일 출석 흐름을 웹 화면 기준으로 바로 확인하세요.</h1>
            <p>
              기존 디자인 캔버스 대신 실제 사용 화면을 중심에 배치했습니다.
              데스크톱에서는 설명과 미리보기를 나란히, 모바일에서는 한 화면씩
              자연스럽게 쌓이도록 구성했습니다.
            </p>
            <div className="metric-row">
              {metrics.map((item) => (
                <div className="metric-card" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <small>{item.sub}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="preview-stage" aria-label="선택한 화면 미리보기">
            <div className="phone-scale">{screen}</div>
          </div>
        </div>
      </section>

      <section className="domain-panel">
        <div>
          <p className="eyebrow">Domain</p>
          <h2>핵심 객체 구조</h2>
        </div>
        <DomainMap />
      </section>
    </main>
  );
}

function DomainMap() {
  const nodes = [
    { t: 'Attendance', d: '자동, QR, 인증번호 출석 처리', tone: 'brand' },
    { t: 'Lecture', d: '강의 코드, 시간, 강의실 관리' },
    { t: 'User', d: '학생과 교수자 역할 분리' },
    { t: 'Device Status', d: 'BLE, GPS, 네트워크 상태 확인', tone: 'warn' },
    { t: 'Error Handling', d: '실패 원인 분류와 복구 안내', tone: 'danger' },
    { t: 'Notification', d: '성공, 실패, 마감 알림 피드백', tone: 'ok' },
  ];

  return (
    <div className="domain-grid">
      {nodes.map((node, index) => (
        <article className={`domain-card tone-${node.tone || 'mute'}`} key={node.t}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{node.t}</strong>
          <p>{node.d}</p>
        </article>
      ))}
    </div>
  );
}

export default App;
export { T };
