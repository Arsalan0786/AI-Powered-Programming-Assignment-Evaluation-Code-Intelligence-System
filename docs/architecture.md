# System Architecture: AI-Powered Programming Assignment Evaluation & Code Intelligence System

## 1. Executive Architecture Overview

The **AI-Powered Programming Assignment Evaluation & Code Intelligence System** is an enterprise-grade automated assessment platform designed to transcend traditional binary pass/fail online judges. It evaluates student programming submissions across six orthogonal dimensions:

1. **Functional Correctness** (40%)
2. **Static Code Quality & Standards** (20%)
3. **Algorithmic Time & Space Complexity** (15%)
4. **Error Handling & Robustness** (10%)
5. **Readability & Maintainability** (10%)
6. **Documentation & Contracts** (5%)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React + Vite Frontend (SPA)                     │
│   [Student Dashboard] [Faculty Suite] [Code Workspace] [Radar Charts]  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ REST APIs (JSON / JWT)
┌────────────────────────────────────▼───────────────────────────────────┐
│                     FastAPI Application Gateway                        │
│   [Auth Guard] [Assignment API] [Submission Router] [Analytics API]   │
└──────────────┬─────────────────────┬───────────────────┬───────────────┘
               │                     │                   │
┌──────────────▼────────┐ ┌──────────▼──────────┐ ┌──────▼───────────────┐
│ Code Execution Engine │ │ Static & Complexity │ │ Machine Learning &   │
│ - Docker Isolation    │ │ - AST Syntax Tree   │ │ Code Intelligence    │
│ - Subprocess Sandbox  │ │ - Big-O Pattern Det │ │ - Error Classifier   │
│ - Multi-Language Comp │ │ - McCabe Cyclomatic │ │ - Multi-Sim Radar    │
│   (Py, C++, Java, JS) │ │ - SEI Maint. Index  │ │ - Feedback Generator │
└──────────────┬────────┘ └──────────┬──────────┘ └──────┬───────────────┘
               │                     │                   │
┌──────────────▼─────────────────────▼───────────────────▼───────────────┐
│                 PostgreSQL / SQLite Storage Layer                      │
│   (Users, Assignments, TestCases, Submissions, AST Reports, Similarity)│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Major Component Breakdown

### 2.1 Authentication & Role-Based Access Control (RBAC)
- Implements standard RFC 7519 HMAC-SHA256 JWT tokens.
- Secure password hashing using bcrypt with 12 salt rounds.
- Two distinct roles:
  - **Student**: Access to public assignments, interactive coding workspace, evaluation reports, performance progression curves.
  - **Faculty / Administrator**: Creation and editing of assignments, test case management (including hidden test cases), student submission registry, class-wide analytics, and similarity inspection.

### 2.2 Secure Multi-Language Code Execution Engine
- Supports **Python 3.12**, **C++ (g++ 13.2)**, **Java (OpenJDK 21)**, and **JavaScript (Node.js 20)**.
- **Dual-Mode Orchestration**:
  - **Production Docker Engine**: Mounts code into unprivileged ephemeral containers (`--network none`, `--memory 256m`, `--cpus 1.0`, `--read-only`).
  - **Sandboxed Subprocess Engine**: Direct local execution with process isolation, strict timeouts (2.0s per case), environment variable sanitization, and output normalization.
- Evaluates outputs against expected specifications, normalizing CRLF/LF line endings and trailing whitespace. Classifies results into: `Accepted`, `Wrong Answer`, `Runtime Error`, `Time Limit Exceeded`, and `Compilation Error`.

### 2.3 AST Static Code Analysis
- Operates via Python's built-in `ast` module.
- Identifies:
  - Dangerous functions (`eval()`, `exec()`, `os.system()`).
  - Dead / unreachable code after terminating statements (`return`, `raise`, `break`).
  - Excessive control nesting depth (> 3 levels).
  - Unused imports and variables.
  - Function length violations (> 25 lines).
  - PEP 8 naming convention violations.
  - Missing docstrings and redundant boolean comparisons.
- Assigns severity tiers: `Critical`, `High`, `Medium`, `Low`, and `Informational`.

### 2.4 Big-O Algorithmic Time and Space Complexity Analyzer
- Traverses AST syntax patterns:
  - Multi-branch recursive calls (`fib(n-1) + fib(n-2)`) $\rightarrow O(2^n)$
  - Triple nested loops $\rightarrow O(n^3)$
  - Double nested loops $\rightarrow O(n^2)$
  - Comparison sorting $\rightarrow O(n \log n)$
  - Divide-and-conquer binary search steps $\rightarrow O(\log n)$
  - Single loop / linear iteration $\rightarrow O(n)$
  - Direct calculation $\rightarrow O(1)$
- Calculates McCabe Cyclomatic Complexity:
  $$CC = 1 + \text{Decision Points}$$
- Approximates the Software Engineering Institute (SEI) Maintainability Index:
  $$MI = 171 - 5.2 \times \ln(V) - 0.23 \times CC - 16.2 \times \ln(LOC)$$

### 2.5 Machine Learning Programming Error Classifier
- Trained on diverse programming error contexts across 13 error archetypes:
  `syntax_error`, `index_out_of_range`, `null_reference`, `type_error`, `uninitialized_variable`, `zero_division`, `recursion_error`, `infinite_loop`, `boundary_condition_error`, `loop_condition_error`, `inefficient_algorithm`, `logical_error`, and `runtime_error`.
- Feature extraction using sublinear TF-IDF word and symbol n-grams (1-2 range).
- Supervised classification using balanced Logistic Regression.
- Evaluated and saved via joblib (`error_classifier.joblib`), accompanied by deterministic rule-based heuristic fallbacks.

### 2.6 Multi-Method Code Similarity Engine
- **Method 1 (Token-Based)**: Normalizes variable identifiers and keywords, strips comments, and calculates TF-IDF cosine similarity.
- **Method 2 (Structural AST)**: Extracts AST grammar node sequences, creates structural 3-grams, and calculates Jaccard similarity.
- **Method 3 (Semantic)**: Analyzes character-level n-grams with TF-IDF cosine similarity.
- **Weighted Similarity Composite**:
  $$\text{Overall Sim} = (0.40 \times \text{Token}) + (0.35 \times \text{Structural}) + (0.25 \times \text{Semantic})$$
- Pairs with similarity $\ge 70\%$ are flagged for faculty review. In accordance with pedagogical standards, similarity reports are treated as non-punitive flags for review, accounting for assignment boilerplate.

### 2.7 Personalized Feedback Generation Engine
- Generates 7 grounded technical feedback sections:
  1. Overall Assessment
  2. Functional Conformance
  3. Code Quality & Standards
  4. Algorithmic Complexity Evaluation
  5. Error Diagnostics & Defect Analysis
  6. Concrete Improvement Suggestions (with code diff patterns)
  7. Curated Learning Recommendations

