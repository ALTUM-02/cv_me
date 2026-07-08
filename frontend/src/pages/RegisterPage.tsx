import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { sendOTPEmail, generateOTP } from '../utils/email';
import { ThemeToggle } from '../components/ui/ThemeToggle';

interface RegisterPageProps {
  onNavigate: (page: 'login' | 'register' | 'user-dashboard' | 'admin-dashboard' | 'cv-builder') => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { isAuthenticated, user, loadUser, sendOtp, registerWithOtp } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (isAuthenticated && user) {
      onNavigate('user-dashboard');
    }
  }, [isAuthenticated, user, onNavigate]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateDetails = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDetails()) return;

    setIsLoading(true);
    setErrors({});
    setSuccess('');

    // Generate OTP code on frontend
    const code = generateOTP();

    // Store OTP in backend
    const backendResult = await sendOtp(formData.email, code);
    
    if (!backendResult.success) {
      setIsLoading(false);
      setErrors({ email: backendResult.message });
      return;
    }

    // Send OTP via email API
    await sendOTPEmail(formData.email, code);

    setIsLoading(false);
    setStep('otp');
    setSuccess('Verification code sent to your email! Check your inbox.');
    setCountdown(60);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const result = await registerWithOtp({
      email: formData.email,
      code: otp,
      firstName: formData.firstName,
      lastName: formData.lastName,
      password: formData.password,
    });

    setIsLoading(false);

    if (result.success) {
      setSuccess('Account created successfully! Redirecting...');
      // The useEffect above will handle navigation to user-dashboard
    } else {
      setErrors({ otp: result.message });
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setErrors({});
    setSuccess('');
    setIsLoading(true);

    const code = generateOTP();

    const backendResult = await sendOtp(formData.email, code);
    
    if (!backendResult.success) {
      setIsLoading(false);
      setErrors({ email: backendResult.message });
      return;
    }

    await sendOTPEmail(formData.email, code);

    setIsLoading(false);
    setSuccess('New verification code sent to your email!');
    setCountdown(60);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-cyan-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300 dark:bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-300 dark:bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-10 animate-fadeInDown">
          <div className="w-20 h-20 bg-linear-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <svg className="w-11 h-11 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-black text-gray-950 dark:text-white mb-3 tracking-tight">ResumeForge</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-light">Join thousands creating amazing CVs</p>
        </div>

        {/* Register Card */}
        <div className="bg-white/85 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/80 dark:border-gray-700/50 transition-all duration-300 animate-fadeInUp hover:border-emerald-200 dark:hover:border-gray-600/80">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-950 dark:text-white mb-2">Get started</h2>
            <div className="h-1 w-12 bg-linear-to-r from-emerald-500 to-teal-600 rounded-full"></div>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-300 text-sm flex items-start gap-3 animate-shake">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errors.general}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-2xl text-emerald-300 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Step 1: Enter Details */}
          {step === 'details' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">First Name</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl opacity-0 group-focus-within:opacity-75 transition-all duration-300 blur"></div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`relative w-full px-4 py-3 border rounded-2xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 ${errors.firstName ? 'border-red-500' : 'border-gray-600'}`}
                      placeholder="John"
                    />
                  </div>
                  {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">Last Name</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl opacity-0 group-focus-within:opacity-75 transition-all duration-300 blur"></div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`relative w-full px-4 py-3 border rounded-2xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 ${errors.lastName ? 'border-red-500' : 'border-gray-600'}`}
                      placeholder="Doe"
                    />
                  </div>
                  {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl opacity-0 group-focus-within:opacity-75 transition-all duration-300 blur"></div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`relative w-full px-4 py-3 border rounded-2xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 ${errors.email ? 'border-red-500' : 'border-gray-600'}`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl opacity-0 group-focus-within:opacity-75 transition-all duration-300 blur"></div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`relative w-full px-4 py-3 border rounded-2xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 ${errors.password ? 'border-red-500' : 'border-gray-600'}`}
                    placeholder="At least 6 characters"
                  />
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl opacity-0 group-focus-within:opacity-75 transition-all duration-300 blur"></div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`relative w-full px-4 py-3 border rounded-2xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'}`}
                    placeholder="Re-enter your password"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/50"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Verification Code...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Verification Code
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/50">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-300">\n                  We sent a verification code to<br />\n                  <span className="font-semibold text-white">{formData.email}</span>\n                </p>\n              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-200">Verification Code</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl opacity-0 group-focus-within:opacity-75 transition-all duration-300 blur"></div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={`relative w-full px-4 py-4 border rounded-2xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-center text-3xl tracking-[0.5em] font-mono ${errors.otp ? 'border-red-500' : 'border-gray-600'}`}
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                {errors.otp && <p className="mt-1 text-xs text-red-400 text-center">{errors.otp}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-4 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/50"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verify & Create Account
                  </>
                )}
              </button>

              <div className="flex justify-between items-center gap-4 text-sm">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isLoading}
                  className="text-emerald-400 hover:text-emerald-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('details'); setOtp(''); setErrors({}); setSuccess(''); }}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  ← Edit details
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-gray-700/50">
            <p className="text-center text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors duration-300"
              >
                Sign in here
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
