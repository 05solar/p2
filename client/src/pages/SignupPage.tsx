import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { Button, Field } from '../components/ui';
import { Icon } from '../components/icons';
import type { Role } from '../lib/types';
import './SignupPage.css';

export function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('student');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    studentNo: '',
    employeeNo: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await register({ role, ...form });
      navigate(user.role === 'professor' ? '/lectures' : '/classes', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '회원가입에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-frame signup-page">
      <header className="signup-top">
        <button className="signup-back" onClick={() => navigate('/login')} aria-label="뒤로">
          {Icon.back('var(--ink)', 22)}
        </button>
        <span>회원가입</span>
      </header>

      <main className="signup-body fade-in">
        <h1 className="signup-headline">계정을 만들고<br />자동출석을 시작하세요</h1>

        <div className="role-toggle" role="tablist">
          <button
            className={role === 'student' ? 'is-active' : ''}
            onClick={() => setRole('student')}
            type="button"
          >
            학생
          </button>
          <button
            className={role === 'professor' ? 'is-active' : ''}
            onClick={() => setRole('professor')}
            type="button"
          >
            교수자
          </button>
        </div>

        <form className="signup-form" onSubmit={submit}>
          <Field label="이름" placeholder="홍길동" value={form.name} onChange={update('name')} />
          <Field
            label="이메일"
            type="email"
            inputMode="email"
            placeholder="name@university.ac.kr"
            value={form.email}
            onChange={update('email')}
          />
          {role === 'student' ? (
            <Field label="학번" placeholder="20211045" value={form.studentNo} onChange={update('studentNo')} />
          ) : (
            <Field label="교번 (선택)" placeholder="P100245" value={form.employeeNo} onChange={update('employeeNo')} />
          )}
          <Field label="학과 (선택)" placeholder="컴퓨터공학부" value={form.department} onChange={update('department')} />
          <Field
            label="비밀번호"
            type="password"
            placeholder="6자 이상"
            value={form.password}
            onChange={update('password')}
            hint="영문/숫자 조합 6자 이상을 권장합니다."
          />

          {error && <div className="signup-error">{error}</div>}

          <Button type="submit" size="lg" block disabled={busy}>
            {busy ? '가입 중…' : '가입하고 시작하기'}
          </Button>
        </form>

        <p className="signup-foot">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </main>
    </div>
  );
}
