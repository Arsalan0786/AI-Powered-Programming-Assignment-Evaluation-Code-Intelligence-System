import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- User & Auth Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: str
    role: str = "student"  # "student" or "faculty"

class UserRegister(UserBase):
    password: str
    student_id_number: Optional[str] = None
    employee_id: Optional[str] = None
    department: Optional[str] = "Computer Science & Engineering"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Test Case Schemas ---
class TestCaseBase(BaseModel):
    test_type: str = "public"
    input_data: str
    expected_output: str
    weight: float = 1.0
    explanation: Optional[str] = None
    is_hidden: bool = False

class TestCaseCreate(TestCaseBase):
    pass

class TestCaseResponse(TestCaseBase):
    id: int
    assignment_id: int

    class Config:
        from_attributes = True

# --- Assignment Schemas ---
class AssignmentBase(BaseModel):
    title: str
    description: str
    instructions: Optional[str] = None
    allowed_languages: List[str] = ["python", "cpp", "java", "javascript"]
    difficulty: str = "Medium"
    deadline: Optional[datetime.datetime] = None
    max_time_limit_sec: float = 2.0
    max_memory_limit_mb: int = 256
    scoring_weights: Optional[Dict[str, float]] = None

class AssignmentCreate(AssignmentBase):
    test_cases: List[TestCaseCreate] = []

class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    allowed_languages: Optional[List[str]] = None
    difficulty: Optional[str] = None
    deadline: Optional[datetime.datetime] = None
    max_time_limit_sec: Optional[float] = None
    max_memory_limit_mb: Optional[int] = None
    scoring_weights: Optional[Dict[str, float]] = None

class AssignmentResponse(AssignmentBase):
    id: int
    created_by_faculty_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    test_case_count: int = 0
    submission_count: int = 0

    class Config:
        from_attributes = True

class AssignmentDetailResponse(AssignmentResponse):
    test_cases: List[TestCaseResponse] = []

# --- Submission Schemas ---
class SubmissionCreate(BaseModel):
    assignment_id: int
    language: str
    source_code: str

class TestCaseResultResponse(BaseModel):
    id: int
    test_case_id: int
    status: str
    actual_output: Optional[str] = None
    execution_time_ms: float
    error_message: Optional[str] = None
    passed: bool
    is_hidden: bool = False
    test_type: str = "public"
    expected_output: Optional[str] = None
    input_data: Optional[str] = None

    class Config:
        from_attributes = True

class StaticIssue(BaseModel):
    name: str
    category: str
    severity: str  # Critical, High, Medium, Low, Informational
    line: Optional[int] = None
    explanation: str
    suggestion: str

class StaticAnalysisReportResponse(BaseModel):
    score: float
    summary: Optional[str] = None
    issues: List[StaticIssue] = []

class ComplexityReportResponse(BaseModel):
    estimated_time_complexity: str
    estimated_space_complexity: str
    cyclomatic_complexity: int
    maintainability_index: float
    explanation: Optional[str] = None
    recommendations: Optional[str] = None
    detected_patterns: List[Dict[str, Any]] = []

class ErrorClassificationResponse(BaseModel):
    error_type: str
    confidence: float
    predicted_class: str
    description: Optional[str] = None
    suggested_fix: Optional[str] = None
    is_ml_predicted: bool = True

class FeedbackReportResponse(BaseModel):
    overall_assessment: str
    functional_analysis: str
    quality_feedback: str
    complexity_feedback: str
    error_explanation: str
    improvement_suggestions: str
    learning_recommendations: List[str] = []
    generated_at: datetime.datetime

class SubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    student_name: Optional[str] = None
    assignment_title: Optional[str] = None
    language: str
    source_code: str
    status: str
    submitted_at: datetime.datetime
    execution_time_ms: float
    memory_used_kb: float
    functional_score: float
    quality_score: float
    complexity_score: float
    robustness_score: float
    maintainability_score: float
    documentation_score: float
    final_score: float
    error_summary: Optional[str] = None

    class Config:
        from_attributes = True

class EvaluationReportResponse(BaseModel):
    submission: SubmissionResponse
    test_results: List[TestCaseResultResponse] = []
    static_analysis: Optional[StaticAnalysisReportResponse] = None
    complexity_report: Optional[ComplexityReportResponse] = None
    error_classification: Optional[ErrorClassificationResponse] = None
    feedback: Optional[FeedbackReportResponse] = None

# --- Similarity Schemas ---
class SimilarityReportResponse(BaseModel):
    id: int
    assignment_id: int
    assignment_title: Optional[str] = None
    submission_id_a: int
    submission_id_b: int
    student_a_name: Optional[str] = None
    student_b_name: Optional[str] = None
    token_similarity: float
    structural_similarity: float
    semantic_similarity: float
    overall_similarity: float
    is_flagged: bool
    faculty_reviewed: bool
    faculty_notes: Optional[str] = None
    matched_snippets: List[Dict[str, Any]] = []
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class SimilarityReviewRequest(BaseModel):
    faculty_reviewed: bool
    faculty_notes: Optional[str] = None
    is_flagged: Optional[bool] = None

# --- Analytics Schemas ---
class StudentAnalytics(BaseModel):
    total_assignments: int
    submitted_assignments: int
    average_score: float
    best_score: float
    pending_assignments: int
    score_progression: List[Dict[str, Any]] = []
    strongest_skill: str
    frequent_mistake: str
    areas_for_improvement: List[str] = []
    recommended_topics: List[str] = []

class FacultyAnalytics(BaseModel):
    total_students: int
    total_assignments: int
    total_submissions: int
    average_class_score: float
    pending_evaluations: int
    score_distribution: List[Dict[str, Any]] = []
    assignment_performance: List[Dict[str, Any]] = []
    common_errors: List[Dict[str, Any]] = []
    complexity_distribution: List[Dict[str, Any]] = []
    language_distribution: List[Dict[str, Any]] = []
