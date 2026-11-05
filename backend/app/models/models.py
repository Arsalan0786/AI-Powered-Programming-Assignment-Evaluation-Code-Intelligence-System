import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="student")  # "student" or "faculty"
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    faculty_profile = relationship("FacultyProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="student", cascade="all, delete-orphan")
    created_assignments = relationship("Assignment", back_populates="faculty", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    student_id_number = Column(String(50), unique=True, index=True, nullable=False)
    department = Column(String(100), default="Computer Science & Engineering")
    semester = Column(Integer, default=6)
    overall_rating = Column(Float, default=0.0)
    
    user = relationship("User", back_populates="student_profile")

class FacultyProfile(Base):
    __tablename__ = "faculty_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    department = Column(String(100), default="Computer Science & Engineering")
    title = Column(String(100), default="Associate Professor")
    
    user = relationship("User", back_populates="faculty_profile")

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    instructions = Column(Text, nullable=True)
    allowed_languages = Column(JSON, default=lambda: ["python", "cpp", "java", "javascript"])
    difficulty = Column(String(50), default="Medium")  # Easy, Medium, Hard
    deadline = Column(DateTime, nullable=True)
    max_time_limit_sec = Column(Float, default=2.0)
    max_memory_limit_mb = Column(Integer, default=256)
    
    # Faculty customizable scoring weights (default sum = 1.0)
    scoring_weights = Column(JSON, default=lambda: {
        "correctness": 0.40,
        "quality": 0.20,
        "complexity": 0.15,
        "robustness": 0.10,
        "maintainability": 0.10,
        "documentation": 0.05
    })
    
    created_by_faculty_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    faculty = relationship("User", back_populates="created_assignments")
    test_cases = relationship("TestCase", back_populates="assignment", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="assignment", cascade="all, delete-orphan")
    similarity_reports = relationship("SimilarityReport", back_populates="assignment", cascade="all, delete-orphan")

class TestCase(Base):
    __tablename__ = "test_cases"
    
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    test_type = Column(String(50), default="public")  # "public", "hidden", "edge"
    input_data = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=False)
    weight = Column(Float, default=1.0)
    explanation = Column(String(500), nullable=True)
    is_hidden = Column(Boolean, default=False)
    
    assignment = relationship("Assignment", back_populates="test_cases")
    results = relationship("TestCaseResult", back_populates="test_case", cascade="all, delete-orphan")

class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    language = Column(String(50), nullable=False)
    source_code = Column(Text, nullable=False)
    status = Column(String(50), default="pending")  # pending, evaluating, completed, error
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    execution_time_ms = Column(Float, default=0.0)
    memory_used_kb = Column(Float, default=0.0)
    
    # Sub-scores (0-100)
    functional_score = Column(Float, default=0.0)
    quality_score = Column(Float, default=0.0)
    complexity_score = Column(Float, default=0.0)
    robustness_score = Column(Float, default=0.0)
    maintainability_score = Column(Float, default=0.0)
    documentation_score = Column(Float, default=0.0)
    final_score = Column(Float, default=0.0)
    
    error_summary = Column(Text, nullable=True)
    
    student = relationship("User", back_populates="submissions")
    assignment = relationship("Assignment", back_populates="submissions")
    test_results = relationship("TestCaseResult", back_populates="submission", cascade="all, delete-orphan")
    static_analysis = relationship("StaticAnalysisReport", back_populates="submission", uselist=False, cascade="all, delete-orphan")
    complexity_report = relationship("ComplexityReport", back_populates="submission", uselist=False, cascade="all, delete-orphan")
    error_classification = relationship("ErrorClassification", back_populates="submission", uselist=False, cascade="all, delete-orphan")
    feedback = relationship("FeedbackReport", back_populates="submission", uselist=False, cascade="all, delete-orphan")

class TestCaseResult(Base):
    __tablename__ = "test_case_results"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False)
    test_case_id = Column(Integer, ForeignKey("test_cases.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="Accepted")  # Accepted, Wrong Answer, Runtime Error, Time Limit Exceeded, Compilation Error
    actual_output = Column(Text, nullable=True)
    execution_time_ms = Column(Float, default=0.0)
    error_message = Column(Text, nullable=True)
    passed = Column(Boolean, default=False)
    
    submission = relationship("Submission", back_populates="test_results")
    test_case = relationship("TestCase", back_populates="results")

class StaticAnalysisReport(Base):
    __tablename__ = "static_analysis_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id", ondelete="CASCADE"), unique=True, nullable=False)
    score = Column(Float, default=100.0)
    summary = Column(Text, nullable=True)
    issues_json = Column(JSON, default=list)  # [{name, category, severity, line, explanation, suggestion}]
    
    submission = relationship("Submission", back_populates="static_analysis")

class ComplexityReport(Base):
    __tablename__ = "complexity_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id", ondelete="CASCADE"), unique=True, nullable=False)
    estimated_time_complexity = Column(String(50), default="O(n)")
    estimated_space_complexity = Column(String(50), default="O(1)")
    cyclomatic_complexity = Column(Integer, default=1)
    maintainability_index = Column(Float, default=85.0)
    explanation = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    detected_patterns_json = Column(JSON, default=list)
    
    submission = relationship("Submission", back_populates="complexity_report")

class ErrorClassification(Base):
    __tablename__ = "error_classifications"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id", ondelete="CASCADE"), unique=True, nullable=False)
    error_type = Column(String(100), nullable=False)
    confidence = Column(Float, default=0.0)
    predicted_class = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    suggested_fix = Column(Text, nullable=True)
    is_ml_predicted = Column(Boolean, default=True)
    
    submission = relationship("Submission", back_populates="error_classification")

class SimilarityReport(Base):
    __tablename__ = "similarity_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    submission_id_a = Column(Integer, ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False)
    submission_id_b = Column(Integer, ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False)
    
    token_similarity = Column(Float, default=0.0)
    structural_similarity = Column(Float, default=0.0)
    semantic_similarity = Column(Float, default=0.0)
    overall_similarity = Column(Float, default=0.0)
    
    is_flagged = Column(Boolean, default=False)
    faculty_reviewed = Column(Boolean, default=False)
    faculty_notes = Column(Text, nullable=True)
    matched_snippets_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    assignment = relationship("Assignment", back_populates="similarity_reports")
    submission_a = relationship("Submission", foreign_keys=[submission_id_a])
    submission_b = relationship("Submission", foreign_keys=[submission_id_b])

class FeedbackReport(Base):
    __tablename__ = "feedback_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id", ondelete="CASCADE"), unique=True, nullable=False)
    overall_assessment = Column(Text, nullable=False)
    functional_analysis = Column(Text, nullable=False)
    quality_feedback = Column(Text, nullable=False)
    complexity_feedback = Column(Text, nullable=False)
    error_explanation = Column(Text, nullable=False)
    improvement_suggestions = Column(Text, nullable=False)
    learning_recommendations = Column(JSON, default=list)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    submission = relationship("Submission", back_populates="feedback")
