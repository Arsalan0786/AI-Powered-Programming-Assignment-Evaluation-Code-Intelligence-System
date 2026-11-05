import React, { useState } from 'react';
import { StaticAnalysisReport } from '../types';
import { ShieldCheck, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface StaticAnalysisViewerProps {
  report?: StaticAnalysisReport;
}

export const StaticAnalysisViewer: React.FC<StaticAnalysisViewerProps> = ({ report }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  if (!report) {
    return (
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 text-center text-surface-400">
        Static analysis data is not available.
      </div>
    );
  }

  const issues = report.issues || [];
  const filtered = filterSeverity === 'ALL'
    ? issues
    : issues.filter((i) => i.severity.toUpperCase() === filterSeverity);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">CRITICAL</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">HIGH</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">MEDIUM</span>;
      case 'Low':
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">LOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[9px] font-mono font-medium bg-surface-800 text-surface-400 border border-surface-700">INFO</span>;
    }
  };

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-surface-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">AST Static Code Analysis</h3>
            <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-brand-500/10 text-brand-300 rounded border border-brand-500/25">
              Score: {report.score.toFixed(1)}/100
            </span>
          </div>
          <p className="text-xs text-surface-400 mt-1">{report.summary || 'Code smell, styling, and security verification'}</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-1 bg-surface-950 p-1 rounded-xl border border-surface-800 text-xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterSeverity(lvl)}
              className={`px-2.5 py-0.5 rounded-lg font-mono text-[11px] transition ${
                filterSeverity === lvl
                  ? 'bg-surface-800 text-white font-semibold'
                  : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-8 text-center bg-surface-950/50 rounded-xl border border-surface-800/80">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-semibold text-white">No Static Code Smells Detected</p>
          <p className="text-xs text-surface-400 mt-1 font-sans">Code conforms to syntax, nesting, and styling conventions for this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((issue, idx) => (
            <div
              key={idx}
              className="bg-surface-950/80 border border-surface-800/80 rounded-xl p-4 hover:border-surface-700 transition space-y-2 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(issue.severity)}
                  <span className="font-semibold text-white text-sm">{issue.name}</span>
                  {issue.line && (
                    <span className="text-[10px] font-mono text-surface-400 bg-surface-900 px-2 py-0.5 rounded border border-surface-800">
                      Line {issue.line}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-surface-500 uppercase tracking-wider font-semibold">
                  {issue.category}
                </span>
              </div>

              <p className="text-surface-300 leading-relaxed font-sans">{issue.explanation}</p>

              {issue.suggestion && (
                <div className="mt-2 p-2.5 bg-surface-900/90 rounded-lg border border-surface-800/80 text-surface-300 flex items-start gap-2">
                  <span className="text-brand-300 font-mono text-[11px] font-semibold shrink-0">Recommendation:</span>
                  <span className="font-sans">{issue.suggestion}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
