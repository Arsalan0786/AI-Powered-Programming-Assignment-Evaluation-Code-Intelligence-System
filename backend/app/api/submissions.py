from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Submission, Assignment, User
from app.schemas.schemas import SubmissionCreate, SubmissionResponse
from app.api.auth import get_current_user
from app.services.evaluation_service import evaluation_service

router = APIRouter(prefix="/submissions", tags=["Submissions"])

@router.post("", response_model=SubmissionResponse)
def submit_code(
    req: SubmissionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assignment = db.query(Assignment).filter(Assignment.id == req.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")

    # Check allowed language
    allowed = [l.lower() for l in (assignment.allowed_languages or ["python"])]
    if req.language.lower() not in allowed:
        raise HTTPException(status_code=400, detail=f"Language '{req.language}' not allowed for this assignment.")

    # Create submission record
    sub = Submission(
        assignment_id=req.assignment_id,
        student_id=current_user.id,
        language=req.language.lower(),
        source_code=req.source_code,
        status="evaluating"
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    # Run complete evaluation synchronously so user immediately sees results upon submit
    sub = evaluation_service.evaluate_submission(sub.id, db)

    return SubmissionResponse(
        id=sub.id,
        assignment_id=sub.assignment_id,
        student_id=sub.student_id,
        student_name=current_user.full_name,
        assignment_title=assignment.title,
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

@router.get("", response_model=List[SubmissionResponse])
def list_submissions(
    assignment_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Submission)
    if current_user.role == "student":
        query = query.filter(Submission.student_id == current_user.id)
    if assignment_id:
        query = query.filter(Submission.assignment_id == assignment_id)

    submissions = query.order_by(Submission.submitted_at.desc()).all()
    results = []
    for s in submissions:
        student_name = s.student.full_name if s.student else "Student"
        title = s.assignment.title if s.assignment else "Assignment"
        results.append(SubmissionResponse(
            id=s.id,
            assignment_id=s.assignment_id,
            student_id=s.student_id,
            student_name=student_name,
            assignment_title=title,
            language=s.language,
            source_code=s.source_code,
            status=s.status,
            submitted_at=s.submitted_at,
            execution_time_ms=s.execution_time_ms,
            memory_used_kb=s.memory_used_kb,
            functional_score=s.functional_score,
            quality_score=s.quality_score,
            complexity_score=s.complexity_score,
            robustness_score=s.robustness_score,
            maintainability_score=s.maintainability_score,
            documentation_score=s.documentation_score,
            final_score=s.final_score,
            error_summary=s.error_summary
        ))
    return results

@router.get("/{id}", response_model=SubmissionResponse)
def get_submission(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sub = db.query(Submission).filter(Submission.id == id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")

    if current_user.role == "student" and sub.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to submission.")

    student_name = sub.student.full_name if sub.student else "Student"
    title = sub.assignment.title if sub.assignment else "Assignment"
    return SubmissionResponse(
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

