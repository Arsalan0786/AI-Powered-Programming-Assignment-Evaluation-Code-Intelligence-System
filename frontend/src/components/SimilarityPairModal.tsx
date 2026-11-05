import React, { useState } from 'react';
import { SimilarityReport } from '../types';
import { CopyCheck, ShieldAlert, CheckCircle, FileCode, AlertTriangle } from 'lucide-react';
import { similarityService } from '../services/api';

interface SimilarityPairModalProps {
  report: SimilarityReport;
  onClose: () => void;
  onUpdated: () => void;
}

export const SimilarityPairModal: React.FC<SimilarityPairModalProps> = ({ report, onClose, onUpdated }) => {
  const [notes, setNotes] = useState(report.faculty_notes || '');
  const [reviewed, setReviewed] = useState(report.faculty_reviewed);
  const [flagged, setFlagged] = useState(report.is_flagged);
  const [saving, setSaving] = useState(false);

  const handleSaveReview = async () => {
    setSaving(true);
    try {
      await similarityService.review(report.id, {
        faculty_reviewed: reviewed,
        faculty_notes: notes,
        is_flagged: flagged
      });
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to save similarity review:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface-900 border border-surface-800 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-surface-800">
          <div>
            <div className="flex items-center gap-2">
              <CopyCheck className="w-5 h-5 text-brand-400" />
              <h3 className="text-xl font-bold text-white tracking-tight">Code Similarity & Integrity Inspection</h3>
              {flagged && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Flagged for Review
                </span>
              )}
            </div>
            <p className="text-xs text-surface-400 mt-1">
              Assignment: <span className="text-white font-medium">{report.assignment_title || `Assignment #${report.assignment_id}`}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-surface-400 hover:text-white text-lg">✕</button>
        </div>

        {/* Notice Alert */}
        <div className="p-3.5 bg-brand-950/40 border border-brand-500/30 rounded-xl text-xs text-brand-200">
          <strong>Academic Review Policy:</strong> Elevated similarity scores do not constitute automated proof of plagiarism. Standard problem constraints, boilerplate I/O loops, and canonical algorithms often produce legitimate peer similarities.
        </div>

        {/* 3 Similarity Metrics Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface-950 p-3.5 rounded-xl border border-surface-800">
            <span className="text-[11px] text-surface-400 block mb-1">Overall Similarity</span>
            <span className={`text-2xl font-bold font-mono ${report.overall_similarity >= 70 ? 'text-rose-400' : 'text-brand-300'}`}>
              {report.overall_similarity.toFixed(1)}%
            </span>
            <p className="text-[10px] text-surface-500 mt-0.5">Weighted composite</p>
          </div>

          <div className="bg-surface-950 p-3.5 rounded-xl border border-surface-800">
            <span className="text-[11px] text-surface-400 block mb-1">Token-Based Sim</span>
            <span className="text-2xl font-bold font-mono text-white">
              {report.token_similarity.toFixed(1)}%
            </span>
            <p className="text-[10px] text-surface-500 mt-0.5">TF-IDF N-grams</p>
          </div>

          <div className="bg-surface-950 p-3.5 rounded-xl border border-surface-800">
            <span className="text-[11px] text-surface-400 block mb-1">AST Structural Sim</span>
            <span className="text-2xl font-bold font-mono text-white">
              {report.structural_similarity.toFixed(1)}%
            </span>
            <p className="text-[10px] text-surface-500 mt-0.5">Syntax tree Jaccard</p>
          </div>

          <div className="bg-surface-950 p-3.5 rounded-xl border border-surface-800">
            <span className="text-[11px] text-surface-400 block mb-1">Semantic Sim</span>
            <span className="text-2xl font-bold font-mono text-white">
              {report.semantic_similarity.toFixed(1)}%
            </span>
            <p className="text-[10px] text-surface-500 mt-0.5">Character n-grams</p>
          </div>
        </div>

        {/* Matched Snippets */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-brand-400" />
            <span>Matched Code Patterns ({report.matched_snippets.length} matches)</span>
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {report.matched_snippets.length === 0 ? (
              <p className="text-xs text-surface-400 bg-surface-950 p-3 rounded-lg border border-surface-800">
                No identical multi-line code blocks isolated.
              </p>
            ) : (
              report.matched_snippets.map((snip, i) => (
                <div key={i} className="p-2.5 bg-surface-950 rounded-lg border border-surface-800 text-xs font-mono text-brand-200">
                  <div className="flex justify-between text-[10px] text-surface-400 mb-1">
                    <span>{report.student_a_name} (Line {snip.line_a})</span>
                    <span>{report.student_b_name} (Line {snip.line_b})</span>
                  </div>
                  <code>{snip.content}</code>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Faculty Review Decision Panel */}
        <div className="bg-surface-950 p-4 rounded-xl border border-surface-800 space-y-3">
          <h4 className="text-xs font-semibold uppercase text-surface-300 tracking-wider">Faculty Adjudication</h4>
          
          <div className="flex flex-wrap items-center gap-6 text-xs text-surface-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reviewed}
                onChange={(e) => setReviewed(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-surface-900 border-surface-700"
              />
              <span>Mark as Reviewed by Faculty</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={flagged}
                onChange={(e) => setFlagged(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-surface-900 border-surface-700"
              />
              <span className="text-rose-300">Keep Flagged for Disciplinary Review</span>
            </label>
          </div>

          <div>
            <label className="text-xs text-surface-400 block mb-1">Faculty Review Notes:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record findings: e.g. legitimate identical boilerplate vs uncredited collaborative implementation..."
              className="w-full p-2.5 bg-surface-900 border border-surface-700 rounded-lg text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 resize-none h-20"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-xl text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveReview}
            disabled={saving}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-brand-600/30"
          >
            {saving ? 'Saving...' : 'Save Adjudication'}
          </button>
        </div>
      </div>
    </div>
  );
};
