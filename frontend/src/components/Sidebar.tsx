import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, BookOpen, FileCheck2, LineChart,
  CopyCheck, PlusCircle, Award, Terminal, Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user } = useAuth();
  if (!user) return null;

  const isFaculty = user.role === 'faculty';

  const studentLinks = [
    { id: 'student-dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'assignments', label: 'Assignments', icon: BookOpen },
    { id: 'submissions', label: 'My Submissions', icon: FileCheck2 },
    { id: 'student-analytics', label: 'Performance Analytics', icon: LineChart },
  ];

  const facultyLinks = [
    { id: 'faculty-dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
    { id: 'faculty-assignments', label: 'Manage Assignments', icon: BookOpen },
    { id: 'faculty-create-assignment', label: 'Create Assignment', icon: PlusCircle },
    { id: 'faculty-submissions', label: 'Student Submissions', icon: FileCheck2 },
    { id: 'faculty-similarity', label: 'Similarity & Integrity', icon: CopyCheck },
    { id: 'faculty-analytics', label: 'Class Analytics', icon: LineChart },
  ];

  const links = isFaculty ? facultyLinks : studentLinks;

  return (
    <aside className="w-64 border-r border-surface-800/80 bg-surface-950/60 p-4 flex flex-col justify-between hidden md:flex shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-surface-400 px-3 mb-2 font-semibold">
            {isFaculty ? 'Faculty Control Suite' : 'Student Workspace'}
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-brand-500/10 text-white border border-brand-500/30 shadow-sm shadow-brand-500/10'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-brand-400' : 'text-surface-500'}`} />
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Intelligence Status Card */}
        <div className="p-3.5 rounded-xl bg-surface-900/80 border border-surface-800/80 shadow-sm text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-brand-300 font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Active Assessment Engine</span>
          </div>
          <p className="text-surface-400 leading-relaxed text-[11px]">
            Real-time AST traversal, McCabe decision paths, and supervised ML error diagnosis active.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-surface-800/60 flex items-center justify-between text-[10px] font-mono text-surface-500 px-3">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Engine v1.2.0
        </span>
        <span>Isolated</span>
      </div>
    </aside>
  );
};
