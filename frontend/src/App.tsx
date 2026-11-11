import { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
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
    if (!isAuthenticated) return 'login';
    if (user?.role === 'admin') return 'admin-dashboard';
    return 'user-dashboard';
  };

  const [currentPage, setCurrentPage] = useState<Page>(getInitialPage());

  // Sync page with auth state and enforce page-level access rules
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentPage((previousPage) => {
        if (previousPage === 'login' || previousPage === 'register') return previousPage;
        return 'login';
      });
      return;
    }

    const nextPage = user?.role === 'admin' ? 'admin-dashboard' : 'user-dashboard';

    setCurrentPage((previousPage) => {
      if (previousPage === 'login' || previousPage === 'register') return nextPage;
      if (previousPage === 'admin-dashboard' && user?.role !== 'admin') return 'user-dashboard';
      if (previousPage === 'user-dashboard' && user?.role === 'admin') return 'admin-dashboard';
      return previousPage;
    });
  }, [isAuthenticated, user?.role]);

  const handleNavigate = (page: Page) => {
    if (!isAuthenticated && page !== 'login' && page !== 'register') {
      setCurrentPage('login');
      return;
    }

    if (page === 'admin-dashboard' && (!isAuthenticated || user?.role !== 'admin')) {
      setCurrentPage('login');
      return;
    }

    if (page === 'user-dashboard' && !isAuthenticated) {
      setCurrentPage('login');
      return;
    }

    setCurrentPage(page);
  };

  // Render the current page
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'user-dashboard':
        if (!isAuthenticated) return <LoginPage onNavigate={handleNavigate} />;
        return <UserDashboard onNavigate={handleNavigate} />;
      case 'admin-dashboard':
        if (!isAuthenticated || user?.role !== 'admin') return <LoginPage onNavigate={handleNavigate} />;
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'cv-builder':
        if (!isAuthenticated) return <LoginPage onNavigate={handleNavigate} />;
        return <CVBuilder onNavigate={handleNavigate} />;
      default:
        return <LoginPage onNavigate={handleNavigate} />;
    }
  };

  return <>{renderPage()}</>;
}

export default App;
