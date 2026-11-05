import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  StudentAnalytics, Assignment, Submission
} from '../types';
import { analyticsService, assignmentService, submissionService } from '../services/api';
import {
  BookOpen, Award, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  Sparkles, TrendingUp, Cpu, GraduationCap, ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

interface StudentDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aData, asgns, subs] = await Promise.all([
          analyticsService.getStudentAnalytics(),
          assignmentService.list(),
          submissionService.list()
        ]);
        setAnalytics(aData);
        setAssignments(asgns);
        setSubmissions(subs);
      } catch (err) {
        console.error("Failed to load student dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-surface-400">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading Student Workspace & Diagnostics...</span>
        </div>
      </div>
    );
  }

  const chartData = analytics?.score_progression && analytics.score_progression.length > 0
    ? analytics.score_progression
    : [
        { date: 'Initial', score: 75, correctness: 80, quality: 70 },
        { date: 'Midterm', score: 88, correctness: 90, quality: 85 },
        { date: 'Current', score: 96, correctness: 100, quality: 92 },
      ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900/40 via-surface-900 to-surface-950 border border-brand-500/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-brand-500/20 text-brand-300 rounded-full border border-brand-500/30 uppercase tracking-wider">
              Student Assessment Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-surface-400 mt-1 max-w-xl">
            Track your automated evaluation results, algorithmic complexity reports, and AI-recommended learning paths.
          </p>
        </div>

        <button
          onClick={() => onNavigate('assignments')}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition flex items-center gap-2 shrink-0"
        >
          <span>Browse Assignments</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 5 Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-surface-900 border border-surface-800 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-medium text-surface-400">Total Assignments</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">{analytics?.total_assignments || assignments.length}</p>
          <span className="text-[10px] text-surface-500">Course curriculum</span>
        </div>

        <div className="bg-surface-900 border border-surface-800 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-medium text-surface-400">Submissions</p>
          <p className="text-2xl font-bold font-mono text-brand-300 mt-1">{analytics?.submitted_assignments || submissions.length}</p>
          <span className="text-[10px] text-surface-500">Evaluated programs</span>
        </div>

        <div className="bg-surface-900 border border-surface-800 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-medium text-surface-400">Average Caliber</p>
          <p className="text-2xl font-bold font-mono text-emerald-300 mt-1">{(analytics?.average_score || 0).toFixed(1)}</p>
          <span className="text-[10px] text-surface-500">Weighted / 100</span>
        </div>

        <div className="bg-surface-900 border border-surface-800 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-medium text-surface-400">Highest Score</p>
          <p className="text-2xl font-bold font-mono text-purple-300 mt-1">{(analytics?.best_score || 0).toFixed(1)}</p>
          <span className="text-[10px] text-surface-500">Peak performance</span>
        </div>

        <div className="bg-surface-900 border border-surface-800 p-4 rounded-xl shadow-sm col-span-2 md:col-span-1">
          <p className="text-[11px] font-medium text-surface-400">Pending Tasks</p>
          <p className="text-2xl font-bold font-mono text-amber-300 mt-1">{analytics?.pending_assignments || 0}</p>
          <span className="text-[10px] text-surface-500">Awaiting submission</span>
        </div>
      </div>

      {/* Analytics & Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Progression Line Chart */}
        <div className="lg:col-span-2 bg-surface-900 border border-surface-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-400" />
                <span>Performance Progression Over Time</span>
              </h3>
              <p className="text-xs text-surface-400">Progression across functional correctness, static quality, and overall scores</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-brand-400">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Overall Score
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Correctness
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Final Score"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#6366f1' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="correctness"
                  name="Correctness"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Personalized Insights Card */}
        <div className="bg-surface-900 border border-surface-800 p-6 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-800">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <h3 className="text-base font-bold text-white tracking-tight">AI Pedagogical Insights</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-surface-950 p-3 rounded-xl border border-surface-800/80">
                <span className="text-[11px] text-surface-400 block mb-0.5">Strongest Programming Skill</span>
                <span className="text-white font-semibold text-sm">{analytics?.strongest_skill}</span>
              </div>

              <div className="bg-surface-950 p-3 rounded-xl border border-surface-800/80">
                <span className="text-[11px] text-surface-400 block mb-0.5">Recurring Error Pattern</span>
                <span className="text-amber-300 font-semibold">{analytics?.frequent_mistake}</span>
              </div>

              <div>
                <span className="text-[11px] text-surface-400 font-semibold block mb-1.5 uppercase tracking-wider">
                  Recommended Study Topics:
                </span>
                <div className="space-y-1.5">
                  {(analytics?.recommended_topics || ['Two Pointers', 'Hash Tables']).map((top, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-surface-950 rounded-lg text-brand-300 border border-brand-500/15">
                      <GraduationCap className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      <span className="truncate">{top}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-surface-400">
            Insights generated from submission history and AST diagnostics.
          </div>
        </div>
      </div>

      {/* Available Assignments Section */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-surface-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Available Programming Assignments</h3>
            <p className="text-xs text-surface-400">Select an assignment to open the interactive coding workspace</p>
          </div>
          <button
            onClick={() => onNavigate('assignments')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.slice(0, 3).map((asg) => (
            <div
              key={asg.id}
              className="bg-surface-950 border border-surface-800 p-4 rounded-xl flex flex-col justify-between hover:border-brand-500/30 transition group"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    asg.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    asg.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {asg.difficulty}
                  </span>
                  <span className="text-[11px] text-surface-400">{asg.test_case_count} Test Cases</span>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition line-clamp-1">
                  {asg.title}
                </h4>

                <p className="text-xs text-surface-400 line-clamp-2 leading-relaxed">
                  {asg.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-surface-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-surface-400">
                  <Clock className="w-3 h-3" />
                  <span>2.0s limit</span>
                </div>
                <button
                  onClick={() => onNavigate('workspace', { assignmentId: asg.id })}
                  className="px-3 py-1.5 bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white rounded-lg text-xs font-semibold transition border border-brand-500/30 flex items-center gap-1"
                >
                  <span>Solve</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-surface-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Code Submissions & Evaluations</h3>
            <p className="text-xs text-surface-400">Review evaluation history, complexity ratings, and personalized feedback</p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <p className="text-xs text-surface-400 text-center py-8">
            You haven't submitted any solutions yet. Pick an assignment above to begin!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-surface-300">
              <thead className="bg-surface-950/80 text-surface-400 uppercase tracking-wider text-[11px] font-semibold border-b border-surface-800">
                <tr>
                  <th className="py-3 px-4">Assignment</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Final Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800">
                {submissions.slice(0, 5).map((sub) => (
                  <tr key={sub.id} className="hover:bg-surface-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {sub.assignment_title || `Assignment #${sub.assignment_id}`}
                    </td>
                    <td className="py-3.5 px-4 font-mono uppercase text-brand-400">
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
                        className="px-3 py-1 bg-surface-800 hover:bg-surface-700 text-white rounded-lg text-xs font-medium transition"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
