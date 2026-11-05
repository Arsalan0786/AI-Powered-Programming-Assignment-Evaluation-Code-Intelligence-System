# REST API Reference Documentation

All endpoints are prefixed with `/api`. Protected routes require an `Authorization: Bearer <TOKEN>` HTTP header.

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a student or faculty account.
- **Request Body**:
  ```json
  {
    "email": "student@university.edu",
    "password": "Password123",
    "full_name": "Jane Doe",
    "role": "student",
    "student_id_number": "STU-2024-101",
    "department": "Computer Science & Engineering"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "student@university.edu",
      "full_name": "Jane Doe",
      "role": "student"
    }
  }
  ```

### `POST /api/auth/login`
Authenticates a user and returns a signed JWT token.
- **Request Body**:
  ```json
  {
    "email": "faculty@university.edu",
    "password": "faculty123"
  }
  ```

### `GET /api/auth/me`
Retrieves current authenticated profile and academic role metadata.

---

## 2. Assignment Endpoints

### `GET /api/assignments`
Lists all assignments with metadata, test case counts, and submission counts.

### `GET /api/assignments/{id}`
Returns detailed assignment requirements, constraints, and test cases.
> **Security Rule**: Hidden test case inputs and expected outputs are stripped from student responses.

### `POST /api/assignments` *(Faculty Only)*
Creates a new assignment and registers its test cases.
- **Request Body**:
  ```json
  {
    "title": "Two Sum - Algorithmic Optimization",
    "description": "Find pairs adding to target...",
    "instructions": "Expected complexity: O(n)",
    "allowed_languages": ["python", "cpp", "java", "javascript"],
    "difficulty": "Easy",
    "max_time_limit_sec": 2.0,
    "max_memory_limit_mb": 256,
    "test_cases": [
      {
        "test_type": "public",
        "input_data": "2 7 11 15\n9",
        "expected_output": "0 1",
        "weight": 1.0,
        "is_hidden": false
      }
    ]
  }
  ```

---

## 3. Submission & Evaluation Endpoints

### `POST /api/submissions`
Submits code for evaluation. Executes test suites, AST analysis, complexity estimation, ML classification, quality scoring, and feedback generation synchronously.
- **Request Body**:
  ```json
  {
    "assignment_id": 1,
    "language": "python",
    "source_code": "import sys\n# code..."
  }
  ```
- **Response** (200 OK): `SubmissionResponse` object with final score and execution times.

### `GET /api/evaluation/{submission_id}/report`
Returns comprehensive evaluation diagnostics:
- Functional test case results
- Static analysis issues and severity ratings
- Big-O complexity estimates
- ML error diagnosis
- Multi-criteria score breakdown
- 7-section personalized feedback

---

## 4. Code Similarity & Integrity Endpoints

### `GET /api/similarity/reports` *(Faculty Only)*
Returns similarity comparisons across student pairs. Query param `flagged_only=true` filters for pairs exceeding 70% composite similarity.

### `POST /api/similarity/{id}/review` *(Faculty Only)*
Records faculty review notes, adjudicates plagiarism vs legitimate boilerplate, and updates review status.

---

## 5. Analytics Endpoints

### `GET /api/student/analytics`
Returns student-specific performance progression, highest score, strongest programming skill, and personalized learning topics.

### `GET /api/faculty/analytics` *(Faculty Only)*
Returns class-wide metrics: grade distribution histogram, common error breakdown, language distribution, and complexity breakdown.
