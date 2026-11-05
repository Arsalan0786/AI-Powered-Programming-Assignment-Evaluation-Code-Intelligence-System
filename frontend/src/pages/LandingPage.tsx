import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import {
  ShieldCheck, Cpu, ArrowRight, CheckCircle2,
  Bug, Eye, Sparkles, Terminal, Activity, Layers, Code2
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { quickLogin } = useAuth();

  const handleStart = async (role: 'student' | 'faculty') => {
    await quickLogin(role);
    onNavigate(role === 'faculty' ? 'faculty-dashboard' : 'student-dashboard');
  };

  return (
    <div className="min-h-screen bg-surface-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-brand-600/15 via-indigo-600/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none -z-10" />

      {/* Hero Section */}
      <div className="pt-20 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
        {/* Brand Mark in Hero */}
        <div className="flex justify-center mb-2">
          <Logo size="lg" subtitle="Automated Assessment & Algorithmic Diagnostics" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-surface-900 border border-surface-800 text-surface-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          <span>Next-Generation Automated Programming Judge & Assessment</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          AI-Powered Programming Assignment Evaluation &{' '}
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
            Code Intelligence
          </span>
        </h1>

        <p className="text-sm sm:text-base text-surface-400 max-w-2xl mx-auto leading-relaxed">
          Transcending binary pass/fail test cases. Evaluate student programs using AST static analysis, Big-O algorithmic complexity bounds, supervised ML defect classification, and grounded technical feedback.
        </p>

        {/* Quick Demo CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
          <button
            onClick={() => handleStart('student')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-glow-brand transition transform hover:-translate-y-0.5 ring-1 ring-brand-400/30"
          >
            <span>Launch Student Workspace (Alex)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleStart('faculty')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-900 hover:bg-surface-850 text-white border border-surface-800 font-semibold text-xs tracking-wide transition transform hover:-translate-y-0.5 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Faculty Assessment Suite (Dr. Vance)</span>
          </button>
        </div>

        <div className="pt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-surface-400 font-medium">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Docker Sandbox Isolation
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Big-O Pattern Bounds
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Scikit-Learn ML Classifier
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Token & AST Similarity Radar
          </span>
        </div>
      </div>

      {/* Feature Pillar Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12 space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Full-Stack Code Intelligence Architecture</h2>
          <p className="text-xs text-surface-400 max-w-lg mx-auto">Engineered for university computer science assessment and pedagogical diagnostics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-surface-900/70 border border-surface-800/80 p-6 rounded-2xl space-y-3 hover:border-brand-500/30 transition shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">Algorithmic Complexity Bounds</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Examines loop nesting depth, recursion frames, and divide-and-conquer bisection to estimate Big-O Time & Space complexity ($O(1)$ through $O(2^n)$).
            </p>
          </div>

          <div className="bg-surface-900/70 border border-surface-800/80 p-6 rounded-2xl space-y-3 hover:border-brand-500/30 transition shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Bug className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">ML Error Classification</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Trained Scikit-learn models classify 13 distinct programming error archetypes from execution traces and AST tokens with probabilistic confidence scoring.
            </p>
          </div>

          <div className="bg-surface-900/70 border border-surface-800/80 p-6 rounded-2xl space-y-3 hover:border-brand-500/30 transition shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">Multi-Method Similarity Radar</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Synthesizes Token TF-IDF, AST Structural fingerprints, and semantic n-grams to detect potential collusion while respecting standard problem boilerplate.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-surface-800/80 py-6 text-center text-[11px] font-mono text-surface-500">
        CodeIntel Autonomous Programming Assessment Platform • Senior Major Project Demonstration
      </footer>
    </div>
  );
};
