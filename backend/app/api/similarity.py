from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import SimilarityReport, User, Submission
from app.schemas.schemas import SimilarityReportResponse, SimilarityReviewRequest
from app.api.auth import require_faculty

router = APIRouter(prefix="/similarity", tags=["Code Similarity"])

@router.get("/reports", response_model=List[SimilarityReportResponse])
def get_similarity_reports(
    assignment_id: Optional[int] = None,
    flagged_only: bool = False,
    db: Session = Depends(get_db),
    faculty: User = Depends(require_faculty)
):
    query = db.query(SimilarityReport)
    if assignment_id:
        query = query.filter(SimilarityReport.assignment_id == assignment_id)
    if flagged_only:
        query = query.filter(SimilarityReport.is_flagged == True)

    reports = query.order_by(SimilarityReport.overall_similarity.desc()).all()
    results = []
    for r in reports:
        name_a = r.submission_a.student.full_name if (r.submission_a and r.submission_a.student) else "Student A"
        name_b = r.submission_b.student.full_name if (r.submission_b and r.submission_b.student) else "Student B"
        title = r.assignment.title if r.assignment else "Assignment"

        results.append(SimilarityReportResponse(
            id=r.id,
            assignment_id=r.assignment_id,
            assignment_title=title,
            submission_id_a=r.submission_id_a,
            submission_id_b=r.submission_id_b,
            student_a_name=name_a,
            student_b_name=name_b,
            token_similarity=r.token_similarity,
            structural_similarity=r.structural_similarity,
            semantic_similarity=r.semantic_similarity,
            overall_similarity=r.overall_similarity,
            is_flagged=r.is_flagged,
            faculty_reviewed=r.faculty_reviewed,
            faculty_notes=r.faculty_notes,
            matched_snippets=r.matched_snippets_json or [],
            created_at=r.created_at
        ))
    return results

@router.post("/{id}/review")
def review_similarity_report(
    id: int,
    req: SimilarityReviewRequest,
    db: Session = Depends(get_db),
    faculty: User = Depends(require_faculty)
):
    report = db.query(SimilarityReport).filter(SimilarityReport.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Similarity report not found.")

    report.faculty_reviewed = req.faculty_reviewed
    if req.faculty_notes is not None:
        report.faculty_notes = req.faculty_notes
    if req.is_flagged is not None:
        report.is_flagged = req.is_flagged

    db.commit()
    db.refresh(report)
    return {"message": "Similarity review successfully updated.", "id": report.id}
