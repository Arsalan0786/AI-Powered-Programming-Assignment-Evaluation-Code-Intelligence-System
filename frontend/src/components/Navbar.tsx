import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { Shield, LogOut, Sparkles, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, logout, quickLogin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-800/80 bg-surface-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate(user ? (user.role === 'faculty' ? 'faculty-dashboard' : 'student-dashboard') : 'landing')}
          className="cursor-pointer group flex items-center"
        >
          <Logo size="md" />
        </div>

        {/* Demo Fast Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Quick Demo Switcher */}
              <div className="hidden md:flex items-center gap-1.5 bg-surface-900/90 border border-surface-800 rounded-xl p-1 text-xs shadow-inner-subtle">
                <span className="text-surface-400 px-2.5 flex items-center gap-1.5 text-[11px] font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Switch Role:
                </span>
                <button
                  onClick={() => quickLogin('student')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    user.role === 'student'
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 ring-1 ring-brand-400/40'
                      : 'text-surface-300 hover:text-white hover:bg-surface-800/50'
                  }`}
                >
                  Student (Alex)
                </button>
                <button
                  onClick={() => quickLogin('faculty')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    user.role === 'faculty'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                      : 'text-surface-300 hover:text-white hover:bg-surface-800/50'
                  }`}
                >
                  Faculty (Dr. Vance)
                </button>
              </div>

              {/* User Chip */}
              <div className="flex items-center gap-3 pl-3 border-l border-surface-800/80">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-white leading-tight">{user.full_name}</p>
                  <p className="text-[10px] text-brand-400 font-mono capitalize tracking-wide flex items-center justify-end gap-1 mt-0.5">
                    {user.role === 'faculty' && <Shield className="w-3 h-3 text-indigo-400" />}
                    {user.role} Portal
                  </p>
                </div>
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`}
                  alt={user.full_name}
                  className="w-8 h-8 rounded-full ring-1 ring-white/10 bg-surface-900 object-cover"
                />
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-surface-400 hover:text-rose-400 hover:bg-surface-900 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onNavigate('login')}
                className="px-3.5 py-1.5 text-xs text-surface-300 hover:text-white font-medium transition rounded-lg hover:bg-surface-900/60"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-1.5 text-xs bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg shadow-md shadow-brand-600/25 transition ring-1 ring-brand-400/30"
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
