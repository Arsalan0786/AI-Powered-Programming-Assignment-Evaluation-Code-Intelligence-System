import pytest
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.normpath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.analysis.static_analyzer import static_analyzer
from app.analysis.complexity_analyzer import complexity_analyzer
from app.ml.error_classifier import error_classifier
from app.ml.similarity_engine import similarity_engine
from app.ml.quality_scorer import quality_scorer
from app.execution.runner import execution_runner
from app.core.database import SessionLocal
from app.models.models import User, Assignment, Submission, SimilarityReport

def test_security_auth():
    raw = "SuperSecretPassword123"
    hashed = get_password_hash(raw)
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

    token = create_access_token({"sub": "42", "role": "faculty", "name": "Professor Vance"})
    payload = decode_access_token(token)
    assert payload["sub"] == "42"
    assert payload["role"] == "faculty"

def test_static_analysis():
    code_with_issues = """
import os
import sys

def BAD_NAMED_FUNCTION(x):
    y = x == True
    eval("2 + 2")
    return y
    print("unreachable dead code")
"""
    res = static_analyzer.analyze(code_with_issues, "python")
    assert res["score"] < 90.0
    issue_names = [i["name"] for i in res["issues"]]
    assert "Dangerous Execution Function" in issue_names
    assert "Unreachable Dead Code" in issue_names
    assert "Redundant Boolean Comparison" in issue_names

def test_complexity_analysis():
    # O(n^2) nested loop code
    code_nested = """
def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
"""
    res_nested = complexity_analyzer.analyze(code_nested, "python")
    assert res_nested["estimated_time_complexity"] == "O(n²)"

    # O(1) constant code
    code_const = """
def add_two(a, b):
    \"\"\"Docstring.\"\"\"
    return a + b
"""
    res_const = complexity_analyzer.analyze(code_const, "python")
    assert res_const["estimated_time_complexity"] == "O(1)"

def test_ml_error_classifier():
    # Test index error
    err_res = error_classifier.classify_error(
        source_code="arr = [1, 2]\nprint(arr[5])",
        error_message="IndexError: list index out of range",
        execution_status="Runtime Error"
    )
    assert err_res["predicted_class"] == "index_out_of_range"
    assert err_res["confidence"] > 0.70

    # Test recursion error
    rec_res = error_classifier.classify_error(
        source_code="def f(n): return f(n)",
        error_message="RecursionError: maximum recursion depth exceeded",
        execution_status="Runtime Error"
    )
    assert rec_res["predicted_class"] == "recursion_error"

def test_similarity_engine():
    code_a = """
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
"""
    # Renamed variables version
    code_b = """
def bubble_sort(elements):
    length = len(elements)
    for p in range(length):
        for q in range(0, length - p - 1):
            if elements[q] > elements[q + 1]:
                elements[q], elements[q + 1] = elements[q + 1], elements[q]
    return elements
"""
    sim = similarity_engine.compare_submissions(code_a, code_b, "python")
    assert sim["overall_similarity"] > 70.0
    assert sim["is_flagged"] is True

def test_execution_runner():
    code = """
import sys
line = sys.stdin.read().strip()
print(f"HELLO {line}")
"""
    tcs = [{"id": 1, "input_data": "WORLD", "expected_output": "HELLO WORLD", "weight": 1.0}]
    results, exec_time, mem, func_score, err = execution_runner.run_all_test_cases("python", code, tcs)
    assert func_score == 100.0
    assert results[0]["passed"] is True
    assert results[0]["actual_output"] == "HELLO WORLD"

def test_database_and_models():
    db = SessionLocal()
    try:
        faculty = db.query(User).filter(User.role == "faculty").first()
        assert faculty is not None
        assert faculty.email == "faculty@university.edu"

        students = db.query(User).filter(User.role == "student").all()
        assert len(students) >= 3

        assignments = db.query(Assignment).all()
        assert len(assignments) >= 3

        submissions = db.query(Submission).all()
        assert len(submissions) >= 3

        similarity_reports = db.query(SimilarityReport).all()
        assert len(similarity_reports) >= 1
    finally:
        db.close()
