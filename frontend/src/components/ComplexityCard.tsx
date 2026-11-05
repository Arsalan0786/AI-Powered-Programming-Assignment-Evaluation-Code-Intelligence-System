import React from 'react';
import { ComplexityReport } from '../types';
import { Cpu, HardDrive, GitBranch, Gauge, TrendingUp } from 'lucide-react';

interface ComplexityCardProps {
  report?: ComplexityReport;
}

export const ComplexityCard: React.FC<ComplexityCardProps> = ({ report }) => {
  if (!report) return null;

  const patterns = report.detected_patterns || [];

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-surface-800">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-400" />
            <span>Algorithmic Complexity & Efficiency Analysis</span>
          </h3>
          <p className="text-xs text-surface-400">Heuristic Big-O estimation derived from AST syntax traversal</p>
        </div>
      </div>

      {/* Complexity Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-950 p-4 rounded-xl border border-surface-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-surface-400 text-xs mb-1">
            <span>Time Complexity</span>
            <Cpu className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-brand-300">
            {report.estimated_time_complexity}
          </div>
          <p className="text-[10px] text-surface-400 mt-1">Growth rate bounds</p>
        </div>

        <div className="bg-surface-950 p-4 rounded-xl border border-surface-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-surface-400 text-xs mb-1">
            <span>Auxiliary Space</span>
            <HardDrive className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">
            {report.estimated_space_complexity}
          </div>
          <p className="text-[10px] text-surface-400 mt-1">Memory allocation</p>
        </div>

        <div className="bg-surface-950 p-4 rounded-xl border border-surface-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-surface-400 text-xs mb-1">
            <span>Cyclomatic Complexity</span>
            <GitBranch className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {report.cyclomatic_complexity}
          </div>
          <p className="text-[10px] text-surface-400 mt-1">McCabe decision paths</p>
        </div>

        <div className="bg-surface-950 p-4 rounded-xl border border-surface-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-surface-400 text-xs mb-1">
            <span>Maintainability Index</span>
            <Gauge className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-teal-300">
            {report.maintainability_index.toFixed(1)}
          </div>
          <p className="text-[10px] text-surface-400 mt-1">Scale 0 - 100</p>
        </div>
      </div>

      {/* Explanations & Recommendations */}
      <div className="space-y-3 text-xs bg-surface-950/60 p-4 rounded-xl border border-surface-800">
        <div>
          <span className="font-semibold text-white block mb-0.5">Complexity Diagnostics:</span>
          <p className="text-surface-300 leading-relaxed">{report.explanation}</p>
        </div>
        {report.recommendations && (
          <div className="pt-2 border-t border-surface-800/80">
            <span className="font-semibold text-brand-400 block mb-0.5">Optimization Recommendation:</span>
            <p className="text-surface-300 leading-relaxed">{report.recommendations}</p>
          </div>
        )}
      </div>

      {/* Detected Patterns */}
      {patterns.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Detected Code Flow Patterns</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {patterns.map((pat, idx) => (
              <div key={idx} className="bg-surface-950 p-3 rounded-lg border border-surface-800 text-xs flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">{pat.pattern}</span>
                  <p className="text-surface-400 text-[11px] mt-0.5">{pat.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
