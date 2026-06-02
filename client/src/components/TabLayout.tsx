import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon } from './icons';
import './TabLayout.css';

// 하단 탭 네비게이션 + 페이지 아웃렛 (학생/교수자 메인 탭 공통)
export function TabLayout() {
  const { user } = useAuth();
  const home = user?.role === 'professor'
    ? { to: '/lectures', label: '강의', icon: Icon.home }
    : { to: '/classes', label: '수업', icon: Icon.home };

  return (
    <div className="app-frame">
      <div className="tab-outlet">
        <Outlet />
      </div>
      <nav className="bottom-nav" aria-label="하단 탭">
        <NavLink to={home.to} className="bottom-tab">
          {({ isActive }) => (
            <>
              {home.icon(isActive ? 'var(--brand)' : 'var(--faint)', 23)}
              <span style={{ color: isActive ? 'var(--brand)' : 'var(--faint)' }}>{home.label}</span>
            </>
          )}
        </NavLink>
        <NavLink to="/mypage" className="bottom-tab">
          {({ isActive }) => (
            <>
              {Icon.user(isActive ? 'var(--brand)' : 'var(--faint)', 23)}
              <span style={{ color: isActive ? 'var(--brand)' : 'var(--faint)' }}>마이</span>
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}
