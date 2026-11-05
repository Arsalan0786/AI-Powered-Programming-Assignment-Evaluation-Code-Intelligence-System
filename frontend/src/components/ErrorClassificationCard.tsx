import React from 'react';
import { ErrorClassification } from '../types';
import { Bug, Sparkles, CheckCircle, Wrench, ShieldCheck, Activity } from 'lucide-react';

interface ErrorClassificationCardProps {
  classification?: ErrorClassification;
}

export const ErrorClassificationCard: React.FC<ErrorClassificationCardProps> = ({ classification }) => {
  if (!classification) return null;

  const isClean = classification.predicted_class === 'none';

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-surface-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Bug className={`w-4 h-4 ${isClean ? 'text-emerald-400' : 'text-rose-400'}`} />
              <span>Machine Learning Defect Classification</span>
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-brand-500/10 text-brand-300 rounded border border-brand-500/25 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-400" />
              {classification.is_ml_predicted ? 'Scikit-Learn Classifier' : 'Heuristic Engine'}
            </span>
          </div>
          <p className="text-xs text-surface-400 mt-1">Supervised probabilistic classification over execution state and syntax tokens</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-surface-400">Confidence:</span>
          <span className="px-2 py-0.5 bg-surface-950 text-brand-300 font-mono font-bold text-xs rounded-lg border border-surface-800">
            {Math.round(classification.confidence * 100)}%
          </span>
        </div>
      </div>

      <div className="bg-surface-950 p-4 rounded-xl border border-surface-800/80 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-surface-400 font-medium font-mono text-[11px]">Class:</span>
            <span className={`px-2.5 py-0.5 rounded-lg font-semibold text-xs border ${
              isClean 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}>
              {classification.error_type}
            </span>
          </div>
          <span className="text-surface-500 font-mono text-[10px]">{classification.predicted_class}</span>
        </div>

        <div>
          <span className="text-surface-400 font-mono text-[11px] block mb-1">Root Cause Diagnostics:</span>
          <p className="text-surface-300 leading-relaxed font-sans">{classification.description}</p>
        </div>

        {classification.suggested_fix && (
          <div className="pt-2 border-t border-surface-800/80 flex items-start gap-2">
            <Wrench className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-brand-300 block mb-0.5 font-mono text-[11px]">Recommended Fix:</span>
              <p className="text-surface-300 leading-relaxed font-sans">{classification.suggested_fix}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
