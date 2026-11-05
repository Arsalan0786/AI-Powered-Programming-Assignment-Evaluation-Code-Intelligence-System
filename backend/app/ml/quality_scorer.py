from typing import Dict, Any, List, Optional

DEFAULT_WEIGHTS = {
    "correctness": 0.40,
    "quality": 0.20,
    "complexity": 0.15,
    "robustness": 0.10,
    "maintainability": 0.10,
    "documentation": 0.05
}

class QualityScorer:
    """
    Multi-criteria scoring engine combining test outcomes, AST analysis,
    cyclomatic complexity, and documentation completeness.
    """

    def calculate_scores(
        self,
        functional_correctness_score: float,
        static_analysis: Dict[str, Any],
        complexity_report: Dict[str, Any],
        has_runtime_error: bool,
        weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        w = weights or DEFAULT_WEIGHTS

        # 1. Functional Correctness (0-100)
        c_score = float(functional_correctness_score)

        # 2. Static Code Quality (0-100)
        q_score = float(static_analysis.get("score", 85.0))

        # 3. Complexity Score (0-100)
        time_comp = complexity_report.get("estimated_time_complexity", "O(n)")
        complexity_scale = {
            "O(1)": 100.0,
            "O(log n)": 95.0,
            "O(n)": 90.0,
            "O(n log n)": 85.0,
            "O(n²)": 65.0,
            "O(n³)": 45.0,
            "O(2ⁿ)": 30.0,
            "O(n!)": 15.0,
            "Indeterminate": 50.0
        }
        comp_score = complexity_scale.get(time_comp, 75.0)

        # 4. Error Handling and Robustness (0-100)
        # Check if code handles exceptions or edge cases
        robustness_score = 90.0
        if has_runtime_error:
            robustness_score -= 50.0
        # If there are critical/high issues from static analysis
        issues = static_analysis.get("issues", [])
        for iss in issues:
            if iss.get("category") == "Robustness" or iss.get("severity") in ("Critical", "High"):
                robustness_score -= 10.0
        robustness_score = max(0.0, min(100.0, robustness_score))

        # 5. Maintainability and Readability (0-100)
        mi = complexity_report.get("maintainability_index", 80.0)
        cyclomatic = complexity_report.get("cyclomatic_complexity", 1)
        maint_score = float(mi)
        if cyclomatic > 10:
            maint_score -= 15.0
        maint_score = max(0.0, min(100.0, maint_score))

        # 6. Documentation (0-100)
        doc_issues = [i for i in issues if i.get("category") == "Documentation"]
        doc_score = 100.0 if not doc_issues else 50.0

        # Weighted final score
        final_score = (
            (c_score * w.get("correctness", 0.40)) +
            (q_score * w.get("quality", 0.20)) +
            (comp_score * w.get("complexity", 0.15)) +
            (robustness_score * w.get("robustness", 0.10)) +
            (maint_score * w.get("maintainability", 0.10)) +
            (doc_score * w.get("documentation", 0.05))
        )
        final_score = round(max(0.0, min(100.0, final_score)), 1)

        # Performance Tier
        if final_score >= 90.0:
            tier = "Exceptional"
        elif final_score >= 75.0:
            tier = "Proficient"
        elif final_score >= 60.0:
            tier = "Developing"
        else:
            tier = "Needs Remediation"

        # Strengths & Weaknesses
        strengths = []
        weaknesses = []

        if c_score >= 80.0:
            strengths.append("High functional accuracy across evaluated test suites.")
        else:
            weaknesses.append("Fails multiple functional or boundary test cases.")

        if comp_score >= 85.0:
            strengths.append(f"Optimal computational complexity ({time_comp}).")
        else:
            weaknesses.append(f"Sub-optimal time complexity ({time_comp}) with potential scaling bottlenecks.")

        if q_score >= 85.0:
            strengths.append("Clean code structure adhering to industry best practices.")
        else:
            weaknesses.append(f"Identified {len(issues)} code quality / styling issues.")

        if doc_score == 100.0:
            strengths.append("Functions are well-documented with appropriate docstrings.")
        else:
            weaknesses.append("Missing descriptive docstrings and parameter contracts.")

        return {
            "functional_score": round(c_score, 1),
            "quality_score": round(q_score, 1),
            "complexity_score": round(comp_score, 1),
            "robustness_score": round(robustness_score, 1),
            "maintainability_score": round(maint_score, 1),
            "documentation_score": round(doc_score, 1),
            "final_score": final_score,
            "performance_level": tier,
            "strengths": strengths,
            "weaknesses": weaknesses
        }

quality_scorer = QualityScorer()
