import React from 'react';
import { ErrorClassification } from '../types';
import { Bug, Sparkles, CheckCircle, Wrench, ShieldCheck } from 'lucide-react';

interface ErrorClassificationCardProps {
  classification?: ErrorClassification;
}

export const ErrorClassificationCard: React.FC<ErrorClassificationCardProps> = ({ classification }) => {
  if (!classification) return null;

  const isClean = classification.predicted_class === 'none';

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-surface-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Bug className={`w-5 h-5 ${isClean ? 'text-emerald-400' : 'text-rose-400'}`} />
              <span>Machine Learning Error Diagnostics</span>
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-500/20 text-brand-300 rounded border border-brand-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-400" />
              {classification.is_ml_predicted ? 'Scikit-Learn Model' : 'Deterministic Classifier'}
            </span>
          </div>
          <p className="text-xs text-surface-400 mt-1">Multi-class supervised classification on execution trace and AST tokens</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-400">Model Confidence:</span>
          <span className="px-2.5 py-1 bg-surface-950 text-white font-mono font-bold text-xs rounded-lg border border-surface-800">
            {Math.round(classification.confidence * 100)}%
          </span>
        </div>
      </div>

      <div className="bg-surface-950 p-4 rounded-xl border border-surface-800 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-surface-400 font-semibold">Classification:</span>
            <span className={`px-2.5 py-1 rounded-lg font-semibold text-xs border ${
              isClean 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}>
              {classification.error_type}
            </span>
          </div>
          <span className="text-surface-500 font-mono text-[11px]">{classification.predicted_class}</span>
        </div>

        <div>
          <span className="text-surface-400 font-semibold block mb-1">Root Cause Analysis:</span>
          <p className="text-surface-300 leading-relaxed">{classification.description}</p>
        </div>

        {classification.suggested_fix && (
          <div className="pt-2 border-t border-surface-800/80 flex items-start gap-2">
            <Wrench className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-brand-300 block mb-0.5">Recommended Remediation:</span>
              <p className="text-surface-300 leading-relaxed">{classification.suggested_fix}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
