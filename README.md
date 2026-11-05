# AI-Powered Programming Assignment Evaluation & Code Intelligence System

![System Status](https://img.shields.io/badge/System-Production--Ready-emerald?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20TS-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Scikit-Learn](https://img.shields.io/badge/Machine%20Learning-Scikit--Learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)
![Docker](https://img.shields.io/badge/Execution-Docker%20Sandbox-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Tests](https://img.shields.io/badge/Pytest-6%2F6%20Passed-brightgreen?style=for-the-badge)

An advanced automated programming assessment platform that evaluates students' programming assignments using automated code execution, static AST analysis, machine learning error classification, multi-method similarity detection, algorithmic complexity estimation, and personalized technical feedback.

---

## 1. System Capabilities & Architecture

Unlike traditional online judges that only report binary pass/fail test results, this system analyzes multiple dimensions of software quality:

1. **Automated Isolated Code Execution**:
   - Multi-language compilation and execution: **Python 3.12**, **C++ 17 (g++)**, **Java 21**, **JavaScript (Node.js 20)**.
   - Dual-mode execution engine: Production Docker container isolation (`--network none`, `--memory 256m`, `--cpus 1.0`, `--read-only`) with graceful Sandboxed Subprocess fallback.
   - Rigorous evaluation against public, edge, and hidden test suites with microsecond runtime and peak memory tracking.

2. **AST Static Code Analysis**:
   - Python AST analysis detecting dangerous functions (`eval`, `exec`), unreachable dead code, excessive control nesting (> 3 levels), PEP 8 style smells, function length thresholds, and missing documentation.
   - Issues categorized by severity (`Critical`, `High`, `Medium`, `Low`, `Informational`) with concrete refactoring recommendations.

3. **Algorithmic Time & Space Complexity Analyzer**:
   - AST-based Big-O estimation ($O(1), O(\log n), O(n), O(n \log n), O(n^2), O(n^3), O(2^n)$).
   - McCabe Cyclomatic Complexity computation ($1 + \text{Decision Points}$).
   - Software Engineering Institute (SEI) Maintainability Index estimation ($0 - 100$).

4. **Supervised ML Programming Error Classification**:
   - Real Scikit-learn model trained on TF-IDF code representations and runtime error traces across 13 distinct error classes (`index_out_of_range`, `null_reference`, `inefficient_algorithm`, `boundary_condition_error`, `recursion_error`, etc.).
   - Model saved as `.joblib` with confidence scoring and deterministic heuristic fallbacks.

5. **Multi-Method Code Similarity Radar**:
   - Token-based TF-IDF cosine similarity.
   - AST structural grammar n-gram Jaccard similarity.
   - Semantic character n-gram cosine similarity.
   - Interactive side-by-side faculty inspection modal with non-punitive academic integrity review flags.

6. **Comprehensive Quality Scoring & Personalized AI Feedback**:
   - Multi-criteria weighted scoring: Functional Correctness (40%), Static Quality (20%), Complexity (15%), Robustness (10%), Maintainability (10%), Documentation (5%).
   - Grounded, 7-section technical feedback: Overall Assessment, Functional Conformance, Code Quality, Complexity Diagnostics, Error Root Cause, Concrete Improvement Examples, and Curated CS Learning Recommendations.

---

## 2. Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React, Axios.
- **Backend**: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn.
- **Machine Learning & NLP**: Scikit-Learn (LogisticRegression, TF-IDF Vectorizer), NumPy, Pandas, Joblib.
- **Code Analysis**: Python `ast` module, Cyclomatic Decision Visitors, Structural Grammar Fingerprinters.
- **Database**: PostgreSQL (Production) / SQLite (Zero-Configuration Local Development).
- **Execution & DevOps**: Docker, Docker Compose, Multi-Stage Nginx Build.

---

## 3. Project Structure

```text
ai-code-intelligence/
├── frontend/                     # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, ScoreCard, Editor, Tables, Modals
│   │   ├── pages/                # Student/Faculty Dashboards, Workspace, Evaluation
│   │   ├── context/              # AuthContext (JWT state, quick role switcher)
│   │   ├── services/             # Axios API client services
│   │   ├── types/                # TypeScript interface contracts
│   │   ├── App.tsx               # Application routing and layout
│   │   └── main.tsx              # React DOM root entry
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                      # FastAPI Python Application
│   ├── app/
│   │   ├── api/                  # Auth, Assignments, Submissions, Evaluation, Analytics
│   │   ├── core/                 # Config, Database Engine, RFC 7519 JWT Security
│   │   ├── models/               # SQLAlchemy ORM Models
│   │   ├── schemas/              # Pydantic Request/Response Models
│   │   ├── execution/            # Docker Executor, Sandboxed Subprocess Runner
│   │   ├── analysis/             # AST Static Analyzer, Big-O Complexity Analyzer
│   │   ├── ml/                   # Error Classifier, Similarity Engine, Scorer, Feedback
│   │   └── main.py               # FastAPI App instance and middleware
│   ├── tests/                    # Pytest test suite (all modules)
│   ├── seed_data.py              # Curriculum seed script with pre-evaluated submissions
│   └── requirements.txt
│
├── ml_models/                    # Machine Learning Artifacts
│   ├── datasets/                 # programming_errors.json dataset
│   ├── training/                 # train_error_classifier.py
│   ├── saved_models/             # error_classifier.joblib pipeline
│   └── evaluation/               # metrics.json performance reports
│
├── docker/
│   ├── Dockerfile.backend        # Multi-language Python/GCC/JDK/Node runtime
│   ├── Dockerfile.frontend       # Multi-stage Vite build + Nginx production container
│   └── docker-compose.yml        # PostgreSQL + Backend + Frontend stack
│
├── docs/
│   ├── architecture.md           # System architecture & algorithmic design
│   ├── api_documentation.md      # OpenAPI/REST API reference
│   └── database_schema.md        # Entity-relationship schema
│
├── .env.example                  # Environment configuration template
├── .gitignore
└── README.md
```

---

## 4. Quick Start: Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- (Optional) Docker for containerized deployment

### Step 1: Initialize Database & Seed Demo Data
In the project root, run the database seed script to populate curricula, student accounts, test cases, and sample submissions:

```bash
python backend/seed_data.py
```

### Step 2: Run Backend Server
```bash
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
- API Base: `http://localhost:8000`
- Interactive Swagger API Documentation: `http://localhost:8000/docs`

### Step 3: Run Frontend Development Server
In a separate terminal:
```bash
cd frontend
npm run dev
```
- Open `http://localhost:5173` in your browser.

---

## 5. Demo Test Accounts

The platform includes 1-click login buttons in the UI for demonstration:

| Role | Email | Password | Full Name | Capabilities |
|---|---|---|---|---|
| **Student** | `alex.chen@university.edu` | `student123` | Alex Chen | Solve assignments, view test traces, receive AI feedback, track progress |
| **Student** | `sarah.kim@university.edu` | `student123` | Sarah Kim | Evaluated sample submission ($O(n^2)$ Two Sum brute force) |
| **Student** | `jordan.lee@university.edu`| `student123` | Jordan Lee| Similar code demonstrating plagiarism detection flag |
| **Faculty** | `faculty@university.edu`   | `faculty123` | Dr. Eleanor Vance | Author assignments, manage test suites, inspect similarity radar, view class analytics |

---

## 6. Running with Docker Compose

To deploy the entire production environment with PostgreSQL, FastAPI, and Nginx:

```bash
cd docker
docker-compose up --build
```

- Web Application: `http://localhost` (or `http://localhost:3000`)
- Backend API: `http://localhost:8000/api`
- PostgreSQL Database: `localhost:5432`

---

## 7. Running Backend Unit Tests

Run the test suite covering authentication, code execution, static AST analysis, Big-O complexity estimation, ML error classification, and similarity detection:

```bash
pytest backend/tests/test_backend.py -v
```

All 6 test suites execute and pass against the active backend components.

---

## 8. License

This project was engineered for university major project demonstrations and educational software engineering assessment platforms.

