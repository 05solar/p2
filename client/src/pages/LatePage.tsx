import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get } from '../lib/api';
import type { RosterRow, RosterSummary } from '../lib/types';
import { clock, methodLabel } from '../lib/format';
import { PageHeader } from '../components/PageHeader';
import { Avatar, Button, Pill, Spinner } from '../components/ui';
import { Icon } from '../components/icons';
import './LatePage.css';

interface LateResponse {
  session: { id: string; status: string; lateAfterMin: number; absentAfterMin: number };
  summary: RosterSummary;
  avgLate: number;
  late: RosterRow[];
}

export function LatePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<LateResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get<LateResponse>(`/sessions/${sessionId}/late`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="app-frame">
        <PageHeader title="지각 학생" back />
        <Spinner label="불러오는 중…" />
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="app-frame late-page">
      <PageHeader
        title="지각 학생"
        back
        onBack={() => navigate(`/sessions/${sessionId}/overview`)}
      />
      <div className="late-fixed">
        <div className="late-threshold">
          <span className="late-threshold-ic">{Icon.flag('var(--warn)', 18)}</span>
          <div className="late-threshold-text">
            <strong>지각 기준: 시작 후 {data.session.lateAfterMin}분 ~ {data.session.absentAfterMin}분</strong>
            <span>{data.session.absentAfterMin}분 이후는 자동으로 결석 처리됩니다.</span>
          </div>
        </div>

        <div className="late-summary">
          <div className="late-summary-cell">
            <div className="late-summary-label">지각 학생</div>
            <div className="late-summary-value mono">
              {data.late.length}<small>/ {data.summary.total}명</small>
            </div>
          </div>
          <div className="late-summary-divider" />
          <div className="late-summary-cell">
            <div className="late-summary-label">평균 지각</div>
            <div className="late-summary-value tone-warn mono">
              {data.avgLate}<small>분</small>
            </div>
          </div>
        </div>
      </div>

      <div className="page-scroll late-list">
        <div className="section-label">지각 학생 목록</div>
        {data.late.length === 0 ? (
          <div className="late-empty">지각한 학생이 없습니다.</div>
        ) : (
          data.late.map((s) => (
            <div className="late-row" key={s.studentId}>
              <Avatar name={s.name} tone="warn" />
              <div className="late-info">
                <div className="late-name-row">
                  <span className="late-name">{s.name}</span>
                  <span className="late-no mono">{s.studentNo}</span>
                </div>
                <div className="late-meta mono">
                  {clock(s.checkedAt)} · {methodLabel(s.method)}
                </div>
              </div>
              <div className="late-right">
                <Pill tone="warn" dot>지각</Pill>
                <div className="late-mins mono">+{s.lateMinutes ?? 0}분</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="late-actions">
        <Button variant="ghost" className="late-flex" onClick={() => navigate(`/sessions/${sessionId}/overview`)}>
          {Icon.edit('var(--ink)', 16)} 출결 수정
        </Button>
        <Button className="late-flex" onClick={() => navigate('/lectures')}>완료</Button>
      </div>
    </div>
  );
}
