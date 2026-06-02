import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, post } from '../lib/api';
import type { ActiveSession, RosterResponse } from '../lib/types';
import { clock, mmss, methodLabel } from '../lib/format';
import { PageHeader } from '../components/PageHeader';
import { Avatar, Button, Pill, Spinner } from '../components/ui';
import './LiveSessionPage.css';

export function LiveSessionPage() {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [roster, setRoster] = useState<RosterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [closing, setClosing] = useState(false);
  const pollRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  // 진행 중 세션 조회 → 로스터 폴링 시작
  useEffect(() => {
    let sid: string | null = null;
    get<{ session: ActiveSession | null }>(`/lectures/${lectureId}/sessions/active`)
      .then((r) => {
        setSession(r.session);
        if (!r.session) {
          setLoading(false);
          return;
        }
        sid = r.session.id;
        const poll = () =>
          get<RosterResponse>(`/sessions/${sid}/roster`)
            .then(setRoster)
            .catch(() => {})
            .finally(() => setLoading(false));
        poll();
        pollRef.current = window.setInterval(poll, 3000);
      })
      .catch(() => setLoading(false));
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [lectureId]);

  // 경과 시간 카운터
  useEffect(() => {
    if (!session) return;
    const started = new Date(session.startedAt).getTime();
    const update = () => setElapsed(Math.floor((Date.now() - started) / 1000));
    update();
    tickRef.current = window.setInterval(update, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [session]);

  const close = async () => {
    if (!session) return;
    setClosing(true);
    try {
      await post(`/sessions/${session.id}/close`, {});
      navigate(`/sessions/${session.id}/overview`, { replace: true });
    } catch {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="app-frame">
        <PageHeader title="출석 진행 중" back onBack={() => navigate('/lectures')} />
        <Spinner label="세션을 불러오는 중…" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="app-frame">
        <PageHeader title="출석 진행 중" back onBack={() => navigate('/lectures')} />
        <div className="live-empty">
          <strong>진행 중인 출석이 없습니다</strong>
          <span>강의 목록에서 출석을 시작하세요.</span>
          <Button variant="ghost" onClick={() => navigate('/lectures')}>강의 목록으로</Button>
        </div>
      </div>
    );
  }

  const summary = roster?.summary;
  const total = summary?.total ?? 0;
  const attended = (summary?.present ?? 0) + (summary?.late ?? 0);
  const rate = total ? Math.round((attended / total) * 100) : 0;
  const windowSec = session.absentAfterMin * 60;
  const progress = Math.min(100, Math.round((elapsed / windowSec) * 100));
  const endClock = clock(new Date(new Date(session.startedAt).getTime() + windowSec * 1000).toISOString());

  return (
    <div className="app-frame live-page">
      <PageHeader
        sub={`${session.lecture.code} · ${session.lecture.name}`}
        title="출석 진행 중"
        back
        onBack={() => navigate('/lectures')}
      />
      <div className="page-scroll live-scroll">
        {/* 경과 시간 카드 */}
        <div className="live-timer-card">
          <div className="live-timer-head">
            <div>
              <div className="live-timer-label">경과 시간</div>
              <div className="live-timer-value mono">{mmss(elapsed)}</div>
            </div>
            <span className="live-badge">
              <span className="live-badge-dot" /> LIVE
            </span>
          </div>
          <div className="live-progress"><span style={{ width: `${progress}%` }} /></div>
          <div className="live-timer-foot mono">
            <span>{clock(session.startedAt)} 시작</span>
            <span>{endClock} 마감</span>
          </div>
        </div>

        {/* 인증번호 */}
        <div className="live-code-card">
          <div className="live-code-label">출석 인증번호</div>
          <div className="live-code mono">{session.code}</div>
          <div className="live-code-hint">학생이 인증번호 출석 시 이 번호를 입력합니다</div>
        </div>

        {/* 출석 인원 */}
        <div className="live-count-card">
          <div className="live-count-head">
            <div>
              <div className="live-count-label">현재 출석 인원</div>
              <div className="live-count-value">
                <span className="mono">{attended}</span>
                <small>/ {total}명</small>
              </div>
            </div>
            <div className="live-rate">
              <div className="live-rate-value mono">{rate}<span>%</span></div>
              <div className="live-rate-label">출석률</div>
            </div>
          </div>
          <div className="live-mini-summary">
            <Pill tone="ok" dot>출석 {summary?.present ?? 0}</Pill>
            <Pill tone="warn" dot>지각 {summary?.late ?? 0}</Pill>
            <Pill tone="mute">미출석 {summary?.pending ?? 0}</Pill>
          </div>
        </div>

        {/* 실시간 피드 */}
        <div className="live-feed">
          <div className="section-label">방금 출석</div>
          {roster && roster.feed.length > 0 ? (
            roster.feed.map((f) => (
              <div className="feed-row" key={f.studentId}>
                <span className="feed-time mono">{clock(f.checkedAt)}</span>
                <Avatar name={f.name} tone="mute" />
                <div className="feed-info">
                  <strong>{f.name}</strong>
                  <span>{methodLabel(f.method)}</span>
                </div>
                <Pill tone={f.status === 'late' ? 'warn' : 'ok'} dot>
                  {f.status === 'late' ? '지각' : '출석'}
                </Pill>
              </div>
            ))
          ) : (
            <div className="feed-empty">아직 출석한 학생이 없습니다.</div>
          )}
        </div>
      </div>

      <div className="live-actions">
        <Button
          variant="ghost"
          className="live-action-flex1"
          onClick={() => navigate(`/sessions/${session.id}/overview`)}
        >
          전체 보기
        </Button>
        <Button className="live-action-flex2" onClick={close} disabled={closing}>
          {closing ? '마감 중…' : '출석 마감'}
        </Button>
      </div>
    </div>
  );
}
