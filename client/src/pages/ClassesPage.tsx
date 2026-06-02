import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { get, post, ApiError } from '../lib/api';
import type { Lecture, StudentStats } from '../lib/types';
import { todayKo, statusLabel } from '../lib/format';
import { PageHeader } from '../components/PageHeader';
import { Avatar, Button, Card, Pill, Spinner, Stat } from '../components/ui';
import { Icon } from '../components/icons';
import './ClassesPage.css';

export function ClassesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEnroll, setShowEnroll] = useState(false);
  const [code, setCode] = useState('');
  const [enrollMsg, setEnrollMsg] = useState('');

  const load = async () => {
    const [lec, profile] = await Promise.all([
      get<{ lectures: Lecture[] }>('/lectures'),
      get<{ stats: StudentStats }>('/users/me'),
    ]);
    setLectures(lec.lectures);
    setStats(profile.stats);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const enroll = async () => {
    setEnrollMsg('');
    try {
      await post('/lectures/enroll', { code: code.trim() });
      setCode('');
      setShowEnroll(false);
      setLoading(true);
      await load();
    } catch (err) {
      setEnrollMsg(err instanceof ApiError ? err.message : '등록에 실패했습니다.');
    }
  };

  return (
    <div className="classes-page">
      <PageHeader
        sub={todayKo()}
        title="오늘 수업"
        right={
          <>
            <button className="icon-btn" onClick={() => setShowEnroll(true)} aria-label="수업 추가">
              {Icon.plus('var(--ink2)', 18)}
            </button>
            <Avatar name={user?.name || '나'} tone="brand" />
          </>
        }
      />

      {loading ? (
        <Spinner label="수업을 불러오는 중…" />
      ) : (
        <div className="page-scroll classes-scroll">
          <div className="classes-stats">
            <Stat label="출석" value={stats?.present ?? 0} tone="ok" />
            <Stat label="지각" value={stats?.late ?? 0} tone="warn" />
            <Stat label="결석" value={stats?.absent ?? 0} tone="danger" />
          </div>

          <div className="classes-list">
            {lectures.map((l) => (
              <ClassCard key={l.id} lecture={l} onAttend={() => navigate(`/attend/${l.id}`)} />
            ))}
            {lectures.length === 0 && (
              <div className="classes-empty">
                수강 중인 강의가 없습니다. 오른쪽 위 <b>+</b> 로 강의 코드를 입력해 등록하세요.
              </div>
            )}
          </div>
        </div>
      )}

      {showEnroll && (
        <div className="sheet-backdrop" onClick={() => setShowEnroll(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h3 className="sheet-title">강의 코드로 수강 등록</h3>
            <p className="sheet-sub">교수자에게 받은 강의 코드를 입력하세요. (예: CSE3045)</p>
            <input
              className="sheet-input"
              placeholder="강의 코드"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoFocus
            />
            {enrollMsg && <div className="sheet-msg">{enrollMsg}</div>}
            <div className="sheet-actions">
              <Button variant="ghost" block onClick={() => setShowEnroll(false)}>취소</Button>
              <Button block onClick={enroll} disabled={!code.trim()}>등록</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClassCard({ lecture, onAttend }: { lecture: Lecture; onAttend: () => void }) {
  const live = lecture.status === 'live';
  const attended = lecture.myStatus === 'present' || lecture.myStatus === 'late';
  const openForMe = live && !attended;

  return (
    <Card active={openForMe} className="class-card" onClick={openForMe ? onAttend : undefined}>
      {openForMe && <div className="class-live-bar" />}
      <div className="class-main">
        <div className="class-badge">{lecture.startTime}</div>
        <div className="class-info">
          <div className="class-meta">
            <span className="class-code mono">{lecture.code}</span>
            {live && !attended && <Pill tone="brand" dot>출석 가능</Pill>}
            {attended && (
              <Pill tone={lecture.myStatus === 'late' ? 'warn' : 'ok'} dot>
                {statusLabel(lecture.myStatus!)}
              </Pill>
            )}
            {lecture.status === 'closed' && !attended && <Pill tone="danger" dot>결석</Pill>}
            {lecture.status === 'idle' && <Pill tone="mute">예정</Pill>}
          </div>
          <div className="class-name">{lecture.name}</div>
          <div className="class-sub">
            {lecture.startTime} – {lecture.endTime} · {lecture.room}
          </div>
        </div>
      </div>
      {openForMe && (
        <button className="class-attend-bar" onClick={onAttend}>
          <span className="class-attend-dot" />
          지금 출석하기
          {Icon.chev('var(--brand-deep)', 16)}
        </button>
      )}
    </Card>
  );
}
