import React, { useState, useEffect } from 'react';
import { Assignment } from '../types';
import { assignmentService, submissionService } from '../services/api';
import { CodeEditor } from '../components/CodeEditor';
import {
  BookOpen, Clock, ChevronLeft, Play, AlertCircle, CheckCircle2,
  Terminal, Sparkles, Scale, Info
} from 'lucide-react';

interface WorkspaceSubmissionPageProps {
  assignmentId: number;
  onNavigate: (page: string, params?: any) => void;
}

export const WorkspaceSubmissionPage: React.FC<WorkspaceSubmissionPageProps> = ({
  assignmentId,
  onNavigate,
}) => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sampleRunOutput, setSampleRunOutput] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'problem' | 'sample_output'>('problem');

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const data = await assignmentService.get(assignmentId);
        setAssignment(data);
      } catch (err) {
        console.error("Failed to load assignment:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [assignmentId]);

  const handleSubmit = async (code: string, language: string) => {
    setIsSubmitting(true);
    try {
      const sub = await submissionService.submit({
        assignment_id: assignmentId,
        language,
        source_code: code,
      });
      // Navigate straight to the evaluation result page
      onNavigate('evaluation', { submissionId: sub.id });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunSample = async (code: string, language: string) => {
    setIsSubmitting(true);
    setActiveTab('sample_output');
    try {
      // Evaluate against the first public test case
      const sub = await submissionService.submit({
        assignment_id: assignmentId,
        language,
        source_code: code,
      });
      setSampleRunOutput({
        status: sub.status,
        score: sub.final_score,
        time: sub.execution_time_ms,
        submissionId: sub.id,
      });
    } catch (err: any) {
      setSampleRunOutput({
        status: 'Error',
        error: err.response?.data?.detail || 'Run failed.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !assignment) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-surface-400 text-xs">
        Preparing isolated execution workspace...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 h-[calc(100vh-5rem)] flex flex-col">
      {/* Top Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-surface-800 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('assignments')}
            className="p-1.5 rounded-lg bg-surface-900 hover:bg-surface-800 text-surface-400 hover:text-white transition"
            title="Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">{assignment.title}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                assignment.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                assignment.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {assignment.difficulty}
              </span>
            </div>
            <p className="text-[11px] text-surface-400 font-mono">
              Timeout: {assignment.max_time_limit_sec}s • Sandbox Isolated
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-surface-400">
          <span className="flex items-center gap-1.5 bg-surface-900 border border-surface-800 px-3 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-brand-400" /> Auto-Save Active
          </span>
        </div>
      </div>

      {/* Main Split Grid: Left Problem & Right Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Specification Column (5 cols) */}
        <div className="lg:col-span-5 bg-surface-900 border border-surface-800 rounded-2xl p-5 flex flex-col h-full overflow-hidden shadow-xl">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 pb-3 border-b border-surface-800 shrink-0">
            <button
              onClick={() => setActiveTab('problem')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'problem' ? 'bg-surface-800 text-white' : 'text-surface-400 hover:text-white'
              }`}
            >
              Problem Specification
            </button>
            <button
              onClick={() => setActiveTab('sample_output')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                activeTab === 'sample_output' ? 'bg-surface-800 text-white' : 'text-surface-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> Test Runner Output
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-1 py-4 text-xs space-y-4">
            {activeTab === 'problem' ? (
              <>
                <div>
                  <h3 className="font-semibold text-white mb-1.5">Description</h3>
                  <div className="text-surface-300 leading-relaxed whitespace-pre-wrap">
                    {assignment.description}
                  </div>
                </div>

                {assignment.instructions && (
                  <div>
                    <h3 className="font-semibold text-brand-300 mb-1.5">Algorithm Constraints</h3>
                    <div className="p-3 bg-surface-950 rounded-xl border border-surface-800 font-mono text-[11px] text-surface-300">
                      {assignment.instructions}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-white mb-2">Public Test Cases</h3>
                  <div className="space-y-2.5">
                    {(assignment.test_cases || []).slice(0, 3).map((tc, idx) => (
                      <div key={tc.id || idx} className="bg-surface-950 p-3 rounded-xl border border-surface-800 font-mono space-y-1.5">
                        <span className="text-[10px] text-surface-500 uppercase block font-semibold">Case {idx + 1}</span>
                        <div>
                          <span className="text-surface-400 text-[10px]">Input:</span>
                          <pre className="text-surface-200 whitespace-pre-wrap">{tc.input_data}</pre>
                        </div>
                        <div>
                          <span className="text-surface-400 text-[10px]">Expected Output:</span>
                          <pre className="text-emerald-400 whitespace-pre-wrap">{tc.expected_output}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Execution Console</h3>
                {!sampleRunOutput ? (
                  <div className="py-12 text-center text-surface-500">
                    <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Click "Run Sample" or "Submit for Evaluation" to execute against the isolated sandbox runner.
                  </div>
                ) : (
                  <div className="bg-surface-950 p-4 rounded-xl border border-surface-800 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-surface-400">Execution Status:</span>
                      <span className={`font-bold ${sampleRunOutput.status === 'Accepted' || sampleRunOutput.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {sampleRunOutput.status}
                      </span>
                    </div>
                    {sampleRunOutput.score !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-surface-400">Overall Caliber:</span>
                        <span className="font-bold text-white">{sampleRunOutput.score} / 100</span>
                      </div>
                    )}
                    {sampleRunOutput.time !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-surface-400">Runtime:</span>
                        <span className="text-surface-300">{sampleRunOutput.time} ms</span>
                      </div>
                    )}
                    {sampleRunOutput.submissionId && (
                      <div className="pt-2">
                        <button
                          onClick={() => onNavigate('evaluation', { submissionId: sampleRunOutput.submissionId })}
                          className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold transition"
                        >
                          View Full Evaluation Report
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Code Editor Column (7 cols) */}
        <div className="lg:col-span-7 h-full flex flex-col min-h-0">
          <CodeEditor
            allowedLanguages={assignment.allowed_languages || ['python', 'cpp', 'java', 'javascript']}
            onSubmit={handleSubmit}
            onRunSample={handleRunSample}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};
