import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, BookOpen, Code2, LineChart, FileCheck2,
  Users, CopyCheck, PlusCircle, Settings, Award
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
    <aside className="w-64 border-r border-surface-800 bg-surface-950/60 p-4 flex flex-col justify-between hidden md:flex shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider px-3 mb-2">
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30 shadow-sm'
                      : 'text-surface-400 hover:text-white hover:bg-surface-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-brand-400' : 'text-surface-400'}`} />
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Feature Highlights Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-surface-900 to-surface-950 border border-surface-800 text-xs">
          <div className="flex items-center gap-2 text-brand-400 font-semibold mb-1.5">
            <Award className="w-4 h-4" />
            <span>AI Code Intelligence</span>
          </div>
          <p className="text-surface-400 leading-relaxed text-[11px]">
            Real-time evaluation with AST static analysis, Big-O estimation, and ML error classification.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-surface-800 text-surface-500 text-[11px] px-3">
        System Build v1.2.0 • Online Judge Active
      </div>
    </aside>
  );
};
