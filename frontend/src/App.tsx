import { useState, useEffect } from 'react';
// import { LoginPage } from './pages/LoginPage';
// import { RegisterPage } from './pages/RegisterPage';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CVBuilder } from './pages/CVBuilder';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

type Page = 'login' | 'register' | 'user-dashboard' | 'admin-dashboard' | 'cv-builder';

function App() {
  const { isAuthenticated, user, loadUser } = useAuthStore();
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);
  
  // Determine initial page based on auth state
  const getInitialPage = (): Page => {
    if (!isAuthenticated) return 'user-dashboard';
    if (user?.role === 'admin') return 'admin-dashboard';
    return 'user-dashboard';
  };

  const [currentPage, setCurrentPage] = useState<Page>(getInitialPage());

  // Sync page with auth state
  useEffect(() => {
    if (isAuthenticated && user) {
      if (currentPage === 'login' || currentPage === 'register') {
        setCurrentPage(user.role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
      }
    }
  }, [currentPage, isAuthenticated, user]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  // Render the current page
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
      case 'register':
        return <AuthDisabledNotice />;
      case 'user-dashboard':
        return <UserDashboard onNavigate={handleNavigate} />;
      case 'admin-dashboard':
        if (!isAuthenticated || user?.role !== 'admin') return <AuthDisabledNotice />;
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'cv-builder':
        if (!isAuthenticated) return <AuthDisabledNotice />;
        return <CVBuilder onNavigate={handleNavigate} />;
      default:
        return <AuthDisabledNotice />;
    }
  };

  return <>{renderPage()}</>;
}

function AuthDisabledNotice() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6 text-center dark:bg-gray-900">
      <p className="text-gray-700 dark:text-gray-200">
        Login and registration are temporarily disabled.
      </p>
    </main>
  );
}

export default App;
