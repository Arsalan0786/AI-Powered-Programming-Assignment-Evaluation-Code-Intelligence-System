from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Assignment, TestCase, User, Submission
from app.schemas.schemas import (
    AssignmentCreate, AssignmentUpdate, AssignmentResponse, AssignmentDetailResponse, TestCaseResponse
)
from app.api.auth import get_current_user, require_faculty

router = APIRouter(prefix="/assignments", tags=["Assignments"])

@router.get("", response_model=List[AssignmentResponse])
def list_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assignments = db.query(Assignment).order_by(Assignment.id.desc()).all()
    results = []
    for a in assignments:
        tc_count = len(a.test_cases)
        sub_count = len(a.submissions)
        results.append(AssignmentResponse(
            id=a.id,
            title=a.title,
            description=a.description,
            instructions=a.instructions,
            allowed_languages=a.allowed_languages,
            difficulty=a.difficulty,
            deadline=a.deadline,
            max_time_limit_sec=a.max_time_limit_sec,
            max_memory_limit_mb=a.max_memory_limit_mb,
            scoring_weights=a.scoring_weights,
            created_by_faculty_id=a.created_by_faculty_id,
            created_at=a.created_at,
            updated_at=a.updated_at,
            test_case_count=tc_count,
            submission_count=sub_count
        ))
    return results

@router.get("/{id}", response_model=AssignmentDetailResponse)
def get_assignment(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assignment = db.query(Assignment).filter(Assignment.id == id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")

    # Filter test cases: Students must NOT see hidden test cases
    tc_list = []
    for tc in assignment.test_cases:
        if current_user.role == "student" and tc.is_hidden:
            continue
        tc_list.append(TestCaseResponse(
            id=tc.id,
            assignment_id=tc.assignment_id,
            test_type=tc.test_type,
            input_data=tc.input_data,
            expected_output=tc.expected_output,
            weight=tc.weight,
            explanation=tc.explanation,
            is_hidden=tc.is_hidden
        ))

    return AssignmentDetailResponse(
        id=assignment.id,
        title=assignment.title,
        description=assignment.description,
        instructions=assignment.instructions,
        allowed_languages=assignment.allowed_languages,
        difficulty=assignment.difficulty,
        deadline=assignment.deadline,
        max_time_limit_sec=assignment.max_time_limit_sec,
        max_memory_limit_mb=assignment.max_memory_limit_mb,
        scoring_weights=assignment.scoring_weights,
        created_by_faculty_id=assignment.created_by_faculty_id,
        created_at=assignment.created_at,
        updated_at=assignment.updated_at,
        test_case_count=len(assignment.test_cases),
        submission_count=len(assignment.submissions),
        test_cases=tc_list
    )

@router.post("", response_model=AssignmentDetailResponse)
def create_assignment(
    req: AssignmentCreate,
    db: Session = Depends(get_db),
    faculty: User = Depends(require_faculty)
):
    assignment = Assignment(
        title=req.title,
        description=req.description,
        instructions=req.instructions,
        allowed_languages=req.allowed_languages,
        difficulty=req.difficulty,
        deadline=req.deadline,
        max_time_limit_sec=req.max_time_limit_sec,
        max_memory_limit_mb=req.max_memory_limit_mb,
        scoring_weights=req.scoring_weights or {
            "correctness": 0.40, "quality": 0.20, "complexity": 0.15,
            "robustness": 0.10, "maintainability": 0.10, "documentation": 0.05
        },
        created_by_faculty_id=faculty.id
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    # Add test cases
    for tc_data in req.test_cases:
        tc = TestCase(
            assignment_id=assignment.id,
            test_type=tc_data.test_type,
            input_data=tc_data.input_data,
            expected_output=tc_data.expected_output,
            weight=tc_data.weight,
            explanation=tc_data.explanation,
            is_hidden=tc_data.is_hidden
        )
        db.add(tc)
    db.commit()
    db.refresh(assignment)

    return get_assignment(assignment.id, db, faculty)

@router.put("/{id}", response_model=AssignmentDetailResponse)
def update_assignment(
    id: int,
    req: AssignmentUpdate,
    db: Session = Depends(get_db),
    faculty: User = Depends(require_faculty)
):
    assignment = db.query(Assignment).filter(Assignment.id == id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")

    for field, val in req.model_dump(exclude_unset=True).items():
        setattr(assignment, field, val)

    db.commit()
    db.refresh(assignment)
    return get_assignment(assignment.id, db, faculty)

@router.delete("/{id}")
def delete_assignment(
    id: int,
    db: Session = Depends(get_db),
    faculty: User = Depends(require_faculty)
):
    assignment = db.query(Assignment).filter(Assignment.id == id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")
    
    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted successfully."}
