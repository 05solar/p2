import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui';
import type { Role } from '../lib/types';

// 로그인 + (선택) 역할 가드
export function ProtectedRoute({ role }: { role?: Role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app-frame">
        <Spinner label="불러오는 중…" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (role && user.role !== role) {
    // 역할이 다르면 각자의 홈으로
    return <Navigate to={user.role === 'professor' ? '/lectures' : '/classes'} replace />;
  }
  return <Outlet />;
}
