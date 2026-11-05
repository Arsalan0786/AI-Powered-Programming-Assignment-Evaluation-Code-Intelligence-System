import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FacultyAnalytics, Submission, Assignment
} from '../types';
import { analyticsService, submissionService, assignmentService } from '../services/api';
import {
  Users, BookOpen, FileCheck2, TrendingUp, AlertTriangle, ShieldCheck,
  PlusCircle, Search, CopyCheck, ArrowRight, BarChart3, Filter
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';

interface FacultyDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<FacultyAnalytics | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const [aData, subs, asgns] = await Promise.all([
          analyticsService.getFacultyAnalytics(),
          submissionService.list(),
          assignmentService.list()
        ]);
        setAnalytics(aData);
        setSubmissions(subs);
        setAssignments(asgns);
      } catch (err) {
        console.error("Failed to load faculty dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFacultyData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-surface-400">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm font-medium">Aggregating Class Analytics & Evaluation Registry...</span>
        </div>
      </div>
    );
  }

  const filteredSubmissions = submissions.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      (s.student_name && s.student_name.toLowerCase().includes(q)) ||
      (s.assignment_title && s.assignment_title.toLowerCase().includes(q)) ||
      s.language.toLowerCase().includes(q)
    );
  });

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-surface-900 to-surface-950 border border-indigo-500/25 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Faculty & Academic Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Academic Oversight & Code Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-surface-400 mt-1 max-w-2xl">
            Monitor class-wide programming competence, detect structural collusion, analyze algorithmic efficiency, and configure automated grading suites.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('faculty-similarity')}
            className="px-4 py-2 bg-surface-900 hover:bg-surface-800 text-white border border-surface-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <CopyCheck className="w-4 h-4 text-brand-400" />
            <span>Similarity Radar</span>
          </button>
          <button
            onClick={() => onNavigate('faculty-create-assignment')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Assignment</span>
          </button>
        </div>
      </div>

      {/* 5 High-Level Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-surface-900 border border-surface-800 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-medium text-surface-400">Total Enrolled</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">{analytics?.total_students || 3}</p>
          <span className="text-[10px] text-surface-500">Active students</span>
        </div>

        <div className="bg-surface-900 border border-surface-800 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-medium text-surface-400">Assignments</p>
          <p className="text-2xl font-bold font-mono text-brand-300 mt-1">{analytics?.total_assignments || assignments.length}</p>
          <span className="text-[10px] text-surface-500">Graded curricula</span>
        </div>

        <div className="bg-surface-900 border border-surface-800 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-medium text-surface-400">Total Submissions</p>
          <p className="text-2xl font-bold font-mono text-indigo-300 mt-1">{analytics?.total_submissions || submissions.length}</p>
          <span className="text-[10px] text-surface-500">Evaluated solutions</span>
        </div>

        <div className="bg-surface-900 border border-surface-800 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-medium text-surface-400">Class Average</p>
          <p className="text-2xl font-bold font-mono text-emerald-300 mt-1">{(analytics?.average_class_score || 0).toFixed(1)}</p>
          <span className="text-[10px] text-surface-500">Score / 100</span>
        </div>

        <div className="bg-surface-900 border border-surface-800 p-4 rounded-xl shadow-sm col-span-2 md:col-span-1">
          <p className="text-[11px] font-medium text-surface-400">Pending Evals</p>
          <p className="text-2xl font-bold font-mono text-teal-300 mt-1">{analytics?.pending_evaluations || 0}</p>
          <span className="text-[10px] text-surface-500">Queue status</span>
        </div>
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Chart */}
        <div className="bg-surface-900 border border-surface-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Class Grade Distribution</span>
              </h3>
              <p className="text-xs text-surface-400">Distribution of evaluated student submissions across score brackets</p>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.score_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bracket" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Bar dataKey="count" name="Submissions" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Common Programming Errors Bar Chart */}
        <div className="bg-surface-900 border border-surface-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Common Machine-Classified Defect Patterns</span>
              </h3>
              <p className="text-xs text-surface-400">Most frequent errors identified by the supervised ML classifier</p>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={analytics?.common_errors || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" allowDecimals={false} stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis dataKey="error" type="category" stroke="#64748b" width={140} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Bar dataKey="count" name="Frequency" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Submission Registry Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-surface-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Student Submission Registry</h3>
            <p className="text-xs text-surface-400">Inspect full test case traces, static quality score, and Big-O complexity bounds</p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-surface-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, assignment..."
              className="w-full bg-surface-950 border border-surface-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-surface-300">
            <thead className="bg-surface-950/80 text-surface-400 uppercase tracking-wider text-[11px] font-semibold border-b border-surface-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Assignment</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Final Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {filteredSubmissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-surface-800/40 transition">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {sub.student_name || `Student ID #${sub.student_id}`}
                  </td>
                  <td className="py-3.5 px-4 text-surface-300">
                    {sub.assignment_title || `Assignment #${sub.assignment_id}`}
                  </td>
                  <td className="py-3.5 px-4 font-mono uppercase text-indigo-400">
                    {sub.language}
                  </td>
                  <td className="py-3.5 px-4 text-surface-400 font-mono">
                    {new Date(sub.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {sub.final_score.toFixed(1)} / 100
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      sub.final_score >= 85 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                      sub.final_score >= 60 ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                      'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onNavigate('evaluation', { submissionId: sub.id })}
                      className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold transition border border-indigo-500/30"
                    >
                      Inspect Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
