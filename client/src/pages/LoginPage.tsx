import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { Button, Field, Toggle } from '../components/ui';
import './LoginPage.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keep, setKeep] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      navigate(user.role === 'professor' ? '/lectures' : '/classes', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '로그인에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (role: 'student' | 'professor') => {
    setEmail(role === 'student' ? 'student@demo.com' : 'prof@demo.com');
    setPassword('demo1234');
  };

  return (
    <div className="app-frame login-page">
      <main className="login-body fade-in">
        <div className="login-logo">
          <img src="/symbolmark.png" alt="자동출석" />
        </div>
        <h1 className="login-headline">
          안녕하세요,
          <br />
          학교 계정으로 로그인하세요
        </h1>
        <p className="login-subtitle">자동출석 · 위치 · 블루투스로 빠르게</p>

        <form className="login-form" onSubmit={submit}>
          <Field
            label="이메일"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder="name@university.ac.kr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="비밀번호"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="login-keep">
            <span>자동 로그인</span>
            <Toggle on={keep} onToggle={() => setKeep(!keep)} />
          </label>

          {error && <div className="login-error">{error}</div>}

          <Button type="submit" size="lg" block disabled={busy}>
            {busy ? '로그인 중…' : '로그인'}
          </Button>
        </form>

        <div className="login-demo">
          <span>데모 계정으로 빠르게 둘러보기</span>
          <div className="login-demo-btns">
            <button type="button" onClick={() => fillDemo('student')}>학생 데모</button>
            <button type="button" onClick={() => fillDemo('professor')}>교수자 데모</button>
          </div>
        </div>

        <p className="login-foot">
          아직 계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </main>
    </div>
  );
}
