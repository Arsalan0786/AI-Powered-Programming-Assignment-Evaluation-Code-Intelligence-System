import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.models.models import (
    Submission, Assignment, TestCase, TestCaseResult,
    StaticAnalysisReport, ComplexityReport, ErrorClassification,
    SimilarityReport, FeedbackReport
)
from app.execution.runner import execution_runner
from app.analysis.static_analyzer import static_analyzer
from app.analysis.complexity_analyzer import complexity_analyzer
from app.ml.error_classifier import error_classifier
from app.ml.similarity_engine import similarity_engine
from app.ml.quality_scorer import quality_scorer
from app.ml.feedback_generator import feedback_generator

class EvaluationService:
    """
    Core Evaluation Orchestration Service.
    Coordinates test execution, static analysis, complexity estimation,
    ML error classification, similarity detection, quality scoring, and feedback generation.
    """

    def evaluate_submission(self, submission_id: int, db: Session) -> Submission:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            raise ValueError(f"Submission {submission_id} not found.")

        assignment = db.query(Assignment).filter(Assignment.id == submission.assignment_id).first()
        if not assignment:
            raise ValueError(f"Assignment {submission.assignment_id} not found.")

        submission.status = "evaluating"
        db.commit()

        # 1. Prepare test cases
        test_cases_data = []
        for tc in assignment.test_cases:
            test_cases_data.append({
                "id": tc.id,
                "input_data": tc.input_data,
                "expected_output": tc.expected_output,
                "weight": tc.weight,
                "is_hidden": tc.is_hidden,
                "test_type": tc.test_type
            })

        # 2. Execute Code
        test_results, total_time_ms, max_mem_kb, functional_score, first_error = execution_runner.run_all_test_cases(
            language=submission.language,
            source_code=submission.source_code,
            test_cases=test_cases_data,
            timeout_sec=assignment.max_time_limit_sec
        )

        # 3. Static Code Analysis
        static_res = static_analyzer.analyze(submission.source_code, submission.language)

        # 4. Complexity Analysis
        complexity_res = complexity_analyzer.analyze(submission.source_code, submission.language)

        # 5. ML-Based Error Classification
        failed_count = sum(1 for t in test_results if not t.get("passed", False))
        has_runtime_error = any(t.get("status") in ("Runtime Error", "Time Limit Exceeded", "Compilation Error") for t in test_results)
        error_class_res = error_classifier.classify_error(
            source_code=submission.source_code,
            error_message=first_error,
            execution_status="Runtime Error" if has_runtime_error else ("Wrong Answer" if failed_count > 0 else "Accepted"),
            failed_test_count=failed_count
        )

        # 6. Quality Scoring
        scores = quality_scorer.calculate_scores(
            functional_correctness_score=functional_score,
            static_analysis=static_res,
            complexity_report=complexity_res,
            has_runtime_error=has_runtime_error,
            weights=assignment.scoring_weights
        )

        # 7. Personalized Feedback Generation
        feedback_res = feedback_generator.generate_feedback(
            submission_info={"id": submission.id, "language": submission.language},
            test_results=test_results,
            static_analysis=static_res,
            complexity_report=complexity_res,
            error_info=error_class_res,
            scores=scores
        )

        # 8. Check Code Similarity with prior submissions for the same assignment
        prior_submissions = (
            db.query(Submission)
            .filter(
                Submission.assignment_id == assignment.id,
                Submission.id != submission.id,
                Submission.student_id != submission.student_id
            )
            .order_by(Submission.id.desc())
            .limit(15)
            .all()
        )

        for prior in prior_submissions:
            sim_report_data = similarity_engine.compare_submissions(
                submission.source_code, prior.source_code, submission.language
            )
            # Record if elevated similarity or randomly sample for monitoring
            if sim_report_data["overall_similarity"] >= 40.0:
                # Check if report already exists for pair
                existing_sim = db.query(SimilarityReport).filter(
                    SimilarityReport.assignment_id == assignment.id,
                    ((SimilarityReport.submission_id_a == submission.id) & (SimilarityReport.submission_id_b == prior.id)) |
                    ((SimilarityReport.submission_id_a == prior.id) & (SimilarityReport.submission_id_b == submission.id))
                ).first()

                if not existing_sim:
                    sim_record = SimilarityReport(
                        assignment_id=assignment.id,
                        submission_id_a=submission.id,
                        submission_id_b=prior.id,
                        token_similarity=sim_report_data["token_similarity"],
                        structural_similarity=sim_report_data["structural_similarity"],
                        semantic_similarity=sim_report_data["semantic_similarity"],
                        overall_similarity=sim_report_data["overall_similarity"],
                        is_flagged=sim_report_data["is_flagged"],
                        faculty_reviewed=False,
                        matched_snippets_json=sim_report_data["matched_snippets"]
                    )
                    db.add(sim_record)

        # 9. Clear any previous child records for re-evaluation
        db.query(TestCaseResult).filter(TestCaseResult.submission_id == submission.id).delete()
        db.query(StaticAnalysisReport).filter(StaticAnalysisReport.submission_id == submission.id).delete()
        db.query(ComplexityReport).filter(ComplexityReport.submission_id == submission.id).delete()
        db.query(ErrorClassification).filter(ErrorClassification.submission_id == submission.id).delete()
        db.query(FeedbackReport).filter(FeedbackReport.submission_id == submission.id).delete()

        # 10. Persist Test Case Results
        for tr in test_results:
            tc_res = TestCaseResult(
                submission_id=submission.id,
                test_case_id=tr["test_case_id"],
                status=tr["status"],
                actual_output=tr["actual_output"],
                execution_time_ms=tr["execution_time_ms"],
                error_message=tr["error_message"],
                passed=tr["passed"]
            )
            db.add(tc_res)

        # 11. Persist Static Analysis Report
        sa_model = StaticAnalysisReport(
            submission_id=submission.id,
            score=static_res["score"],
            summary=static_res["summary"],
            issues_json=static_res["issues"]
        )
        db.add(sa_model)

        # 12. Persist Complexity Report
        comp_model = ComplexityReport(
            submission_id=submission.id,
            estimated_time_complexity=complexity_res["estimated_time_complexity"],
            estimated_space_complexity=complexity_res["estimated_space_complexity"],
            cyclomatic_complexity=complexity_res["cyclomatic_complexity"],
            maintainability_index=complexity_res["maintainability_index"],
            explanation=complexity_res["explanation"],
            recommendations=complexity_res["recommendations"],
            detected_patterns_json=complexity_res["detected_patterns"]
        )
        db.add(comp_model)

        # 13. Persist Error Classification
        err_model = ErrorClassification(
            submission_id=submission.id,
            error_type=error_class_res["error_type"],
            confidence=error_class_res["confidence"],
            predicted_class=error_class_res["predicted_class"],
            description=error_class_res["description"],
            suggested_fix=error_class_res["suggested_fix"],
            is_ml_predicted=error_class_res["is_ml_predicted"]
        )
        db.add(err_model)

        # 14. Persist Feedback Report
        fb_model = FeedbackReport(
            submission_id=submission.id,
            overall_assessment=feedback_res["overall_assessment"],
            functional_analysis=feedback_res["functional_analysis"],
            quality_feedback=feedback_res["quality_feedback"],
            complexity_feedback=feedback_res["complexity_feedback"],
            error_explanation=feedback_res["error_explanation"],
            improvement_suggestions=feedback_res["improvement_suggestions"],
            learning_recommendations=feedback_res["learning_recommendations"],
            generated_at=datetime.datetime.utcnow()
        )
        db.add(fb_model)

        # 15. Update Submission Main Record
        submission.status = "completed"
        submission.execution_time_ms = total_time_ms
        submission.memory_used_kb = max_mem_kb
        submission.functional_score = scores["functional_score"]
        submission.quality_score = scores["quality_score"]
        submission.complexity_score = scores["complexity_score"]
        submission.robustness_score = scores["robustness_score"]
        submission.maintainability_score = scores["maintainability_score"]
        submission.documentation_score = scores["documentation_score"]
        submission.final_score = scores["final_score"]
        submission.error_summary = first_error

        db.commit()
        db.refresh(submission)
        return submission

evaluation_service = EvaluationService()
