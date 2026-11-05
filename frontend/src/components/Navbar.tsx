import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Shield, LogOut, User as UserIcon, Sparkles } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, logout, quickLogin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-800 bg-surface-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onNavigate(user ? (user.role === 'faculty' ? 'faculty-dashboard' : 'student-dashboard') : 'landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">CodeIntel</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-500/20 text-brand-300 rounded border border-brand-500/30">AI-JUDGE</span>
            </div>
            <p className="text-[11px] text-surface-400 hidden sm:block">Automated Code Intelligence & Assessment</p>
          </div>
        </div>

        {/* Demo Fast Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Quick Demo Switcher */}
              <div className="hidden md:flex items-center gap-1.5 bg-surface-900 border border-surface-800 rounded-lg p-1 text-xs">
                <span className="text-surface-400 px-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Switch Role:
                </span>
                <button
                  onClick={() => quickLogin('student')}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    user.role === 'student' ? 'bg-brand-600 text-white' : 'text-surface-300 hover:text-white'
                  }`}
                >
                  Student (Alex)
                </button>
                <button
                  onClick={() => quickLogin('faculty')}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    user.role === 'faculty' ? 'bg-indigo-600 text-white' : 'text-surface-300 hover:text-white'
                  }`}
                >
                  Faculty (Dr. Vance)
                </button>
              </div>

              {/* User Chip */}
              <div className="flex items-center gap-3 pl-2 border-l border-surface-800">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-white leading-none">{user.full_name}</p>
                  <p className="text-[11px] text-brand-400 capitalize mt-1 flex items-center justify-end gap-1">
                    {user.role === 'faculty' && <Shield className="w-3 h-3 text-indigo-400" />}
                    {user.role}
                  </p>
                </div>
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`}
                  alt={user.full_name}
                  className="w-9 h-9 rounded-full ring-2 ring-brand-500/40 bg-surface-800"
                />
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-surface-400 hover:text-red-400 hover:bg-surface-900 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 text-sm text-surface-300 hover:text-white font-medium transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg shadow-md shadow-brand-600/30 transition"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
