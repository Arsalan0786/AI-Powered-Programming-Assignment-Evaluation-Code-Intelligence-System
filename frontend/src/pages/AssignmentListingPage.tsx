import React, { useState, useEffect } from 'react';
import { Assignment } from '../types';
import { assignmentService } from '../services/api';
import { BookOpen, Clock, HardDrive, ArrowRight, Search, Filter } from 'lucide-react';

interface AssignmentListingPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AssignmentListingPage: React.FC<AssignmentListingPageProps> = ({ onNavigate }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await assignmentService.list();
        setAssignments(data);
      } catch (err) {
        console.error("Failed to load assignments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const filtered = assignments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === 'ALL' || a.difficulty.toUpperCase() === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-surface-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Programming Assignments</h1>
          <p className="text-xs sm:text-sm text-surface-400 mt-1">
            Browse and solve algorithmic tasks evaluated against automated suites, static parsers, and complexity detectors.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-surface-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or topic..."
              className="w-full bg-surface-900 border border-surface-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-surface-900 border border-surface-800 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center text-surface-400 text-xs">
          Loading course assignments...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((asg) => (
            <div
              key={asg.id}
              className="bg-surface-900 border border-surface-800 rounded-2xl p-6 flex flex-col justify-between hover:border-brand-500/40 transition shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    asg.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    asg.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {asg.difficulty}
                  </span>
                  <span className="text-xs text-surface-400 font-mono">
                    {asg.test_case_count} Test Suites
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition">
                  {asg.title}
                </h3>

                <p className="text-xs text-surface-400 line-clamp-3 leading-relaxed">
                  {asg.description}
                </p>

                {/* Languages Allowed */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(asg.allowed_languages || ['python', 'cpp', 'java', 'javascript']).map((lang) => (
                    <span
                      key={lang}
                      className="px-2 py-0.5 bg-surface-950 text-surface-300 rounded text-[10px] uppercase font-mono border border-surface-800"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-surface-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-surface-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-surface-500" />
                    {asg.max_time_limit_sec}s
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <HardDrive className="w-3.5 h-3.5 text-surface-500" />
                    {asg.max_memory_limit_mb}MB
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('assignment-detail', { assignmentId: asg.id })}
                    className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-xl text-xs font-semibold transition"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onNavigate('workspace', { assignmentId: asg.id })}
                    className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-brand-600/25 flex items-center gap-1"
                  >
                    <span>Solve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
