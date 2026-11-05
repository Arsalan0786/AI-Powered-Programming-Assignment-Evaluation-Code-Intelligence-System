from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash, create_access_token, decode_access_token, security_bearer
)
from app.models.models import User, StudentProfile, FacultyProfile
from app.schemas.schemas import UserRegister, UserLogin, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(credentials=Depends(security_bearer), db: Session = Depends(get_db)) -> User:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token claims")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account not found")
    return user

def require_faculty(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role.lower() != "faculty":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to faculty and administrative personnel."
        )
    return current_user

@router.post("/register", response_model=Token)
def register(req: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    role = req.role.lower()
    if role not in ("student", "faculty"):
        role = "student"
    
    user = User(
        email=req.email.lower(),
        hashed_password=get_password_hash(req.password),
        full_name=req.full_name,
        role=role,
        avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={req.full_name}"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if role == "student":
        stud_id = req.student_id_number or f"STU-{user.id:04d}"
        profile = StudentProfile(
            user_id=user.id,
            student_id_number=stud_id,
            department=req.department or "Computer Science & Engineering"
        )
        db.add(profile)
    else:
        emp_id = req.employee_id or f"FAC-{user.id:04d}"
        profile = FacultyProfile(
            user_id=user.id,
            employee_id=emp_id,
            department=req.department or "Computer Science & Engineering"
        )
        db.add(profile)
    db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role, "name": user.full_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "avatar_url": user.avatar_url
        }
    }

@router.post("/login", response_model=Token)
def login(req: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": str(user.id), "role": user.role, "name": user.full_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "avatar_url": user.avatar_url
        }
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile_data = {}
    if current_user.role == "student" and current_user.student_profile:
        profile_data = {
            "student_id": current_user.student_profile.student_id_number,
            "department": current_user.student_profile.department,
            "semester": current_user.student_profile.semester
        }
    elif current_user.role == "faculty" and current_user.faculty_profile:
        profile_data = {
            "employee_id": current_user.faculty_profile.employee_id,
            "department": current_user.faculty_profile.department,
            "title": current_user.faculty_profile.title
        }

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "avatar_url": current_user.avatar_url,
        "profile": profile_data
    }
