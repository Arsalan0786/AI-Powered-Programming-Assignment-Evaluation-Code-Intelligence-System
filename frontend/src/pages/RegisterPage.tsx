import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Lock, Mail, User, School, ArrowRight } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        email,
        password,
        full_name: fullName,
        role,
        student_id_number: role === 'student' ? identifier : undefined,
        employee_id: role === 'faculty' ? identifier : undefined,
        department
      });
      onNavigate(role === 'faculty' ? 'faculty-dashboard' : 'student-dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 mx-auto flex items-center justify-center shadow-xl shadow-brand-500/25">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Register Account</h2>
          <p className="text-xs text-surface-400">Join the AI Code Assessment Platform</p>
        </div>

        <div className="bg-surface-900 border border-surface-800 p-6 rounded-2xl shadow-xl space-y-4">
          {/* Role Toggle */}
          <div className="grid grid-cols-2 p-1 bg-surface-950 rounded-xl border border-surface-800 text-xs">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`py-2 rounded-lg font-semibold transition ${
                role === 'student' ? 'bg-brand-600 text-white shadow-md' : 'text-surface-400 hover:text-white'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('faculty')}
              className={`py-2 rounded-lg font-semibold transition ${
                role === 'faculty' ? 'bg-indigo-600 text-white shadow-md' : 'text-surface-400 hover:text-white'
              }`}
            >
              Faculty / Admin
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="text-surface-300 font-medium block mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-surface-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-surface-300 font-medium block mb-1">University Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-surface-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-surface-300 font-medium block mb-1">
                {role === 'student' ? 'Student Registration ID' : 'Faculty Employee ID'}
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-surface-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={role === 'student' ? 'STU-2024-009' : 'FAC-ENG-204'}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-surface-300 font-medium block mb-1">Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 text-xs"
              />
            </div>

            <div>
              <label className="text-surface-300 font-medium block mb-1">Password</label>
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
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold transition shadow-md shadow-brand-600/30 flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="text-center pt-2 text-[11px] text-surface-400">
            Already registered?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-brand-400 hover:text-brand-300 font-semibold"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
