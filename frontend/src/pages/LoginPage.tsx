import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { ThemeToggle } from '../components/ui/ThemeToggle';

interface LoginPageProps {
  onNavigate: (page: 'login' | 'register' | 'user-dashboard' | 'admin-dashboard' | 'cv-builder') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, isAuthenticated, user, loadUser } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        onNavigate('admin-dashboard');
      } else {
        onNavigate('user-dashboard');
      }
    }
  }, [isAuthenticated, user, onNavigate]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      // The useEffect above will handle navigation based on user role
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 dark:bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-sky-300 dark:bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-10 animate-fadeInDown">
          <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <svg className="w-11 h-11 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-black text-gray-950 dark:text-white mb-3 tracking-tight">ResumeForge</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-light">Build your professional CV with ease</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/85 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/80 dark:border-gray-700/50 transition-all duration-300 animate-fadeInUp hover:border-blue-200 dark:hover:border-gray-600/80">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-950 dark:text-white mb-2">Welcome back</h2>
            <div className="h-1 w-12 bg-linear-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-300 text-sm flex items-start gap-3 animate-shake">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-indigo-600 rounded-2xl opacity-0 group-focus-within:opacity-75 transition-all duration-300 blur"></div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative w-full px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Password</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-indigo-600 rounded-2xl opacity-0 group-focus-within:opacity-75 transition-all duration-300 blur"></div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative w-full px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700/50">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-blue-400 hover:text-blue-300 font-bold transition-colors duration-300"
              >
                Create one now
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out 0.1s both;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};
