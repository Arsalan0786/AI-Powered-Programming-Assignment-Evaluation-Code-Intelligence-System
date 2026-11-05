import React from 'react';
import { Award, CheckCircle2, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';
import { Submission } from '../types';

interface ScoreCardProps {
  submission: Submission;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ submission }) => {
  const score = submission.final_score || 0;

  const getTier = (s: number) => {
    if (s >= 90) return { label: 'Exceptional', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (s >= 75) return { label: 'Proficient', color: 'text-brand-300 bg-brand-500/10 border-brand-500/30' };
    if (s >= 60) return { label: 'Developing', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Needs Remediation', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const tier = getTier(score);

  const categories = [
    { name: 'Functional Correctness', score: submission.functional_score, weight: '40%', color: 'bg-emerald-500' },
    { name: 'Code Quality (AST)', score: submission.quality_score, weight: '20%', color: 'bg-blue-500' },
    { name: 'Complexity & Efficiency', score: submission.complexity_score, weight: '15%', color: 'bg-purple-500' },
    { name: 'Robustness & Safety', score: submission.robustness_score, weight: '10%', color: 'bg-indigo-500' },
    { name: 'Maintainability', score: submission.maintainability_score, weight: '10%', color: 'bg-teal-500' },
    { name: 'Documentation', score: submission.documentation_score, weight: '5%', color: 'bg-sky-500' },
  ];

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-surface-800/80">
        {/* Overall Score Dial */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex items-center justify-center rounded-2xl bg-surface-950 border border-surface-800 shadow-inner-subtle ring-1 ring-white/5">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">{score.toFixed(1)}</span>
            <span className="text-[10px] font-mono text-surface-400 absolute bottom-2">/ 100</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-surface-400 uppercase tracking-wider font-semibold">Evaluation Caliber</span>
              <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${tier.color}`}>
                {tier.label}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Composite Quality Index</h2>
            <p className="text-xs text-surface-400 mt-0.5">Evaluated across static AST metrics, test cases, and algorithmic bounds</p>
          </div>
        </div>

        {/* Runtime Performance Metrics */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          <div className="bg-surface-950 border border-surface-800 px-4 py-2.5 rounded-xl">
            <p className="text-[11px] font-mono text-surface-400">Runtime Latency</p>
            <p className="text-sm font-semibold text-white font-mono">{submission.execution_time_ms.toFixed(1)} ms</p>
          </div>
          <div className="bg-surface-950 border border-surface-800 px-4 py-2.5 rounded-xl">
            <p className="text-[11px] font-mono text-surface-400">Peak Memory</p>
            <p className="text-sm font-semibold text-white font-mono">{submission.memory_used_kb.toFixed(0)} KB</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-6">
        {categories.map((cat, i) => (
          <div key={i} className="bg-surface-950/70 border border-surface-800/80 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-surface-300 font-medium truncate">{cat.name}</span>
              <span className="text-surface-400 font-mono text-[10px] bg-surface-900 px-1.5 py-0.5 rounded border border-surface-800">
                {cat.weight}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-white font-mono">{(cat.score || 0).toFixed(1)}</span>
              <span className="text-[10px] font-mono text-surface-400">/ 100</span>
            </div>
            <div className="w-full bg-surface-900 h-1.5 rounded-full overflow-hidden border border-surface-800/80">
              <div
                className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                style={{ width: `${Math.min(100, Math.max(0, cat.score || 0))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
