import React, { useState, useEffect } from 'react';
import { SimilarityReport } from '../types';
import { similarityService } from '../services/api';
import { SimilarityPairModal } from '../components/SimilarityPairModal';
import {
  CopyCheck, AlertTriangle, ShieldCheck, Search, Filter, Eye, CheckCircle2
} from 'lucide-react';

interface FacultySimilarityPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const FacultySimilarityPage: React.FC<FacultySimilarityPageProps> = ({ onNavigate }) => {
  const [reports, setReports] = useState<SimilarityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SimilarityReport | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await similarityService.listReports(undefined, flaggedOnly);
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch similarity reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [flaggedOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-surface-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <CopyCheck className="w-6 h-6 text-brand-400" />
              <span>Code Similarity & Academic Integrity Radar</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-surface-400 mt-1 max-w-2xl">
            Multi-method code similarity detection combining Token TF-IDF, AST Structural fingerprints, and semantic n-grams. Flagged pairs are surfaced for non-punitive faculty adjudication.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-surface-300 cursor-pointer bg-surface-900 px-3.5 py-2 rounded-xl border border-surface-800">
            <input
              type="checkbox"
              checked={flaggedOnly}
              onChange={(e) => setFlaggedOnly(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-surface-950 border-surface-700"
            />
            <span>Show Flagged Only (≥ 70%)</span>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center text-surface-400 text-xs">
          Scanning submissions for cross-student similarity...
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-12 text-center space-y-2">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Suspicious Collusion Detected</h3>
          <p className="text-xs text-surface-400 max-w-md mx-auto">
            All evaluated submissions fall within normal peer problem-solving variances.
          </p>
        </div>
      ) : (
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-surface-300">
              <thead className="bg-surface-950/80 text-surface-400 uppercase tracking-wider text-[11px] font-semibold border-b border-surface-800">
                <tr>
                  <th className="py-3 px-4">Student A</th>
                  <th className="py-3 px-4">Student B</th>
                  <th className="py-3 px-4">Assignment</th>
                  <th className="py-3 px-4">Overall Sim</th>
                  <th className="py-3 px-4">Token</th>
                  <th className="py-3 px-4">Structural</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {r.student_a_name}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {r.student_b_name}
                    </td>
                    <td className="py-3.5 px-4 text-surface-400 truncate max-w-[180px]">
                      {r.assignment_title || `Assignment #${r.assignment_id}`}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={r.overall_similarity >= 70 ? 'text-rose-400' : 'text-brand-300'}>
                        {r.overall_similarity.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-surface-400">
                      {r.token_similarity.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-surface-400">
                      {r.structural_similarity.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4">
                      {r.is_flagged ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" /> Flagged
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-surface-800 text-surface-400 border border-surface-700 w-max block">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReport(r)}
                        className="px-3 py-1 bg-surface-800 hover:bg-surface-700 text-white rounded-lg text-xs font-semibold transition border border-surface-700 flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Pair</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      {selectedReport && (
        <SimilarityPairModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdated={fetchReports}
        />
      )}
    </div>
  );
};

