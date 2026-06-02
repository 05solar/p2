import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TabLayout } from './components/TabLayout';

import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ClassesPage } from './pages/ClassesPage';
import { AttendPage } from './pages/AttendPage';
import { MyPage } from './pages/MyPage';
import { LecturesPage } from './pages/LecturesPage';
import { LiveSessionPage } from './pages/LiveSessionPage';
import { OverviewPage } from './pages/OverviewPage';
import { LatePage } from './pages/LatePage';

// 로그인 상태/역할에 맞는 홈으로 보내는 루트
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'professor' ? '/lectures' : '/classes'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* 공개 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* 로그인 필요 */}
      <Route element={<ProtectedRoute />}>
        {/* 하단 탭이 있는 메인 화면 */}
        <Route element={<TabLayout />}>
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/lectures" element={<LecturesPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>

        {/* 학생 상세 플로우 */}
        <Route path="/attend/:lectureId" element={<AttendPage />} />

        {/* 교수자 상세 플로우 */}
        <Route path="/lectures/:lectureId/live" element={<LiveSessionPage />} />
        <Route path="/sessions/:sessionId/overview" element={<OverviewPage />} />
        <Route path="/sessions/:sessionId/late" element={<LatePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
