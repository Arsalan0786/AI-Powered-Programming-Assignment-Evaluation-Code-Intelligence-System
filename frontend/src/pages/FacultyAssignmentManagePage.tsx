import React, { useState, useEffect } from 'react';
import { Assignment } from '../types';
import { assignmentService } from '../services/api';
import {
  PlusCircle, BookOpen, Clock, HardDrive, Trash2, Edit3,
  CheckCircle2, X, AlertTriangle, Layers
} from 'lucide-react';

interface FacultyAssignmentManagePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const FacultyAssignmentManagePage: React.FC<FacultyAssignmentManagePageProps> = ({ onNavigate }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states for new assignment
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [timeLimit, setTimeLimit] = useState(2.0);
  const [memoryLimit, setMemoryLimit] = useState(256);
  const [allowedLangs, setAllowedLangs] = useState(['python', 'cpp', 'java', 'javascript']);

  // Dynamic test cases in form
  const [testCases, setTestCases] = useState<Array<{
    input_data: string;
    expected_output: string;
    weight: number;
    test_type: 'public' | 'hidden' | 'edge';
    is_hidden: boolean;
    explanation?: string;
  }>>([
    { input_data: '1 2 3\n3', expected_output: '0 1', weight: 1.0, test_type: 'public', is_hidden: false, explanation: 'Sample case' },
    { input_data: '-5 10 15\n10', expected_output: '0 2', weight: 1.5, test_type: 'hidden', is_hidden: true, explanation: 'Negative numbers hidden test' }
  ]);

  const fetchAssignments = async () => {
    try {
      const data = await assignmentService.list();
      setAssignments(data);
    } catch (err) {
      console.error("Failed to load assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleAddTestCase = () => {
    setTestCases([
      ...testCases,
      { input_data: '', expected_output: '', weight: 1.0, test_type: 'public', is_hidden: false }
    ]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assignmentService.create({
        title,
        description,
        instructions,
        difficulty,
        max_time_limit_sec: parseFloat(timeLimit.toString()),
        max_memory_limit_mb: parseInt(memoryLimit.toString()),
        allowed_languages: allowedLangs,
        scoring_weights: {
          correctness: 0.40, quality: 0.20, complexity: 0.15,
          robustness: 0.10, maintainability: 0.10, documentation: 0.05
        },
        test_cases: testCases
      });
      setShowCreateModal(false);
      // Reset form
      setTitle('');
      setDescription('');
      setInstructions('');
      fetchAssignments();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create assignment.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this assignment and its associated test cases?")) {
      try {
        await assignmentService.delete(id);
        fetchAssignments();
      } catch (err) {
        alert("Failed to delete assignment.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-surface-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Assignment Management</h1>
          <p className="text-xs sm:text-sm text-surface-400 mt-1">
            Author assignments, configure automated public & hidden evaluation suites, and set algorithmic constraints.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Assignment</span>
        </button>
      </div>

      {/* Assignment Cards List */}
      <div className="space-y-4">
        {assignments.map((asg) => (
          <div
            key={asg.id}
            className="bg-surface-900 border border-surface-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg hover:border-surface-700 transition"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  asg.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  asg.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {asg.difficulty}
                </span>
                <span className="text-xs text-surface-400 font-mono">Assignment #{asg.id}</span>
              </div>

              <h3 className="text-lg font-bold text-white">{asg.title}</h3>
              <p className="text-xs text-surface-400 line-clamp-2 leading-relaxed">{asg.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-surface-400 pt-1">
                <span>{asg.test_case_count} Test Cases</span>
                <span>{asg.submission_count} Submissions</span>
                <span className="font-mono">Time Limit: {asg.max_time_limit_sec}s</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('workspace', { assignmentId: asg.id })}
                className="px-3.5 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-xl text-xs font-semibold transition"
              >
                Inspect Problem
              </button>
              <button
                onClick={() => handleDelete(asg.id)}
                className="p-2 text-surface-400 hover:text-red-400 hover:bg-surface-950 rounded-xl transition"
                title="Delete Assignment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-3 border-b border-surface-800">
              <h3 className="text-xl font-bold text-white">Create Programming Assignment</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-surface-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div>
                <label className="text-surface-300 font-medium block mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Merge K Sorted Lists"
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="text-surface-300 font-medium block mb-1">Description & Requirements</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="State the algorithmic problem, input format, output format, and constraints..."
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 text-xs h-24"
                />
              </div>

              <div>
                <label className="text-surface-300 font-medium block mb-1">Implementation Guidelines & Big-O Constraints</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Expected Time Complexity: O(n log k). Avoid repeated linear scans."
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-surface-300 font-medium block mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="text-surface-300 font-medium block mb-1">Timeout (Sec)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseFloat(e.target.value))}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-surface-300 font-medium block mb-1">Max Memory (MB)</label>
                  <input
                    type="number"
                    value={memoryLimit}
                    onChange={(e) => setMemoryLimit(parseInt(e.target.value))}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Dynamic Test Cases */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-surface-300 font-semibold uppercase text-[11px] tracking-wider">
                    Evaluation Test Cases ({testCases.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 text-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Test Case
                  </button>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {testCases.map((tc, idx) => (
                    <div key={idx} className="bg-surface-950 p-3.5 rounded-xl border border-surface-800 space-y-2 relative">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-semibold text-white">Test Case #{idx + 1}</span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1 text-purple-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tc.is_hidden}
                              onChange={(e) => {
                                const next = [...testCases];
                                next[idx].is_hidden = e.target.checked;
                                next[idx].test_type = e.target.checked ? 'hidden' : 'public';
                                setTestCases(next);
                              }}
                            />
                            <span>Hidden from Student</span>
                          </label>
                          {testCases.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTestCase(idx)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-surface-400 block mb-0.5">Input (stdin)</label>
                          <textarea
                            value={tc.input_data}
                            onChange={(e) => {
                              const next = [...testCases];
                              next[idx].input_data = e.target.value;
                              setTestCases(next);
                            }}
                            placeholder="Input data"
                            className="w-full bg-surface-900 border border-surface-800 rounded-lg p-2 text-white font-mono text-[11px] h-14"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-surface-400 block mb-0.5">Expected Output (stdout)</label>
                          <textarea
                            value={tc.expected_output}
                            onChange={(e) => {
                              const next = [...testCases];
                              next[idx].expected_output = e.target.value;
                              setTestCases(next);
                            }}
                            placeholder="Expected output"
                            className="w-full bg-surface-900 border border-surface-800 rounded-lg p-2 text-white font-mono text-[11px] h-14"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md shadow-indigo-600/30 transition"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
