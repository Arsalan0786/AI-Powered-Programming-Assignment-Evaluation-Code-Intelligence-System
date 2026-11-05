import React, { useState, useEffect } from 'react';
import { EvaluationReport } from '../types';
import { evaluationService } from '../services/api';
import { ScoreCard } from '../components/ScoreCard';
import { TestResultsTable } from '../components/TestResultsTable';
import { StaticAnalysisViewer } from '../components/StaticAnalysisViewer';
import { ComplexityCard } from '../components/ComplexityCard';
import { ErrorClassificationCard } from '../components/ErrorClassificationCard';
import { PersonalizedFeedbackView } from '../components/PersonalizedFeedbackView';
import {
  ChevronLeft, RotateCcw, CheckCircle2, Clock, Code2, Sparkles, Download
} from 'lucide-react';

interface EvaluationResultPageProps {
  submissionId: number;
  onNavigate: (page: string, params?: any) => void;
}

export const EvaluationResultPage: React.FC<EvaluationResultPageProps> = ({ submissionId, onNavigate }) => {
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [rerunning, setRerunning] = useState(false);

  const fetchReport = async () => {
    try {
      const data = await evaluationService.getReport(submissionId);
      setReport(data);
    } catch (err) {
      console.error("Failed to load evaluation report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [submissionId]);

  const handleRerun = async () => {
    setRerunning(true);
    try {
      const data = await evaluationService.rerun(submissionId);
      setReport(data);
    } catch (err) {
      console.error("Rerun failed:", err);
    } finally {
      setRerunning(false);
    }
  };

  if (loading || !report) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-surface-400 text-xs">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <span>Generating AI Code Intelligence & Assessment Report...</span>
        </div>
      </div>
    );
  }

  const { submission } = report;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-surface-800">
        <div>
          <button
            onClick={() => onNavigate('student-dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-surface-400 hover:text-white transition font-medium mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Evaluation & Code Intelligence Report
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-semibold bg-surface-900 text-brand-300 rounded border border-surface-800 uppercase">
              {submission.language}
            </span>
          </div>
          <p className="text-xs text-surface-400 mt-1">
            Assignment: <span className="text-white font-medium">{submission.assignment_title}</span> • Submitted: {new Date(submission.submitted_at).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRerun}
            disabled={rerunning}
            className="flex items-center gap-1.5 px-4 py-2 bg-surface-900 hover:bg-surface-800 text-white rounded-xl text-xs font-semibold border border-surface-700 transition disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${rerunning ? 'animate-spin' : ''}`} />
            {rerunning ? 'Re-evaluating...' : 'Re-Run Evaluation'}
          </button>
          <button
            onClick={() => onNavigate('workspace', { assignmentId: submission.assignment_id })}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-brand-600/30"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Edit & Resubmit</span>
          </button>
        </div>
      </div>

      {/* 1. Score Card (Overall & Categories) */}
      <ScoreCard submission={submission} />

      {/* 2. Grid: Complexity Diagnostics & ML Error Classification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplexityCard report={report.complexity_report} />
        <ErrorClassificationCard classification={report.error_classification} />
      </div>

      {/* 3. Automated Test Suite Results Table */}
      <TestResultsTable results={report.test_results} />

      {/* 4. AST Static Code Analysis Viewer */}
      <StaticAnalysisViewer report={report.static_analysis} />

      {/* 5. Personalized AI Technical Feedback */}
      <PersonalizedFeedbackView feedback={report.feedback} />
    </div>
  );
};

