import React from 'react';
import { Award, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Submission } from '../types';

interface ScoreCardProps {
  submission: Submission;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ submission }) => {
  const score = submission.final_score || 0;

  const getTier = (s: number) => {
    if (s >= 90) return { label: 'Exceptional', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (s >= 75) return { label: 'Proficient', color: 'text-brand-400 bg-brand-500/10 border-brand-500/30' };
    if (s >= 60) return { label: 'Developing', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Needs Remediation', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
  };

  const tier = getTier(score);

  const categories = [
    { name: 'Functional Correctness', score: submission.functional_score, weight: '40%', color: 'bg-emerald-500' },
    { name: 'Code Quality', score: submission.quality_score, weight: '20%', color: 'bg-blue-500' },
    { name: 'Algorithmic Complexity', score: submission.complexity_score, weight: '15%', color: 'bg-purple-500' },
    { name: 'Error Handling & Robustness', score: submission.robustness_score, weight: '10%', color: 'bg-indigo-500' },
    { name: 'Readability & Maintainability', score: submission.maintainability_score, weight: '10%', color: 'bg-teal-500' },
    { name: 'Documentation', score: submission.documentation_score, weight: '5%', color: 'bg-cyan-500' },
  ];

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-surface-800">
        {/* Overall Score Circle */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-900/50 to-surface-950 border border-brand-500/30 shadow-inner">
            <span className="text-3xl font-bold tracking-tight text-white">{score.toFixed(1)}</span>
            <span className="text-[10px] text-surface-400 absolute bottom-2">/ 100</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs text-surface-400 uppercase tracking-wider font-semibold">Evaluation Caliber</span>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${tier.color}`}>
                {tier.label}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Comprehensive Quality Score</h2>
            <p className="text-xs text-surface-400 mt-0.5">Calculated via multi-criteria weighted algorithm</p>
          </div>
        </div>

        {/* Execution Metrics Pills */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          <div className="bg-surface-950 border border-surface-800 px-4 py-2.5 rounded-xl">
            <p className="text-[11px] text-surface-400">Execution Runtime</p>
            <p className="text-sm font-semibold text-white font-mono">{submission.execution_time_ms.toFixed(1)} ms</p>
          </div>
          <div className="bg-surface-950 border border-surface-800 px-4 py-2.5 rounded-xl">
            <p className="text-[11px] text-surface-400">Peak Memory</p>
            <p className="text-sm font-semibold text-white font-mono">{submission.memory_used_kb.toFixed(0)} KB</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
        {categories.map((cat, i) => (
          <div key={i} className="bg-surface-950/70 border border-surface-800/80 rounded-xl p-3.5">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-surface-300 font-medium truncate">{cat.name}</span>
              <span className="text-surface-400 text-[10px]">Wt: {cat.weight}</span>
            </div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-bold text-white font-mono">{(cat.score || 0).toFixed(1)}</span>
              <span className="text-[11px] text-surface-400">/ 100</span>
            </div>
            <div className="w-full bg-surface-800 h-1.5 rounded-full overflow-hidden">
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
