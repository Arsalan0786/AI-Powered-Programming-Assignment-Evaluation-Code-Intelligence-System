import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Terminal, ShieldCheck, Cpu, Code2, LineChart, Sparkles,
  ArrowRight, CheckCircle2, Lock, Layers, Bug, Eye
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { user, quickLogin } = useAuth();

  const handleStart = async (role: 'student' | 'faculty') => {
    await quickLogin(role);
    onNavigate(role === 'faculty' ? 'faculty-dashboard' : 'student-dashboard');
  };

  return (
    <div className="min-h-screen bg-surface-950 text-slate-100 flex flex-col justify-between">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-24 border-b border-surface-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))]" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Next-Generation Automated Programming Judge & Assessment</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            AI-Powered Programming Assignment Evaluation & <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Code Intelligence</span>
          </h1>

          <p className="text-base sm:text-lg text-surface-400 max-w-2xl mx-auto leading-relaxed">
            Beyond binary pass/fail test cases. Evaluate student code with AST static analysis, Big-O algorithmic complexity estimation, supervised ML defect classification, and grounded technical feedback.
          </p>

          {/* Quick Demo CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => handleStart('student')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 transition transform hover:-translate-y-0.5"
            >
              <span>Launch Student Workspace (Alex)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleStart('faculty')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-surface-900 hover:bg-surface-800 text-white border border-surface-700 font-semibold text-sm transition transform hover:-translate-y-0.5"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Faculty Dashboard (Dr. Vance)</span>
            </button>
          </div>

          <div className="pt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-surface-400 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Docker Sandbox Isolation</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Big-O Complexity Bounds</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Scikit-Learn Error Classifier</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Token & AST Similarity Radar</span>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Full-Stack Code Intelligence Architecture</h2>
          <p className="text-xs sm:text-sm text-surface-400 max-w-xl mx-auto">Comprehensive pipeline engineered for university programming assessment and pedagogical insight.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-900/60 border border-surface-800 p-6 rounded-2xl space-y-3 hover:border-brand-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Algorithmic Complexity</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Examines loop nesting and recursion patterns via AST visitors to estimate Big-O Time & Space complexity (O(1) through O(2ⁿ)).
            </p>
          </div>

          <div className="bg-surface-900/60 border border-surface-800 p-6 rounded-2xl space-y-3 hover:border-brand-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Bug className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">ML Error Classification</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Trained Scikit-learn models classify 13 distinct programming error archetypes with confidence scoring and fix recommendations.
            </p>
          </div>

          <div className="bg-surface-900/60 border border-surface-800 p-6 rounded-2xl space-y-3 hover:border-brand-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-Method Similarity</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Combines Token TF-IDF, AST Structural fingerprints, and semantic n-grams to flag potential collusion for faculty review.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-surface-800 py-6 text-center text-xs text-surface-500">
        AI-Powered Programming Assignment Evaluation System • Senior Major Project Demonstration
      </footer>
    </div>
  );
};
