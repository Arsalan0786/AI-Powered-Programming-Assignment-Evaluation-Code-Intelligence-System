# Database Architecture & Entity-Relationship Schema

The database is built on SQLAlchemy and supports both **PostgreSQL** (production) and **SQLite** (local development).

---

## 1. Entity-Relationship Overview

```
 [User] 1 ──────── 1 [StudentProfile]
   │    1 ──────── 1 [FacultyProfile]
   │
   ├──────< 1:N >────── [Assignment] 1 ──────< 1:N >────── [TestCase]
   │                          │                                  │
   │                          │ 1:N                              │ 1:N
   │                          ▼                                  ▼
   └──────< 1:N >────── [Submission] 1 ──────< 1:N >────── [TestCaseResult]
                              │
                              ├── 1:1 ── [StaticAnalysisReport]
                              ├── 1:1 ── [ComplexityReport]
                              ├── 1:1 ── [ErrorClassification]
                              ├── 1:1 ── [FeedbackReport]
                              └── 1:N ── [SimilarityReport]
```

---

## 2. Table Specifications

### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, Auto-increment | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, INDEX, NOT NULL | University login email |
| `hashed_password` | VARCHAR(255) | NOT NULL | Bcrypt hash |
| `full_name` | VARCHAR(255) | NOT NULL | Student or faculty full name |
| `role` | VARCHAR(50) | NOT NULL | `'student'` or `'faculty'` |
| `avatar_url` | VARCHAR(500) | NULL | Dicebear avatar link |
| `created_at` | DATETIME | DEFAULT UTC | Creation timestamp |

### `assignments`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, Auto-increment | Assignment ID |
| `title` | VARCHAR(255) | INDEX, NOT NULL | Problem title |
| `description` | TEXT | NOT NULL | Problem specification |
| `instructions` | TEXT | NULL | Algorithmic constraints |
| `allowed_languages` | JSON | NOT NULL | Array of language tags |
| `difficulty` | VARCHAR(50) | DEFAULT 'Medium' | Easy, Medium, Hard |
| `deadline` | DATETIME | NULL | Submission cutoff |
| `max_time_limit_sec`| FLOAT | DEFAULT 2.0 | Execution timeout |
| `max_memory_limit_mb`| INTEGER | DEFAULT 256 | Memory limit |
| `scoring_weights` | JSON | NOT NULL | Category percentage weights |
| `created_by_faculty_id`| INTEGER | FK -> users.id | Faculty creator |

### `test_cases`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, Auto-increment | Test case ID |
| `assignment_id` | INTEGER | FK -> assignments.id | Parent assignment |
| `test_type` | VARCHAR(50) | DEFAULT 'public' | public, hidden, edge |
| `input_data` | TEXT | NOT NULL | Standard input |
| `expected_output`| TEXT | NOT NULL | Expected standard output |
| `weight` | FLOAT | DEFAULT 1.0 | Score weighting factor |
| `is_hidden` | BOOLEAN | DEFAULT FALSE | Hidden test flag |

### `submissions`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, Auto-increment | Submission ID |
| `assignment_id` | INTEGER | FK -> assignments.id | Associated assignment |
| `student_id` | INTEGER | FK -> users.id | Student author |
| `language` | VARCHAR(50) | NOT NULL | Programming language |
| `source_code` | TEXT | NOT NULL | Submitted source code |
| `status` | VARCHAR(50) | NOT NULL | pending, evaluating, completed |
| `execution_time_ms`| FLOAT | DEFAULT 0.0 | Total runtime |
| `memory_used_kb` | FLOAT | DEFAULT 0.0 | Peak memory |
| `functional_score` | FLOAT | 0 - 100 | Test correctness |
| `quality_score` | FLOAT | 0 - 100 | AST quality index |
| `complexity_score` | FLOAT | 0 - 100 | Big-O efficiency score |
| `final_score` | FLOAT | 0 - 100 | Weighted overall score |

### `static_analysis_reports`
- Stores structured AST analysis output, overall score, and JSON array of issue objects:
  `{ name, category, severity, line, explanation, suggestion }`.

### `complexity_reports`
- Stores `estimated_time_complexity`, `estimated_space_complexity`, `cyclomatic_complexity` (McCabe), `maintainability_index` (SEI), explanations, recommendations, and detected syntax patterns.

### `error_classifications`
- Stores `error_type`, `confidence`, `predicted_class`, `description`, `suggested_fix`, and `is_ml_predicted`.

### `similarity_reports`
- Stores comparison pairs `submission_id_a` and `submission_id_b`, `token_similarity`, `structural_similarity`, `semantic_similarity`, `overall_similarity`, `is_flagged`, `faculty_reviewed`, `faculty_notes`, and matching snippet line intervals.

### `feedback_reports`
- Stores the 7 sections of grounded technical feedback: `overall_assessment`, `functional_analysis`, `quality_feedback`, `complexity_feedback`, `error_explanation`, `improvement_suggestions`, and `learning_recommendations`.
