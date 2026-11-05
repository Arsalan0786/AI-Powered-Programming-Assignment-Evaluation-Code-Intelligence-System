import React, { useState, useEffect } from 'react';
import { FacultyAnalytics } from '../types';
import { analyticsService } from '../services/api';
import {
  LineChart as LineChartIcon, BarChart3, PieChart as PieChartIcon,
  TrendingUp, AlertTriangle, ShieldCheck, Cpu, Code2
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';

interface FacultyAnalyticsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const FacultyAnalyticsPage: React.FC<FacultyAnalyticsPageProps> = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState<FacultyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsService.getFacultyAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load faculty analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-surface-400 text-xs">
        Aggregating multi-dimensional assessment metrics...
      </div>
    );
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-surface-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <LineChartIcon className="w-6 h-6 text-brand-400" />
          <span>Class Performance & Code Intelligence Analytics</span>
        </h1>
        <p className="text-xs sm:text-sm text-surface-400 mt-1 max-w-2xl">
          Aggregated curriculum trends, algorithmic complexity distributions, and programming error frequencies across all submitted assignments.
        </p>
      </div>

      {/* Grid: Assignment Performance & Complexity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment-wise Average Score */}
        <div className="bg-surface-900 border border-surface-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Assignment-Wise Class Average</span>
            </h3>
            <p className="text-xs text-surface-400">Mean evaluation scores across curriculum tasks</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.assignment_performance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="title" stroke="#64748b" tick={{ fontSize: 10 }} />
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
                <Bar dataKey="average_score" name="Average Score" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Algorithmic Complexity Distribution */}
        <div className="bg-surface-900 border border-surface-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Algorithmic Complexity Distribution</span>
            </h3>
            <p className="text-xs text-surface-400">Time complexity bounds detected across student implementations</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.complexity_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="complexity" stroke="#64748b" tick={{ fontSize: 11 }} />
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
                <Bar dataKey="count" name="Submissions" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Language Breakdown & Common Errors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Distribution */}
        <div className="bg-surface-900 border border-surface-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Programming Language Distribution</span>
            </h3>
            <p className="text-xs text-surface-400">Language adoption across student submissions</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.language_distribution || []}
                  dataKey="count"
                  nameKey="language"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ language, percent }: any) => `${language} ${(percent * 100).toFixed(0)}%`}
                >
                  {(analytics.language_distribution || []).map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Common Programming Defects */}
        <div className="bg-surface-900 border border-surface-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Machine-Classified Defect Frequencies</span>
            </h3>
            <p className="text-xs text-surface-400">Class-wide recurring programming mistakes</p>
          </div>

          <div className="space-y-3 pt-2">
            {(analytics.common_errors || []).map((err, idx) => (
              <div key={idx} className="bg-surface-950 p-3 rounded-xl border border-surface-800 flex justify-between items-center text-xs">
                <span className="font-semibold text-white">{err.error}</span>
                <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full font-mono font-bold">
                  {err.count} instances
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

