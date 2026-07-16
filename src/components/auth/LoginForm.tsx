import React, { useState } from 'react';
import { Mail, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function LoginForm() {
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLocalIsLoading(true);
    const success = await login(email);

    if (!success) {
      setError('No active account found for that email');
    }
    setLocalIsLoading(false);
  };

  const inputBase = `block w-full pl-11 pr-4 py-3 rounded-full text-sm outline-none transition-colors ${
    isDarkMode
      ? 'bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:border-emerald-500'
      : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-emerald-500'
  }`;

  return (
    <div
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
        isDarkMode ? 'bg-gray-900' : ''
      }`}
      style={!isDarkMode ? { backgroundColor: '#f2f4f0' } : undefined}
    >
      <div className="max-w-md w-full">
        <div className={`rounded-3xl p-8 md:p-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-700 flex items-center justify-center shadow-sm mb-5">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h2
              className={`text-3xl font-bold tracking-tight mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Welcome back
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Sign in to VIZ Manager to continue.
            </p>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`}>
              Password temporarily disabled — sign in with email only.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div
                className={`rounded-2xl p-3.5 flex items-center gap-2.5 border ${
                  isDarkMode ? 'bg-red-900/40 border-red-800' : 'bg-red-50 border-red-100'
                }`}
              >
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                <span className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputBase}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-emerald-700 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={localIsLoading}
              className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm hover:shadow transition-all ${
                localIsLoading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {localIsLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>

        <p className={`text-center text-xs mt-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Access your client projects, audits, and analytics.
        </p>
      </div>
    </div>
  );
}
