"""
Seed script to populate database with faculty, students, assignments,
test cases, and evaluated submissions demonstrating the full system capabilities.
"""

import sys
import os
import datetime

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    User, StudentProfile, FacultyProfile, Assignment, TestCase, Submission
)
from app.services.evaluation_service import evaluation_service

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data for clean demo
    print("Clearing previous records for clean database initialization...")
    db.query(Submission).delete()
    db.query(TestCase).delete()
    db.query(Assignment).delete()
    db.query(StudentProfile).delete()
    db.query(FacultyProfile).delete()
    db.query(User).delete()
    db.commit()

    print("Creating Faculty and Student user accounts...")
    # 1. Faculty User
    faculty = User(
        email="faculty@university.edu",
        hashed_password=get_password_hash("faculty123"),
        full_name="Dr. Eleanor Vance",
        role="faculty",
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=Eleanor+Vance"
    )
    db.add(faculty)
    db.commit()
    db.refresh(faculty)

    faculty_profile = FacultyProfile(
        user_id=faculty.id,
        employee_id="FAC-ENG-101",
        department="Computer Science & Systems",
        title="Professor & Department Chair"
    )
    db.add(faculty_profile)

    # 2. Student Users
    students_data = [
        ("alex.chen@university.edu", "student123", "Alex Chen", "STU-2024-001", 6),
        ("sarah.kim@university.edu", "student123", "Sarah Kim", "STU-2024-002", 6),
        ("jordan.lee@university.edu", "student123", "Jordan Lee", "STU-2024-003", 6),
    ]

    student_users = []
    for email, pwd, name, sid, sem in students_data:
        stu = User(
            email=email,
            hashed_password=get_password_hash(pwd),
            full_name=name,
            role="student",
            avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={name.replace(' ', '+')}"
        )
        db.add(stu)
        db.commit()
        db.refresh(stu)

        profile = StudentProfile(
            user_id=stu.id,
            student_id_number=sid,
            department="Computer Science & Engineering",
            semester=sem
        )
        db.add(profile)
        student_users.append(stu)

    db.commit()
    print("User accounts created successfully.")

    # 3. Create Assignments
    print("Creating core curriculum assignments...")

    # Assignment 1: Two Sum
    a1 = Assignment(
        title="Two Sum - Algorithmic Optimization",
        description=(
            "Given an array of integers 'nums' and an integer 'target', return the 0-based indices "
            "of the two numbers such that they add up to target.\n"
            "Assume each input has exactly one valid solution, and you may not use the same element twice.\n"
            "Input Format: Line 1: space-separated integers. Line 2: integer target.\n"
            "Output Format: two space-separated integers in ascending order."
        ),
        instructions=(
            "Standard solutions use a hash table for O(n) time complexity. "
            "Avoid brute-force nested iteration O(n²) where possible."
        ),
        allowed_languages=["python", "cpp", "java", "javascript"],
        difficulty="Easy",
        deadline=datetime.datetime.utcnow() + datetime.timedelta(days=14),
        max_time_limit_sec=2.0,
        max_memory_limit_mb=256,
        scoring_weights={
            "correctness": 0.40, "quality": 0.20, "complexity": 0.15,
            "robustness": 0.10, "maintainability": 0.10, "documentation": 0.05
        },
        created_by_faculty_id=faculty.id
    )
    db.add(a1)
    db.commit()
    db.refresh(a1)

    # Test cases for Assignment 1
    tc1_data = [
        {"input": "2 7 11 15\n9", "output": "0 1", "type": "public", "weight": 1.0, "hidden": False, "expl": "Standard positive array"},
        {"input": "3 2 4\n6", "output": "1 2", "type": "public", "weight": 1.0, "hidden": False, "expl": "Non-consecutive indices"},
        {"input": "3 3\n6", "output": "0 1", "type": "edge", "weight": 1.5, "hidden": False, "expl": "Duplicate elements edge case"},
        {"input": "-1 -2 -3 -4 -5\n-8", "output": "2 4", "type": "hidden", "weight": 1.5, "hidden": True, "expl": "Negative integers hidden case"}
    ]
    for tc in tc1_data:
        db.add(TestCase(
            assignment_id=a1.id,
            test_type=tc["type"],
            input_data=tc["input"],
            expected_output=tc["output"],
            weight=tc["weight"],
            explanation=tc["expl"],
            is_hidden=tc["hidden"]
        ))

    # Assignment 2: Valid Parentheses
    a2 = Assignment(
        title="Valid Parentheses & Bracket Matching",
        description=(
            "Given a string 's' containing '(', ')', '{', '}', '[' and ']', determine if the string is valid.\n"
            "Open brackets must be closed by the same type of brackets in the exact correct order.\n"
            "Input Format: single string on line 1.\n"
            "Output Format: 'true' or 'false'."
        ),
        instructions="Use a stack data structure for O(n) time and O(n) space complexity.",
        allowed_languages=["python", "cpp", "java", "javascript"],
        difficulty="Easy",
        deadline=datetime.datetime.utcnow() + datetime.timedelta(days=21),
        max_time_limit_sec=2.0,
        max_memory_limit_mb=256,
        scoring_weights={
            "correctness": 0.40, "quality": 0.20, "complexity": 0.15,
            "robustness": 0.10, "maintainability": 0.10, "documentation": 0.05
        },
        created_by_faculty_id=faculty.id
    )
    db.add(a2)
    db.commit()
    db.refresh(a2)

    tc2_data = [
        {"input": "()[]{}", "output": "true", "type": "public", "weight": 1.0, "hidden": False, "expl": "Basic sequence"},
        {"input": "(]", "output": "false", "type": "public", "weight": 1.0, "hidden": False, "expl": "Mismatched bracket types"},
        {"input": "([)]", "output": "false", "type": "edge", "weight": 1.5, "hidden": False, "expl": "Improper nesting edge case"},
        {"input": "{[]}", "output": "true", "type": "hidden", "weight": 1.5, "hidden": True, "expl": "Symmetric nested closure"}
    ]
    for tc in tc2_data:
        db.add(TestCase(
            assignment_id=a2.id,
            test_type=tc["type"],
            input_data=tc["input"],
            expected_output=tc["output"],
            weight=tc["weight"],
            explanation=tc["expl"],
            is_hidden=tc["hidden"]
        ))

    # Assignment 3: Longest Substring Without Repeating Characters
    a3 = Assignment(
        title="Longest Substring Without Repeating Characters",
        description=(
            "Given a string s, find the length of the longest substring without repeating characters.\n"
            "Input Format: single string on stdin.\n"
            "Output Format: single integer length."
        ),
        instructions="Apply the sliding window technique with dynamic window expansion and contraction.",
        allowed_languages=["python", "cpp", "java", "javascript"],
        difficulty="Medium",
        deadline=datetime.datetime.utcnow() + datetime.timedelta(days=28),
        max_time_limit_sec=2.0,
        max_memory_limit_mb=256,
        scoring_weights={
            "correctness": 0.40, "quality": 0.20, "complexity": 0.15,
            "robustness": 0.10, "maintainability": 0.10, "documentation": 0.05
        },
        created_by_faculty_id=faculty.id
    )
    db.add(a3)
    db.commit()
    db.refresh(a3)

    tc3_data = [
        {"input": "abcabcbb", "output": "3", "type": "public", "weight": 1.0, "hidden": False, "expl": "Substrings 'abc'"},
        {"input": "bbbbb", "output": "1", "type": "public", "weight": 1.0, "hidden": False, "expl": "All duplicate characters"},
        {"input": "pwwkew", "output": "3", "type": "edge", "weight": 1.5, "hidden": False, "expl": "Substrings with intermediate duplicates"},
        {"input": "dvdf", "output": "3", "type": "hidden", "weight": 1.5, "hidden": True, "expl": "Restart boundary condition"}
    ]
    for tc in tc3_data:
        db.add(TestCase(
            assignment_id=a3.id,
            test_type=tc["type"],
            input_data=tc["input"],
            expected_output=tc["output"],
            weight=tc["weight"],
            explanation=tc["expl"],
            is_hidden=tc["hidden"]
        ))

    db.commit()
    print("Assignments and test cases created successfully.")

    # 4. Create and Evaluate Sample Student Submissions
    print("Submitting and evaluating initial submissions...")

    # Alex Chen: Optimal Two Sum (O(n) Hash Map)
    alex_code = '''import sys

def solve():
    """Calculates two sum indices using an O(n) hash map."""
    lines = sys.stdin.read().strip().split('\\n')
    if not lines or len(lines) < 2:
        return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1])
    
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            res = sorted([seen[complement], i])
            print(f"{res[0]} {res[1]}")
            return
        seen[num] = i

if __name__ == '__main__':
    solve()
'''
    sub_alex = Submission(
        assignment_id=a1.id,
        student_id=student_users[0].id,
        language="python",
        source_code=alex_code,
        status="evaluating"
    )
    db.add(sub_alex)
    db.commit()
    db.refresh(sub_alex)
    evaluation_service.evaluate_submission(sub_alex.id, db)
    print("Alex's optimal submission evaluated.")

    # Sarah Kim: Quadratic Two Sum (O(n²) Brute Force)
    sarah_code = '''import sys

def find_indices():
    raw = sys.stdin.read().strip().split('\\n')
    if len(raw) < 2:
        return
    numbers = [int(x) for x in raw[0].split()]
    goal = int(raw[1])
    
    for i in range(len(numbers)):
        for j in range(i + 1, len(numbers)):
            if numbers[i] + numbers[j] == goal:
                print(str(i) + " " + str(j))
                return

find_indices()
'''
    sub_sarah = Submission(
        assignment_id=a1.id,
        student_id=student_users[1].id,
        language="python",
        source_code=sarah_code,
        status="evaluating"
    )
    db.add(sub_sarah)
    db.commit()
    db.refresh(sub_sarah)
    evaluation_service.evaluate_submission(sub_sarah.id, db)
    print("Sarah's brute-force submission evaluated.")

    # Jordan Lee: Highly similar to Sarah (Demonstrating Similarity Detection)
    jordan_code = '''import sys

def find_indices():
    data = sys.stdin.read().strip().split('\\n')
    if len(data) < 2:
        return
    vals = [int(v) for v in data[0].split()]
    target_sum = int(data[1])
    
    for idx_a in range(len(vals)):
        for idx_b in range(idx_a + 1, len(vals)):
            if vals[idx_a] + vals[idx_b] == target_sum:
                print(str(idx_a) + " " + str(idx_b))
                return

find_indices()
'''
    sub_jordan = Submission(
        assignment_id=a1.id,
        student_id=student_users[2].id,
        language="python",
        source_code=jordan_code,
        status="evaluating"
    )
    db.add(sub_jordan)
    db.commit()
    db.refresh(sub_jordan)
    evaluation_service.evaluate_submission(sub_jordan.id, db)
    print("Jordan's submission evaluated (similarity detection triggered).")

    # Alex Chen: Valid Parentheses Solution
    alex_code_p = '''import sys

def is_valid():
    """Validates bracket string using a stack."""
    s = sys.stdin.read().strip()
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                print("false")
                return
        else:
            stack.append(char)
            
    print("true" if not stack else "false")

if __name__ == '__main__':
    is_valid()
'''
    sub_alex_p = Submission(
        assignment_id=a2.id,
        student_id=student_users[0].id,
        language="python",
        source_code=alex_code_p,
        status="evaluating"
    )
    db.add(sub_alex_p)
    db.commit()
    db.refresh(sub_alex_p)
    evaluation_service.evaluate_submission(sub_alex_p.id, db)
    print("Alex's valid parentheses submission evaluated.")

    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed()

