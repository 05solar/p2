import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, patch } from '../lib/api';
import type { AttendanceStatus, RosterResponse, RosterRow } from '../lib/types';
import { clock, statusLabel, statusTone } from '../lib/format';
import { PageHeader } from '../components/PageHeader';
import { Avatar, Button, Donut, Pill, Spinner } from '../components/ui';
import { Icon } from '../components/icons';
import './OverviewPage.css';

type Tab = 'all' | 'present' | 'late' | 'absent';

export function OverviewPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<RosterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [selected, setSelected] = useState<string | null>(null);

  const load = () =>
    get<RosterResponse>(`/sessions/${sessionId}/roster`)
      .then(setData)
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [sessionId]);

  const setStatus = async (studentId: string, status: AttendanceStatus) => {
    await patch(`/sessions/${sessionId}/records/${studentId}`, { status });
    await load();
  };

  const exportCsv = () => {
    if (!data) return;
    const header = '학번,이름,상태,출석시각,방식';
    const lines = data.roster.map((r) =>
      [r.studentNo, r.name, statusLabel(r.status), r.checkedAt ? clock(r.checkedAt) : '', r.method].join(','),
    );
    const csv = '﻿' + [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${data.lecture?.code || 'session'}_${data.lecture?.date || ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="app-frame">
        <PageHeader title="전체 출결 현황" back onBack={() => navigate('/lectures')} />
        <Spinner label="명단을 불러오는 중…" />
      </div>
    );
  }
  if (!data) return null;

  const { summary } = data;
  const counts: Record<Tab, number> = {
    all: summary.total,
    present: summary.present,
    late: summary.late,
    absent: summary.absent,
  };
  const visible = data.roster.filter((r) => tab === 'all' || r.status === tab);
  const selectedRow = data.roster.find((r) => r.studentId === selected);

  return (
    <div className="app-frame overview-page">
      <PageHeader
        sub={`${data.lecture?.code} · ${data.lecture?.name} · ${data.lecture?.date}`}
        title="전체 출결 현황"
        back
        onBack={() => navigate('/lectures')}
        right={
          data.session.status === 'live' ? (
            <Pill tone="brand" dot>진행 중</Pill>
          ) : (
            <Pill tone="ok" dot>마감</Pill>
          )
        }
      />

      <div className="overview-fixed">
        <div className="overview-summary">
          <Donut present={summary.present} late={summary.late} absent={summary.absent} />
          <div className="overview-legend">
            <LegendRow color="var(--ok)" label="출석" value={summary.present} total={summary.total} />
            <LegendRow color="var(--warn)" label="지각" value={summary.late} total={summary.total} />
            <LegendRow color="var(--danger)" label="결석" value={summary.absent} total={summary.total} />
            {summary.pending > 0 && (
              <LegendRow color="var(--faint)" label="미출석" value={summary.pending} total={summary.total} />
            )}
          </div>
        </div>

        <div className="overview-tabs">
          {(['all', 'present', 'late', 'absent'] as Tab[]).map((k) => (
            <button
              key={k}
              className={tab === k ? 'is-active' : ''}
              onClick={() => {
                setTab(k);
                if (k === 'late') navigate(`/sessions/${sessionId}/late`);
              }}
            >
              {{ all: '전체', present: '출석', late: '지각', absent: '결석' }[k]}
              <span className="mono">{counts[k]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="page-scroll overview-list">
        {visible.map((r) => (
          <RosterRowItem
            key={r.studentId}
            row={r}
            selected={r.studentId === selected}
            onClick={() => setSelected(r.studentId === selected ? null : r.studentId)}
          />
        ))}
        {visible.length === 0 && <div className="overview-empty">해당 상태의 학생이 없습니다.</div>}
      </div>

      {selectedRow && (
        <div className="overview-editor">
          <div className="editor-head">
            <div className="editor-name">
              <strong>{selectedRow.name}</strong>
              <span className="mono">{selectedRow.studentNo}</span>
            </div>
            <button className="editor-close" onClick={() => setSelected(null)}>{Icon.x('var(--mute)', 14)}</button>
          </div>
          <div className="editor-buttons">
            {(['present', 'late', 'absent'] as AttendanceStatus[]).map((s) => (
              <button
                key={s}
                className={`editor-btn ${selectedRow.status === s ? `editor-btn-active editor-${s}` : ''}`}
                onClick={() => setStatus(selectedRow.studentId, s)}
              >
                {statusLabel(s)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overview-actions">
        <Button variant="ghost" className="ov-flex" onClick={() => navigate(`/sessions/${sessionId}/late`)}>
          {Icon.flag('var(--ink)', 16)} 지각 관리
        </Button>
        <Button className="ov-flex" onClick={exportCsv}>CSV 내보내기</Button>
      </div>
    </div>
  );
}

function LegendRow({ color, label, value, total }: { color: string; label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="ov-legend-row">
      <span className="ov-swatch" style={{ background: color }} />
      <span className="ov-legend-label">{label}</span>
      <span className="ov-legend-value mono">{value}</span>
      <span className="ov-legend-pct mono">{pct}%</span>
    </div>
  );
}

function RosterRowItem({ row, selected, onClick }: { row: RosterRow; selected: boolean; onClick: () => void }) {
  return (
    <button className={`roster-row ${selected ? 'roster-row-selected' : ''}`} onClick={onClick}>
      <Avatar name={row.name} tone="mute" />
      <div className="roster-info">
        <div className="roster-name-row">
          <span className="roster-name">{row.name}</span>
          <span className="roster-no mono">{row.studentNo}</span>
        </div>
        <div className="roster-meta mono">
          {row.checkedAt ? clock(row.checkedAt) : '—'}
          {row.method && ` · ${row.method}`}
        </div>
      </div>
      <Pill tone={statusTone(row.status)} dot>{statusLabel(row.status)}</Pill>
    </button>
  );
}
