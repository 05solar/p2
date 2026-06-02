import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { get, post, ApiError } from '../lib/api';
import type { Lecture } from '../lib/types';
import { todayKo } from '../lib/format';
import { PageHeader } from '../components/PageHeader';
import { Avatar, Button, Card, Field, Pill, Spinner } from '../components/ui';
import { Icon } from '../components/icons';
import './LecturesPage.css';

export function LecturesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    const r = await get<{ lectures: Lecture[] }>('/lectures');
    setLectures(r.lectures);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const startSession = async (lecture: Lecture) => {
    setBusyId(lecture.id);
    try {
      await post(`/lectures/${lecture.id}/sessions`, {});
      navigate(`/lectures/${lecture.id}/live`);
    } catch {
      setBusyId(null);
    }
  };

  const openLecture = (lecture: Lecture) => {
    if (lecture.status === 'live') navigate(`/lectures/${lecture.id}/live`);
    else if (lecture.status === 'closed' && lecture.session)
      navigate(`/sessions/${lecture.session.id}/overview`);
    else startSession(lecture);
  };

  return (
    <div className="lectures-page">
      <PageHeader
        sub={todayKo()}
        title="오늘 강의"
        right={
          <>
            <button className="icon-btn" onClick={() => setShowCreate(true)} aria-label="강의 추가">
              {Icon.plus('var(--ink2)', 18)}
            </button>
            <Avatar name={user?.name || '교'} tone="brand" />
          </>
        }
      />

      {loading ? (
        <Spinner label="강의를 불러오는 중…" />
      ) : (
        <div className="page-scroll lectures-scroll">
          {lectures.map((l) => (
            <LectureCard
              key={l.id}
              lecture={l}
              busy={busyId === l.id}
              onPrimary={() => openLecture(l)}
            />
          ))}
          {lectures.length === 0 && (
            <div className="lectures-empty">개설한 강의가 없습니다. 오른쪽 위 <b>+</b> 로 강의를 추가하세요.</div>
          )}
        </div>
      )}

      {showCreate && (
        <CreateLectureSheet
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            setLoading(true);
            load();
          }}
        />
      )}
    </div>
  );
}

function LectureCard({
  lecture,
  busy,
  onPrimary,
}: {
  lecture: Lecture;
  busy: boolean;
  onPrimary: () => void;
}) {
  const live = lecture.status === 'live';
  const closed = lecture.status === 'closed';
  const hasStats = live || closed;
  const cta = live ? '출석 현황 열기' : closed ? '전체 현황 보기' : '출석 시작';

  return (
    <Card active={live} className={`lecture-card ${closed ? 'lecture-card-closed' : ''}`}>
      <div className="lecture-top">
        <span className="lecture-code mono">{lecture.code}</span>
        <span className="lecture-dot">·</span>
        <span className="lecture-section">{lecture.section}</span>
        <div className="lecture-flex" />
        {live && <Pill tone="brand" dot>진행 중</Pill>}
        {closed && <Pill tone="ok" dot>완료</Pill>}
        {lecture.status === 'idle' && <Pill tone="mute">대기</Pill>}
      </div>
      <div className="lecture-name">{lecture.name}</div>
      <div className="lecture-sub">
        {lecture.startTime} – {lecture.endTime} · {lecture.room} · 수강 {lecture.enrolled}명
      </div>

      {hasStats && (
        <div className="lecture-stats">
          <MiniStat label="출석" value={lecture.present ?? 0} tone="ok" />
          <div className="lecture-divider" />
          <MiniStat label="지각" value={lecture.late ?? 0} tone="warn" />
          <div className="lecture-divider" />
          <MiniStat label="결석" value={lecture.absent ?? 0} tone="danger" />
        </div>
      )}

      <Button
        block
        variant={live ? 'primary' : 'ghost'}
        className="lecture-cta"
        onClick={onPrimary}
        disabled={busy}
      >
        {busy ? '시작하는 중…' : (
          <>
            {lecture.status === 'idle' && Icon.play(live ? '#fff' : 'var(--brand)', 16)}
            {cta} {Icon.chev(live ? '#fff' : 'var(--ink)', 14)}
          </>
        )}
      </Button>
    </Card>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: 'ok' | 'warn' | 'danger' }) {
  return (
    <div className="mini-stat">
      <span className="mini-stat-label">{label}</span>
      <span className={`mini-stat-value tone-${tone}`}>{value}</span>
    </div>
  );
}

function CreateLectureSheet({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ code: '', name: '', room: '', section: '01분반', startTime: '09:00', endTime: '10:30' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = async () => {
    setMsg('');
    setBusy(true);
    try {
      await post('/lectures', form);
      onCreated();
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : '개설에 실패했습니다.');
      setBusy(false);
    }
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h3 className="sheet-title">강의 개설</h3>
        <p className="sheet-sub">학생은 강의 코드로 수강 등록할 수 있습니다.</p>
        <div className="sheet-field"><Field label="강의 코드" placeholder="CSE3045" value={form.code} onChange={update('code')} /></div>
        <div className="sheet-field"><Field label="강의명" placeholder="인공지능 개론" value={form.name} onChange={update('name')} /></div>
        <div className="sheet-field"><Field label="강의실" placeholder="공학관 308" value={form.room} onChange={update('room')} /></div>
        <div className="sheet-row">
          <Field label="시작" type="time" value={form.startTime} onChange={update('startTime')} />
          <Field label="종료" type="time" value={form.endTime} onChange={update('endTime')} />
        </div>
        {msg && <div className="sheet-msg">{msg}</div>}
        <div className="sheet-actions">
          <Button variant="ghost" block onClick={onClose}>취소</Button>
          <Button block onClick={create} disabled={busy || !form.code || !form.name}>개설</Button>
        </div>
      </div>
    </div>
  );
}
