from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Submission, TestCaseResult, TestCase
from app.schemas.schemas import (
    EvaluationReportResponse, SubmissionResponse, TestCaseResultResponse,
    StaticAnalysisReportResponse, ComplexityReportResponse,
    ErrorClassificationResponse, FeedbackReportResponse
)
from app.api.auth import get_current_user
from app.services.evaluation_service import evaluation_service

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])

@router.post("/{submission_id}/run", response_model=EvaluationReportResponse)
def trigger_evaluation(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")

    if current_user.role == "student" and sub.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized.")

    updated_sub = evaluation_service.evaluate_submission(submission_id, db)
    return get_evaluation_report(submission_id, db, current_user)

@router.get("/{submission_id}/report", response_model=EvaluationReportResponse)
def get_evaluation_report(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")

    if current_user.role == "student" and sub.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to evaluation report.")

    student_name = sub.student.full_name if sub.student else "Student"
    title = sub.assignment.title if sub.assignment else "Assignment"

    sub_resp = SubmissionResponse(
        id=sub.id,
        assignment_id=sub.assignment_id,
        student_id=sub.student_id,
        student_name=student_name,
        assignment_title=title,
        language=sub.language,
        source_code=sub.source_code,
        status=sub.status,
        submitted_at=sub.submitted_at,
        execution_time_ms=sub.execution_time_ms,
        memory_used_kb=sub.memory_used_kb,
        functional_score=sub.functional_score,
        quality_score=sub.quality_score,
        complexity_score=sub.complexity_score,
        robustness_score=sub.robustness_score,
        maintainability_score=sub.maintainability_score,
        documentation_score=sub.documentation_score,
        final_score=sub.final_score,
        error_summary=sub.error_summary
    )

    # Test Results (Hide input/expected_output if test is hidden and user is a student)
    tc_results = []
    for tr in sub.test_results:
        tc = tr.test_case
        is_hidden = tc.is_hidden if tc else False
        input_data = None if (is_hidden and current_user.role == "student") else (tc.input_data if tc else "")
        expected_output = None if (is_hidden and current_user.role == "student") else (tc.expected_output if tc else "")
        
        tc_results.append(TestCaseResultResponse(
            id=tr.id,
            test_case_id=tr.test_case_id,
            status=tr.status,
            actual_output=tr.actual_output if (not is_hidden or current_user.role == "faculty") else "[Hidden Test Case]",
            execution_time_ms=tr.execution_time_ms,
            error_message=tr.error_message,
            passed=tr.passed,
            is_hidden=is_hidden,
            test_type=tc.test_type if tc else "public",
            expected_output=expected_output,
            input_data=input_data
        ))

    # Static Analysis Report
    static_resp = None
    if sub.static_analysis:
        static_resp = StaticAnalysisReportResponse(
            score=sub.static_analysis.score,
            summary=sub.static_analysis.summary,
            issues=sub.static_analysis.issues_json or []
        )

    # Complexity Report
    comp_resp = None
    if sub.complexity_report:
        comp_resp = ComplexityReportResponse(
            estimated_time_complexity=sub.complexity_report.estimated_time_complexity,
            estimated_space_complexity=sub.complexity_report.estimated_space_complexity,
            cyclomatic_complexity=sub.complexity_report.cyclomatic_complexity,
            maintainability_index=sub.complexity_report.maintainability_index,
            explanation=sub.complexity_report.explanation,
            recommendations=sub.complexity_report.recommendations,
            detected_patterns=sub.complexity_report.detected_patterns_json or []
        )

    # Error Classification
    err_resp = None
    if sub.error_classification:
        err_resp = ErrorClassificationResponse(
            error_type=sub.error_classification.error_type,
            confidence=sub.error_classification.confidence,
            predicted_class=sub.error_classification.predicted_class,
            description=sub.error_classification.description,
            suggested_fix=sub.error_classification.suggested_fix,
            is_ml_predicted=sub.error_classification.is_ml_predicted
        )

    # Feedback
    fb_resp = None
    if sub.feedback:
        fb_resp = FeedbackReportResponse(
            overall_assessment=sub.feedback.overall_assessment,
            functional_analysis=sub.feedback.functional_analysis,
            quality_feedback=sub.feedback.quality_feedback,
            complexity_feedback=sub.feedback.complexity_feedback,
            error_explanation=sub.feedback.error_explanation,
            improvement_suggestions=sub.feedback.improvement_suggestions,
            learning_recommendations=sub.feedback.learning_recommendations or [],
            generated_at=sub.feedback.generated_at
        )

    return EvaluationReportResponse(
        submission=sub_resp,
        test_results=tc_results,
        static_analysis=static_resp,
        complexity_report=comp_resp,
        error_classification=err_resp,
        feedback=fb_resp
    )
