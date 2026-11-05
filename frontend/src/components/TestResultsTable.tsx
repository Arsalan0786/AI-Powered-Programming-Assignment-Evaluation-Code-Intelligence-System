import React, { useState } from 'react';
import { TestCaseResult } from '../types';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';

interface TestResultsTableProps {
  results: TestCaseResult[];
}

export const TestResultsTable: React.FC<TestResultsTableProps> = ({ results }) => {
  const [selectedCase, setSelectedCase] = useState<TestCaseResult | null>(null);

  const getStatusBadge = (status: string, passed: boolean) => {
    if (passed || status === 'Accepted') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
        </span>
      );
    }
    if (status === 'Time Limit Exceeded') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5" /> Time Limit Exceeded
        </span>
      );
    }
    if (status === 'Runtime Error') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
          <AlertTriangle className="w-3.5 h-3.5" /> Runtime Error
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <XCircle className="w-3.5 h-3.5" /> Wrong Answer
      </span>
    );
  };

  const passedCount = results.filter((r) => r.passed).length;

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-surface-800">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Automated Test Suite Evaluation</h3>
          <p className="text-xs text-surface-400">Execution results across public, hidden, and boundary test cases</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-surface-950 text-surface-300 rounded-lg border border-surface-800">
            Passed: <strong className="text-white">{passedCount}</strong> / {results.length}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-surface-300">
          <thead className="bg-surface-950/80 text-surface-400 uppercase tracking-wider text-[11px] font-semibold border-b border-surface-800">
            <tr>
              <th className="py-3 px-4">Test Case</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Runtime</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {results.map((res, index) => (
              <tr key={res.id || index} className="hover:bg-surface-800/40 transition">
                <td className="py-3.5 px-4 font-mono font-semibold text-white">
                  Case #{index + 1}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${
                    res.is_hidden 
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' 
                      : res.test_type === 'edge' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-surface-800 text-surface-300 border-surface-700'
                  }`}>
                    {res.is_hidden ? 'Hidden' : res.test_type}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  {getStatusBadge(res.status, res.passed)}
                </td>
                <td className="py-3.5 px-4 font-mono text-surface-300">
                  {res.execution_time_ms.toFixed(1)} ms
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setSelectedCase(res)}
                    className="p-1.5 text-surface-400 hover:text-white hover:bg-surface-800 rounded-lg transition"
                    title="Inspect I/O"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Test Case Inspection Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-surface-800">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span>Test Case Inspection</span>
                {selectedCase.is_hidden && (
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                    Hidden Test Case
                  </span>
                )}
              </h4>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-surface-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-surface-400 font-semibold block mb-1">Standard Input</label>
                <pre className="p-3 bg-surface-950 rounded-xl border border-surface-800 font-mono text-surface-200 overflow-x-auto whitespace-pre-wrap">
                  {selectedCase.input_data || (selectedCase.is_hidden ? '[Hidden Specification]' : 'No input data')}
                </pre>
              </div>

              <div>
                <label className="text-surface-400 font-semibold block mb-1">Expected Specification Output</label>
                <pre className="p-3 bg-surface-950 rounded-xl border border-surface-800 font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                  {selectedCase.expected_output || (selectedCase.is_hidden ? '[Hidden Specification]' : 'None')}
                </pre>
              </div>

              <div>
                <label className="text-surface-400 font-semibold block mb-1">Student Program Output</label>
                <pre className="p-3 bg-surface-950 rounded-xl border border-surface-800 font-mono text-surface-200 overflow-x-auto whitespace-pre-wrap">
                  {selectedCase.actual_output || (selectedCase.is_hidden ? '[Hidden Execution Output]' : '<Empty stdout>')}
                </pre>
              </div>

              {selectedCase.error_message && (
                <div>
                  <label className="text-red-400 font-semibold block mb-1">Error Traceback</label>
                  <pre className="p-3 bg-red-950/30 rounded-xl border border-red-500/30 font-mono text-red-300 overflow-x-auto whitespace-pre-wrap">
                    {selectedCase.error_message}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
