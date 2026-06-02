import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { get, patch, ApiError } from '../lib/api';
import type {
  AttendanceHistoryItem,
  ProfessorStats,
  StudentStats,
  User,
} from '../lib/types';
import { statusLabel, statusTone } from '../lib/format';
import { PageHeader } from '../components/PageHeader';
import { Button, Donut, Field, Pill, Spinner } from '../components/ui';
import { Icon } from '../components/icons';
import './MyPage.css';

export function MyPage() {
  const { user, setUser, logout } = useAuth();
  const [stats, setStats] = useState<StudentStats | ProfessorStats | null>(null);
  const [history, setHistory] = useState<AttendanceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const tasks: Promise<unknown>[] = [
      get<{ stats: StudentStats | ProfessorStats }>('/users/me').then((r) => setStats(r.stats)),
    ];
    if (user?.role === 'student') {
      tasks.push(
        get<{ history: AttendanceHistoryItem[] }>('/users/me/attendance').then((r) =>
          setHistory(r.history),
        ),
      );
    }
    Promise.all(tasks).finally(() => setLoading(false));
  }, [user?.role]);

  if (!user) return null;
  const isStudent = user.role === 'student';
  const sStats = stats as StudentStats | null;
  const pStats = stats as ProfessorStats | null;

  return (
    <div className="mypage">
      <PageHeader title="마이페이지" sub={isStudent ? '학생 계정' : '교수자 계정'} />

      {loading ? (
        <Spinner label="불러오는 중…" />
      ) : (
        <div className="page-scroll mypage-scroll">
          {/* 프로필 카드 */}
          <section className="profile-card">
            <div className="profile-avatar">{user.name[0]}</div>
            <div className="profile-info">
              <div className="profile-name-row">
                <strong>{user.name}</strong>
                <Pill tone={isStudent ? 'brand' : 'ink'}>{isStudent ? '학생' : '교수자'}</Pill>
              </div>
              <div className="profile-meta">
                {isStudent ? `학번 ${user.studentNo}` : user.employeeNo ? `교번 ${user.employeeNo}` : '교수자'}
                {user.department ? ` · ${user.department}` : ''}
              </div>
              <div className="profile-email">{user.email}</div>
            </div>
            <button className="profile-edit" onClick={() => setEditing(true)}>
              {Icon.edit('var(--ink2)', 16)}
            </button>
          </section>

          {/* 통계 */}
          {isStudent && sStats ? (
            <section className="stat-card">
              <Donut present={sStats.present} late={sStats.late} absent={sStats.absent} />
              <div className="stat-legend">
                <LegendRow color="var(--ok)" label="출석" value={sStats.present} />
                <LegendRow color="var(--warn)" label="지각" value={sStats.late} />
                <LegendRow color="var(--danger)" label="결석" value={sStats.absent} />
                <div className="stat-legend-foot">수강 {sStats.enrolledCount}과목 · 출석률 {sStats.rate}%</div>
              </div>
            </section>
          ) : (
            pStats && (
              <section className="prof-stats">
                <ProfStat label="담당 강의" value={pStats.lectureCount} unit="개" />
                <ProfStat label="수강생" value={pStats.totalStudents} unit="명" />
                <ProfStat label="진행 중" value={pStats.liveSessions} unit="건" tone="brand" />
                <ProfStat label="누적 세션" value={pStats.sessionCount} unit="회" />
              </section>
            )
          )}

          {/* 출결 이력 (학생) */}
          {isStudent && (
            <section className="history">
              <div className="section-label">최근 출결 이력</div>
              {history.length === 0 ? (
                <div className="history-empty">아직 출결 기록이 없습니다.</div>
              ) : (
                history.map((h) => (
                  <div className="history-row" key={h.id}>
                    <div className="history-date mono">{h.date.slice(5)}</div>
                    <div className="history-info">
                      <strong>{h.lecture?.name}</strong>
                      <span className="mono">{h.lecture?.code} · {h.time}</span>
                    </div>
                    <Pill tone={statusTone(h.status)} dot>{statusLabel(h.status)}</Pill>
                  </div>
                ))
              )}
            </section>
          )}

          <button className="logout-btn" onClick={logout}>
            {Icon.logout('var(--danger)', 18)} 로그아웃
          </button>
          <div className="mypage-foot">자동출석 · 데모 버전 1.0</div>
        </div>
      )}

      {editing && (
        <EditSheet user={user} onClose={() => setEditing(false)} onSaved={setUser} />
      )}
    </div>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="legend-row">
      <span className="legend-swatch" style={{ background: color }} />
      <span className="legend-label">{label}</span>
      <span className="legend-value mono">{value}</span>
    </div>
  );
}

function ProfStat({
  label,
  value,
  unit,
  tone = 'ink',
}: {
  label: string;
  value: number;
  unit: string;
  tone?: 'ink' | 'brand';
}) {
  return (
    <div className="prof-stat">
      <span className="prof-stat-label">{label}</span>
      <span className="prof-stat-value">
        <strong style={{ color: tone === 'brand' ? 'var(--brand)' : 'var(--ink)' }}>{value}</strong>
        <small>{unit}</small>
      </span>
    </div>
  );
}

function EditSheet({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: (u: User) => void;
}) {
  const [name, setName] = useState(user.name);
  const [department, setDepartment] = useState(user.department || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setMsg('');
    setBusy(true);
    try {
      const body: Record<string, string> = { name, department };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      const r = await patch<{ user: User }>('/users/me', body);
      onSaved(r.user);
      onClose();
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : '저장에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h3 className="sheet-title">프로필 수정</h3>
        <div className="sheet-field"><Field label="이름" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="sheet-field"><Field label="학과" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="컴퓨터공학부" /></div>
        <div className="sheet-field"><Field label="현재 비밀번호 (변경 시)" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
        <div className="sheet-field"><Field label="새 비밀번호 (변경 시)" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
        {msg && <div className="sheet-msg">{msg}</div>}
        <div className="sheet-actions">
          <Button variant="ghost" block onClick={onClose}>취소</Button>
          <Button block onClick={save} disabled={busy}>{busy ? '저장 중…' : '저장'}</Button>
        </div>
      </div>
    </div>
  );
}
