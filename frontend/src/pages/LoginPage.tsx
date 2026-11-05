import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Lock, Mail, ArrowRight, Sparkles, Shield } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, quickLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onNavigate('student-dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (role: 'student' | 'faculty') => {
    setError('');
    setLoading(true);
    try {
      await quickLogin(role);
      onNavigate(role === 'faculty' ? 'faculty-dashboard' : 'student-dashboard');
    } catch (err: any) {
      setError('Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(99,102,241,0.18),rgba(255,255,255,0))]" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 mx-auto flex items-center justify-center shadow-xl shadow-brand-500/25">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Sign In to CodeIntel</h2>
          <p className="text-xs text-surface-400">University Automated Code Evaluation & Intelligence</p>
        </div>

        {/* 1-Click Fast Login Chips */}
        <div className="bg-surface-900 border border-surface-800 p-4 rounded-2xl space-y-2.5 shadow-lg">
          <p className="text-[11px] font-semibold uppercase text-surface-400 tracking-wider text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" /> 1-Click Major Project Demo Sign In
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuick('student')}
              className="p-2.5 bg-surface-950 hover:bg-surface-800 text-white rounded-xl border border-surface-700 font-medium transition text-left"
            >
              <span className="block font-semibold text-brand-300">Alex Chen</span>
              <span className="text-[10px] text-surface-400">Student Account</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuick('faculty')}
              className="p-2.5 bg-surface-950 hover:bg-surface-800 text-white rounded-xl border border-surface-700 font-medium transition text-left"
            >
              <span className="block font-semibold text-indigo-300 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Dr. Vance
              </span>
              <span className="text-[10px] text-surface-400">Faculty Account</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="bg-surface-900 border border-surface-800 p-6 rounded-2xl shadow-xl space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-surface-300 font-medium block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-surface-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.chen@university.edu"
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-surface-300 font-medium block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-surface-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold transition shadow-md shadow-brand-600/30 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2 text-[11px] text-surface-400">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-brand-400 hover:text-brand-300 font-semibold"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
