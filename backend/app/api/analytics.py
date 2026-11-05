from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Submission, Assignment, User, ErrorClassification, ComplexityReport
from app.schemas.schemas import StudentAnalytics, FacultyAnalytics
from app.api.auth import get_current_user, require_faculty

router = APIRouter(prefix="", tags=["Analytics"])

@router.get("/student/analytics", response_model=StudentAnalytics)
def get_student_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_assignments = db.query(Assignment).count()
    submissions = (
        db.query(Submission)
        .filter(Submission.student_id == current_user.id)
        .order_by(Submission.submitted_at.asc())
        .all()
    )

    submitted_count = len(submissions)
    scores = [s.final_score for s in submissions] if submissions else [0.0]
    avg_score = round(sum(scores) / len(scores), 1) if submissions else 0.0
    best_score = max(scores) if submissions else 0.0
    pending_count = max(0, total_assignments - len(set(s.assignment_id for s in submissions)))

    # Progression curve
    score_progression = []
    for s in submissions:
        title = s.assignment.title if s.assignment else f"Assignment {s.assignment_id}"
        score_progression.append({
            "submission_id": s.id,
            "assignment": title,
            "score": s.final_score,
            "correctness": s.functional_score,
            "quality": s.quality_score,
            "date": s.submitted_at.strftime("%b %d")
        })

    # Error analysis
    error_types = []
    for s in submissions:
        if s.error_classification and s.error_classification.predicted_class != "none":
            error_types.append(s.error_classification.error_type)
    
    most_common_error = "None detected (Clean performance)"
    if error_types:
        most_common_error = Counter(error_types).most_common(1)[0][0]

    # Strongest skills & areas
    strongest_skill = "Algorithmic Problem Solving" if avg_score >= 80 else "Basic Implementation"
    areas = ["Boundary Condition Handling", "Time Complexity Optimization (Hash Maps)"]
    topics = ["Two Pointers & Sliding Window", "Hash Tables for O(1) Lookup", "Dynamic Programming Memoization"]

    return StudentAnalytics(
        total_assignments=total_assignments,
        submitted_assignments=submitted_count,
        average_score=avg_score,
        best_score=best_score,
        pending_assignments=pending_count,
        score_progression=score_progression,
        strongest_skill=strongest_skill,
        frequent_mistake=most_common_error,
        areas_for_improvement=areas,
        recommended_topics=topics
    )

@router.get("/faculty/analytics", response_model=FacultyAnalytics)
def get_faculty_analytics(
    db: Session = Depends(get_db),
    faculty: User = Depends(require_faculty)
):
    total_students = db.query(User).filter(User.role == "student").count()
    total_assignments = db.query(Assignment).count()
    submissions = db.query(Submission).all()
    total_submissions = len(submissions)

    scores = [s.final_score for s in submissions] if submissions else [0.0]
    avg_class_score = round(sum(scores) / len(scores), 1) if submissions else 0.0
    pending_evals = sum(1 for s in submissions if s.status == "pending")

    # Score distribution brackets
    dist = {"90-100": 0, "80-89": 0, "70-79": 0, "60-69": 0, "Below 60": 0}
    for score in scores:
        if score >= 90:
            dist["90-100"] += 1
        elif score >= 80:
            dist["80-89"] += 1
        elif score >= 70:
            dist["70-79"] += 1
        elif score >= 60:
            dist["60-69"] += 1
        else:
            dist["Below 60"] += 1
    score_distribution = [{"bracket": k, "count": v} for k, v in dist.items()]

    # Assignment-wise performance
    assignments = db.query(Assignment).all()
    assignment_perf = []
    for a in assignments:
        a_subs = [s for s in submissions if s.assignment_id == a.id]
        a_avg = round(sum(s.final_score for s in a_subs) / len(a_subs), 1) if a_subs else 0.0
        assignment_perf.append({
            "id": a.id,
            "title": a.title,
            "submission_count": len(a_subs),
            "average_score": a_avg,
            "difficulty": a.difficulty
        })

    # Common errors
    errors = [s.error_classification.error_type for s in submissions if s.error_classification and s.error_classification.predicted_class != "none"]
    common_errors = [{"error": k, "count": v} for k, v in Counter(errors).most_common(5)]
    if not common_errors:
        common_errors = [{"error": "Clean Execution", "count": total_submissions or 1}]

    # Complexity distribution
    complexities = [s.complexity_report.estimated_time_complexity for s in submissions if s.complexity_report]
    complexity_dist = [{"complexity": k, "count": v} for k, v in Counter(complexities).items()]

    # Language distribution
    languages = [s.language.upper() for s in submissions]
    language_dist = [{"language": k, "count": v} for k, v in Counter(languages).items()]

    return FacultyAnalytics(
        total_students=total_students,
        total_assignments=total_assignments,
        total_submissions=total_submissions,
        average_class_score=avg_class_score,
        pending_evaluations=pending_evals,
        score_distribution=score_distribution,
        assignment_performance=assignment_perf,
        common_errors=common_errors,
        complexity_distribution=complexity_dist,
        language_distribution=language_dist
    )

