import React from 'react';
import { FeedbackReport } from '../types';
import {
  Sparkles, CheckCircle2, ShieldAlert, Cpu, Lightbulb, GraduationCap, FileCode
} from 'lucide-react';

interface PersonalizedFeedbackViewProps {
  feedback?: FeedbackReport;
}

export const PersonalizedFeedbackView: React.FC<PersonalizedFeedbackViewProps> = ({ feedback }) => {
  if (!feedback) return null;

  const sections = [
    {
      title: 'A. Overall Assessment',
      icon: Sparkles,
      content: feedback.overall_assessment,
      bg: 'bg-brand-500/10 border-brand-500/25 text-brand-200'
    },
    {
      title: 'B. Functional Conformance',
      icon: CheckCircle2,
      content: feedback.functional_analysis,
      bg: 'bg-surface-950 border-surface-800 text-surface-300'
    },
    {
      title: 'C. Code Quality & Standards',
      icon: FileCode,
      content: feedback.quality_feedback,
      bg: 'bg-surface-950 border-surface-800 text-surface-300'
    },
    {
      title: 'D. Algorithmic Complexity Evaluation',
      icon: Cpu,
      content: feedback.complexity_feedback,
      bg: 'bg-surface-950 border-surface-800 text-surface-300'
    },
    {
      title: 'E. Error Diagnostics & Defect Analysis',
      icon: ShieldAlert,
      content: feedback.error_explanation,
      bg: 'bg-surface-950 border-surface-800 text-surface-300'
    },
    {
      title: 'F. Concrete Improvement Suggestions',
      icon: Lightbulb,
      content: feedback.improvement_suggestions,
      bg: 'bg-surface-950 border-surface-800 text-surface-200 whitespace-pre-wrap'
    },
  ];

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="pb-4 border-b border-surface-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">Personalized AI Feedback Report</h3>
        </div>
        <p className="text-xs text-surface-400 mt-1">
          Grounded, technical evaluation synthesized from actual execution results, AST parser, and ML diagnostics
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div key={idx} className={`p-4 rounded-xl border ${sec.bg} space-y-2 text-xs`}>
              <div className="flex items-center gap-2 font-semibold text-white">
                <Icon className="w-4 h-4 text-brand-400" />
                <span>{sec.title}</span>
              </div>
              <p className="leading-relaxed font-mono text-[12px] opacity-90">{sec.content}</p>
            </div>
          );
        })}

        {/* Section G: Learning Recommendations */}
        {feedback.learning_recommendations && feedback.learning_recommendations.length > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-surface-950 border border-brand-500/30 space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-white text-xs">
              <GraduationCap className="w-4 h-4 text-brand-400" />
              <span>G. Curated Learning Recommendations</span>
            </div>
            <p className="text-xs text-surface-400">Targeted computer science topics based on detected performance gaps:</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {feedback.learning_recommendations.map((topic, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-surface-900 text-brand-300 font-medium text-xs rounded-lg border border-brand-500/20 shadow-sm"
                >
                  📚 {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
