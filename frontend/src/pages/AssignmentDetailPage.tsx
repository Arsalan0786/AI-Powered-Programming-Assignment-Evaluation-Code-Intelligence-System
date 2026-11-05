import React, { useState, useEffect } from 'react';
import { Assignment } from '../types';
import { assignmentService } from '../services/api';
import {
  BookOpen, Clock, HardDrive, Shield, ArrowRight,
  CheckCircle2, FileText, ChevronLeft, Scale
} from 'lucide-react';

interface AssignmentDetailPageProps {
  assignmentId: number;
  onNavigate: (page: string, params?: any) => void;
}

export const AssignmentDetailPage: React.FC<AssignmentDetailPageProps> = ({ assignmentId, onNavigate }) => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await assignmentService.get(assignmentId);
        setAssignment(data);
      } catch (err) {
        console.error("Failed to fetch assignment detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [assignmentId]);

  if (loading || !assignment) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-surface-400 text-xs">
        Loading problem requirements...
      </div>
    );
  }

  const weights = assignment.scoring_weights || {
    correctness: 0.40, quality: 0.20, complexity: 0.15,
    robustness: 0.10, maintainability: 0.10, documentation: 0.05
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Back Navigation */}
      <button
        onClick={() => onNavigate('assignments')}
        className="inline-flex items-center gap-1.5 text-xs text-surface-400 hover:text-white transition font-medium"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Assignments
      </button>

      {/* Main Header Card */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
              assignment.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              assignment.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
              'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {assignment.difficulty}
            </span>
            <span className="text-xs text-surface-400 font-mono">
              Assignment #{assignment.id}
            </span>
          </div>

          <button
            onClick={() => onNavigate('workspace', { assignmentId: assignment.id })}
            className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/30 transition flex items-center gap-2"
          >
            <span>Open Coding Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {assignment.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-surface-400 border-t border-surface-800/80">
          <span className="flex items-center gap-1.5 font-mono">
            <Clock className="w-4 h-4 text-brand-400" /> Timeout: {assignment.max_time_limit_sec}s
          </span>
          <span className="flex items-center gap-1.5 font-mono">
            <HardDrive className="w-4 h-4 text-indigo-400" /> Max Memory: {assignment.max_memory_limit_mb} MB
          </span>
          <span className="flex items-center gap-1.5 font-mono">
            <FileText className="w-4 h-4 text-purple-400" /> {assignment.test_case_count} Test Cases
          </span>
        </div>
      </div>

      {/* Problem Description & Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight">Problem Statement & Requirements</h2>
            <div className="text-xs text-surface-300 leading-relaxed whitespace-pre-wrap font-sans space-y-2">
              {assignment.description}
            </div>

            {assignment.instructions && (
              <div className="pt-4 border-t border-surface-800 space-y-2">
                <h3 className="text-xs font-bold uppercase text-surface-400 tracking-wider">Implementation Constraints</h3>
                <div className="p-3.5 bg-surface-950 rounded-xl border border-surface-800 text-xs text-surface-300 font-mono">
                  {assignment.instructions}
                </div>
              </div>
            )}
          </div>

          {/* Public Test Cases Preview */}
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight">Example Public Test Cases</h2>
            <p className="text-xs text-surface-400">Your program will be evaluated against standard inputs, edge scenarios, and hidden evaluation suites.</p>

            <div className="space-y-3">
              {(assignment.test_cases || []).map((tc, idx) => (
                <div key={tc.id || idx} className="bg-surface-950 rounded-xl p-4 border border-surface-800 text-xs space-y-2 font-mono">
                  <div className="flex justify-between items-center text-[10px] text-surface-400 uppercase font-semibold">
                    <span>Example {idx + 1} ({tc.test_type})</span>
                    <span>Weight: {tc.weight}x</span>
                  </div>
                  <div>
                    <span className="text-surface-500 block text-[11px]">Input:</span>
                    <pre className="text-surface-200 mt-0.5 whitespace-pre-wrap">{tc.input_data}</pre>
                  </div>
                  <div>
                    <span className="text-surface-500 block text-[11px]">Expected Output:</span>
                    <pre className="text-emerald-400 mt-0.5 whitespace-pre-wrap">{tc.expected_output}</pre>
                  </div>
                  {tc.explanation && (
                    <p className="text-surface-400 text-[11px] font-sans pt-1 border-t border-surface-800/80">
                      <strong>Note:</strong> {tc.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Scoring Distribution */}
        <div className="space-y-6">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-800">
              <Scale className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Grading Criteria Weights</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-surface-300">
                <span>Functional Correctness</span>
                <span className="font-mono font-bold text-emerald-400">{Math.round((weights.correctness || 0.4) * 100)}%</span>
              </div>
              <div className="flex justify-between items-center text-surface-300">
                <span>AST Code Quality</span>
                <span className="font-mono font-bold text-blue-400">{Math.round((weights.quality || 0.2) * 100)}%</span>
              </div>
              <div className="flex justify-between items-center text-surface-300">
                <span>Algorithmic Complexity</span>
                <span className="font-mono font-bold text-purple-400">{Math.round((weights.complexity || 0.15) * 100)}%</span>
              </div>
              <div className="flex justify-between items-center text-surface-300">
                <span>Robustness & Safety</span>
                <span className="font-mono font-bold text-indigo-400">{Math.round((weights.robustness || 0.10) * 100)}%</span>
              </div>
              <div className="flex justify-between items-center text-surface-300">
                <span>Maintainability</span>
                <span className="font-mono font-bold text-teal-400">{Math.round((weights.maintainability || 0.10) * 100)}%</span>
              </div>
              <div className="flex justify-between items-center text-surface-300">
                <span>Documentation</span>
                <span className="font-mono font-bold text-cyan-400">{Math.round((weights.documentation || 0.05) * 100)}%</span>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-800">
              <button
                onClick={() => onNavigate('workspace', { assignmentId: assignment.id })}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Start Solution</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
