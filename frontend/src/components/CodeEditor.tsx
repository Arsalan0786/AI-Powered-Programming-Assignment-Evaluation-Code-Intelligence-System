import React, { useState, useEffect } from 'react';
import { Play, Send, Save, RotateCcw, Check, Sparkles } from 'lucide-react';

interface CodeEditorProps {
  initialCode?: string;
  allowedLanguages?: string[];
  onSubmit: (code: string, language: string) => Promise<void>;
  onRunSample?: (code: string, language: string) => Promise<void>;
  isSubmitting?: boolean;
}

const TEMPLATES: Record<string, string> = {
  python: `import sys

def solve():
    # Read inputs from standard input
    input_data = sys.stdin.read().strip()
    if not input_data:
        return
    # TODO: Implement your solution here
    print("result")

if __name__ == '__main__':
    solve()
`,
  cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // TODO: Implement your solution
    return 0;
}
`,
  java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // TODO: Read input and implement solution
    }
}
`,
  javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    // TODO: Implement solution
}

solve();
`
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode,
  allowedLanguages = ['python', 'cpp', 'java', 'javascript'],
  onSubmit,
  onRunSample,
  isSubmitting = false,
}) => {
  const [language, setLanguage] = useState<string>(allowedLanguages[0] || 'python');
  const [code, setCode] = useState<string>(initialCode || TEMPLATES[language] || '');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    } else {
      setCode(TEMPLATES[language] || '');
    }
  }, [language, initialCode]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(TEMPLATES[newLang] || '');
  };

  const handleSaveDraft = () => {
    localStorage.setItem(`code_draft_${language}`, code);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(15, lineCount) }, (_, i) => i + 1);

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Editor Toolbar */}
      <div className="bg-surface-950 border-b border-surface-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-400 font-semibold uppercase">Language:</span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-surface-900 border border-surface-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 capitalize"
            >
              {allowedLanguages.map((lang) => (
                <option key={lang} value={lang.toLowerCase()}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setCode(TEMPLATES[language] || '')}
            className="flex items-center gap-1 text-xs text-surface-400 hover:text-white px-2 py-1 rounded transition"
            title="Reset to template"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        <div className="flex items-center gap-2">
          {savedNotice && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5" /> Draft Saved
            </span>
          )}
          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 text-xs text-surface-300 hover:text-white bg-surface-900 border border-surface-700 px-3 py-1.5 rounded-lg transition"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>

          {onRunSample && (
            <button
              onClick={() => onRunSample(code, language)}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 text-xs text-white bg-surface-800 hover:bg-surface-700 border border-surface-700 px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" /> Run Sample
            </button>
          )}

          <button
            onClick={() => onSubmit(code, language)}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 text-xs text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-600/30 px-4 py-1.5 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Submit for Evaluation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="flex flex-1 min-h-[460px] bg-surface-950 font-mono text-sm relative">
        {/* Line Numbers column */}
        <div className="select-none py-4 px-3 text-right bg-surface-950/90 text-surface-600 border-r border-surface-800/80 text-xs w-12 shrink-0">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6">
              {num}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="flex-1 p-4 bg-transparent text-slate-100 resize-none focus:outline-none leading-6 text-xs sm:text-sm font-mono selection:bg-brand-500/40"
          placeholder="Write or paste your solution code here..."
        />
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-surface-950 border-t border-surface-800 px-4 py-2 flex items-center justify-between text-[11px] text-surface-400">
        <div className="flex items-center gap-4">
          <span>Lines: {lineCount}</span>
          <span>Characters: {code.length}</span>
          <span>Mode: UTF-8</span>
        </div>
        <div className="flex items-center gap-1 text-brand-400">
          <Sparkles className="w-3 h-3" />
          <span>Docker Sandbox Ready</span>
        </div>
      </div>
    </div>
  );
};
