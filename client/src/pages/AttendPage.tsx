import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, post, ApiError } from '../lib/api';
import type { ActiveSession, CheckinResult } from '../lib/types';
import { mmss } from '../lib/format';
import { PageHeader } from '../components/PageHeader';
import { Button, Spinner } from '../components/ui';
import { Face } from '../components/Face';
import { Icon } from '../components/icons';
import './AttendPage.css';

type Phase = 'idle' | 'scanning' | 'ok' | 'fail';
type Device = { bluetooth: boolean; location: boolean; network: boolean };

export function AttendPage() {
  const { lectureId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [device, setDevice] = useState<Device>({ bluetooth: true, location: true, network: true });
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState('');
  const [codeMsg, setCodeMsg] = useState('');
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    get<{ session: ActiveSession | null }>(`/lectures/${lectureId}/sessions/active`)
      .then((r) => {
        setSession(r.session);
        if (r.session?.myStatus === 'present' || r.session?.myStatus === 'late') {
          setPhase('ok');
          setResult({ result: 'ok', status: r.session.myStatus, message: '이미 출석 처리된 수업입니다.' });
        }
      })
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : '불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [lectureId]);

  // 남은 시간 카운트다운
  useEffect(() => {
    if (!session) return;
    const started = new Date(session.startedAt).getTime();
    const endMs = started + session.absentAfterMin * 60000;
    const update = () => setRemaining(Math.max(0, Math.floor((endMs - Date.now()) / 1000)));
    update();
    tickRef.current = window.setInterval(update, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [session]);

  const runCheckin = async (method: 'auto' | 'code' | 'qr', extra?: { code?: string }) => {
    if (!session) return;
    setPhase('scanning');
    try {
      // 자동 출석은 비콘 스캔 연출을 위해 약간의 지연
      if (method === 'auto') await new Promise((r) => setTimeout(r, 1200));
      const res = await post<CheckinResult>(`/sessions/${session.id}/checkin`, {
        method,
        device,
        code: extra?.code,
      });
      setResult(res);
      setPhase(res.result === 'ok' ? 'ok' : 'fail');
    } catch (e) {
      setResult({ result: 'fail', message: e instanceof ApiError ? e.message : '출석에 실패했습니다.' });
      setPhase('fail');
    }
  };

  const submitCode = async () => {
    setCodeMsg('');
    if (!session) return;
    const res = await post<CheckinResult>(`/sessions/${session.id}/checkin`, {
      method: 'code',
      code: code.trim(),
    }).catch((e) => ({ result: 'fail', message: e instanceof ApiError ? e.message : '실패' } as CheckinResult));
    if (res.result === 'ok') {
      setShowCode(false);
      setResult(res);
      setPhase('ok');
    } else {
      setCodeMsg(res.message);
    }
  };

  if (loading) {
    return (
      <div className="app-frame">
        <PageHeader title="자동 출석" back />
        <Spinner label="출석 정보를 불러오는 중…" />
      </div>
    );
  }

  if (loadError || !session) {
    return (
      <div className="app-frame">
        <PageHeader title="자동 출석" back onBack={() => navigate('/classes')} />
        <div className="attend-empty">
          <Face size={92} mood="idle" fg="var(--faint)" />
          <strong>진행 중인 출석이 없습니다</strong>
          <span>{loadError || '교수자가 출석을 시작하면 이곳에서 출석할 수 있어요.'}</span>
          <Button variant="ghost" onClick={() => navigate('/classes')}>수업 목록으로</Button>
        </div>
      </div>
    );
  }

  // ── 성공 화면 (S4) ──────────────────────────────────────
  if (phase === 'ok') {
    const late = result?.status === 'late';
    return (
      <div className="app-frame attend-result fade-in">
        <PageHeader title="" back onBack={() => navigate('/classes')} />
        <div className="result-body">
          <div className={`result-face ${late ? 'result-face-warn' : 'result-face-ok'}`}>
            <Face size={132} mood="happy" fg="#fff" />
          </div>
          <h2 className="result-title">{late ? '지각 출석 완료' : '출석 완료'}</h2>
          <p className="result-desc">
            {session.lecture.name} 강의에<br />
            {late ? '지각으로' : '정상'} 출석 처리되었습니다.
          </p>
        </div>
        <div className="result-actions">
          <Button size="lg" block onClick={() => navigate('/classes')}>확인</Button>
          <button className="result-link" onClick={() => navigate('/mypage')}>전체 출결 현황 보기</button>
        </div>
      </div>
    );
  }

  // ── 실패 화면 (S5) ──────────────────────────────────────
  if (phase === 'fail') {
    const offline = result?.offline || [];
    const rows: { icon: (c?: string, s?: number) => ReactNode; label: string; off: boolean }[] = [
      { icon: Icon.bt, label: '블루투스', off: offline.includes('블루투스') },
      { icon: Icon.pin, label: '위치', off: offline.includes('위치') },
      { icon: Icon.wifi, label: '네트워크', off: offline.includes('네트워크') },
    ];
    return (
      <div className="app-frame attend-result fade-in">
        <PageHeader sub={`${session.lecture.code} · ${session.lecture.name}`} title="" back onBack={() => navigate('/classes')} />
        <div className="result-body result-body-fail">
          <div className="result-face result-face-fail">
            <Face size={104} mood="sad" fg="#fff" />
          </div>
          <h2 className="result-title">출석 실패</h2>
          <p className="result-desc">{result?.message}</p>

          <div className="fail-rows">
            {rows.map((r) => (
              <div className="fail-row" key={r.label}>
                <span className={`fail-ic ${r.off ? 'fail-ic-off' : 'fail-ic-ok'}`}>
                  {r.icon(r.off ? 'var(--danger)' : 'var(--ok)', 18)}
                </span>
                <div className="fail-row-text">
                  <strong>{r.label} {r.off ? '꺼짐' : '정상'}</strong>
                  <span>{r.off ? '설정에서 켜고 다시 시도해 주세요' : '확인되었습니다'}</span>
                </div>
                {r.off && (
                  <button
                    className="fail-fix"
                    onClick={() => setDevice((d) => ({ ...d, [r.label === '블루투스' ? 'bluetooth' : r.label === '위치' ? 'location' : 'network']: true }))}
                  >
                    켜기
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="result-actions">
          <Button size="lg" block onClick={() => { setPhase('idle'); setResult(null); }}>
            {Icon.refresh('#fff', 18)} 다시 시도
          </Button>
          <Button variant="ghost" block onClick={() => setShowCode(true)}>QR / 인증번호로 출석</Button>
        </div>
        {showCode && (
          <CodeSheet
            code={code}
            setCode={setCode}
            msg={codeMsg}
            onClose={() => setShowCode(false)}
            onSubmit={submitCode}
          />
        )}
      </div>
    );
  }

  // ── 출석 진행 화면 (S3) ─────────────────────────────────
  const scanning = phase === 'scanning';
  return (
    <div className="app-frame attend-page">
      <PageHeader
        sub={`${session.lecture.code} · ${session.lecture.name}`}
        title="자동 출석"
        back
        onBack={() => navigate('/classes')}
      />
      <div className="attend-body">
        <div className="attend-timer">
          <span>출석 종료까지</span>
          <span className="mono">{remaining > 0 ? mmss(remaining) : '마감'}</span>
        </div>

        <div className="attend-center">
          <button
            className={`orb ${scanning ? 'orb-scanning' : ''}`}
            onClick={() => !scanning && runCheckin('auto')}
            disabled={scanning || remaining <= 0}
          >
            <span className="orb-ripple" />
            <span className="orb-soft" />
            <span className="orb-core">
              {scanning ? <Face size={180} mood="idle" fg="#fff" opacity={0.75} /> : <span className="orb-label">자동{'\n'}출석</span>}
            </span>
          </button>
          <div className="attend-headline">
            {scanning ? '주변 기기 확인 중…' : remaining <= 0 ? '출석이 마감되었습니다' : '버튼을 눌러 자동 출석'}
          </div>
          <div className="attend-desc">
            {scanning
              ? '비콘 신호를 수집하고 있어요. 강의실 안에서 잠시 기다려 주세요.'
              : '블루투스 비콘과 강의실 위치로 자동 인증합니다.'}
          </div>
        </div>

        <div className="attend-chips">
          <DeviceChip icon={Icon.bt} label="블루투스" on={device.bluetooth} onClick={() => setDevice((d) => ({ ...d, bluetooth: !d.bluetooth }))} />
          <DeviceChip icon={Icon.pin} label="위치" on={device.location} onClick={() => setDevice((d) => ({ ...d, location: !d.location }))} />
          <DeviceChip icon={Icon.wifi} label="네트워크" on={device.network} onClick={() => setDevice((d) => ({ ...d, network: !d.network }))} />
        </div>

        <div className="attend-secondary">
          <button className="secondary-btn" onClick={() => setShowCode(true)}>
            {Icon.qr('var(--ink)', 18)} QR 코드
          </button>
          <button className="secondary-btn" onClick={() => setShowCode(true)}>
            {Icon.keypad('var(--ink)', 18)} 인증번호
          </button>
        </div>
      </div>

      {showCode && (
        <CodeSheet
          code={code}
          setCode={setCode}
          msg={codeMsg}
          onClose={() => setShowCode(false)}
          onSubmit={submitCode}
        />
      )}
    </div>
  );
}

function DeviceChip({
  icon,
  label,
  on,
  onClick,
}: {
  icon: (c?: string, s?: number) => ReactNode;
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button className={`device-chip ${on ? '' : 'device-chip-off'}`} onClick={onClick}>
      <div className="device-chip-top">
        {icon(on ? 'var(--ink2)' : 'var(--danger)', 16)}
        <span className={`device-dot ${on ? 'device-dot-on' : 'device-dot-off'}`} />
      </div>
      <div className="device-chip-label">{label}</div>
      <div className={`device-chip-state ${on ? '' : 'off'}`}>{on ? '연결됨' : '꺼짐'}</div>
    </button>
  );
}

function CodeSheet({
  code,
  setCode,
  msg,
  onClose,
  onSubmit,
}: {
  code: string;
  setCode: (v: string) => void;
  msg: string;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h3 className="sheet-title">인증번호로 출석</h3>
        <p className="sheet-sub">교수자 화면에 표시된 6자리 인증번호를 입력하세요.</p>
        <input
          className="sheet-input code-input"
          placeholder="000000"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          autoFocus
        />
        {msg && <div className="sheet-msg">{msg}</div>}
        <div className="sheet-actions">
          <Button variant="ghost" block onClick={onClose}>취소</Button>
          <Button block onClick={onSubmit} disabled={code.length < 6}>출석하기</Button>
        </div>
      </div>
    </div>
  );
}
