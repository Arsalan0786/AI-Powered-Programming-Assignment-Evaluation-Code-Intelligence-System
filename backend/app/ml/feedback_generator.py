from typing import Dict, Any, List

class PersonalizedFeedbackGenerator:
    """
    Intelligent technical feedback generator.
    Produces comprehensive, multi-sectioned, grounded evaluations based on actual
    test execution results, static AST findings, Big-O estimates, and error classifications.
    """

    def generate_feedback(
        self,
        submission_info: Dict[str, Any],
        test_results: List[Dict[str, Any]],
        static_analysis: Dict[str, Any],
        complexity_report: Dict[str, Any],
        error_info: Dict[str, Any],
        scores: Dict[str, Any]
    ) -> Dict[str, Any]:
        passed_tests = sum(1 for t in test_results if t.get("passed", False))
        total_tests = len(test_results)
        final_score = scores.get("final_score", 0.0)
        time_comp = complexity_report.get("estimated_time_complexity", "O(n)")
        space_comp = complexity_report.get("estimated_space_complexity", "O(1)")
        error_class = error_info.get("predicted_class", "none")

        # --- A. Overall Assessment ---
        overall_assessment = (
            f"Your submission achieved an overall score of {final_score}/100 "
            f"({scores.get('performance_level', 'Developing')}). "
            f"The implementation passed {passed_tests} out of {total_tests} test cases. "
        )
        if final_score >= 90.0:
            overall_assessment += "The solution demonstrates production-grade algorithmic design, robust execution, and clean coding standards."
        elif final_score >= 70.0:
            overall_assessment += "The solution correctly solves the primary requirements but exhibits opportunities for optimization and boundary handling."
        else:
            overall_assessment += "The solution requires remediation in logical execution, test case conformance, and algorithmic complexity."

        # --- B. Functional Analysis ---
        if total_tests == 0:
            functional_analysis = "No evaluation test cases were registered for this assignment."
        elif passed_tests == total_tests:
            functional_analysis = (
                f"Outstanding: All {total_tests} test cases passed successfully, "
                "including all public examples, hidden test cases, and boundary stress scenarios."
            )
        else:
            failed_tests = [t for t in test_results if not t.get("passed", False)]
            failed_types = set(t.get("test_type", "public") for t in failed_tests)
            functional_analysis = (
                f"Your code successfully passed {passed_tests} of {total_tests} tests. "
                f"It failed {len(failed_tests)} test case(s) categorized as {', '.join(failed_types)}. "
            )
            # Give specific context on the first failure
            first_fail = failed_tests[0]
            if first_fail.get("status") == "Wrong Answer":
                functional_analysis += (
                    "The failure indicates an output discrepancy where the algorithm's calculated result "
                    "diverged from the expected specification on edge inputs."
                )
            elif first_fail.get("status") == "Time Limit Exceeded":
                functional_analysis += (
                    "Execution halted due to exceeding the maximum allowed time threshold. "
                    "This usually stems from inefficient nested looping or non-terminating while loops."
                )
            elif first_fail.get("status") == "Runtime Error":
                functional_analysis += f"A runtime exception occurred: {first_fail.get('error_message', '')[:100]}."

        # --- C. Code Quality Feedback ---
        issues = static_analysis.get("issues", [])
        if not issues:
            quality_feedback = (
                "Static analysis did not identify any code quality defects. "
                "The code follows clean naming conventions, safe execution patterns, and modular structure."
            )
        else:
            critical_high = [i for i in issues if i.get("severity") in ("Critical", "High")]
            quality_feedback = (
                f"Static analysis detected {len(issues)} code quality item(s) "
                f"(Quality Index: {static_analysis.get('score', 80.0)}/100). "
            )
            if critical_high:
                top_issue = critical_high[0]
                quality_feedback += (
                    f"Priority Attention: Found {top_issue.get('name')} at line {top_issue.get('line', '?')} - "
                    f"{top_issue.get('explanation')} {top_issue.get('suggestion')} "
                )
            else:
                top_issue = issues[0]
                quality_feedback += (
                    f"Notice: {top_issue.get('name')} at line {top_issue.get('line', '?')}: "
                    f"{top_issue.get('suggestion')} "
                )

        # --- D. Complexity Feedback ---
        complexity_feedback = (
            f"Estimated Algorithmic Time Complexity: {time_comp}. "
            f"Estimated Auxiliary Space Complexity: {space_comp}. "
            f"{complexity_report.get('explanation', '')} "
            f"Cyclomatic Complexity is rated at {complexity_report.get('cyclomatic_complexity', 1)} "
            f"with a Maintainability Index of {complexity_report.get('maintainability_index', 80.0)}/100."
        )

        # --- E. Error Explanation ---
        if error_class != "none" and error_class != "Clean Execution":
            error_explanation = (
                f"Detected Error Type: {error_info.get('error_type', 'Logical Error')} "
                f"(ML Confidence: {int(error_info.get('confidence', 0.8) * 100)}%). "
                f"{error_info.get('description', '')} "
                f"Fix Strategy: {error_info.get('suggested_fix', '')}"
            )
        else:
            error_explanation = "Clean Execution: The program executed without runtime faults or interpreter crashes."

        # --- F. Improvement Suggestions ---
        if time_comp in ("O(n²)", "O(n³)") and passed_tests < total_tests:
            improvement_suggestions = (
                "1. Algorithmic Optimization: Replace quadratic nested loops with a hash map (dictionary or set). "
                "This achieves constant-time O(1) lookups and reduces overall runtime from O(n²) to linear O(n).\n"
                "Example Pattern:\n"
                "  # Instead of nested linear search:\n"
                "  seen = {}\n"
                "  for i, num in enumerate(nums):\n"
                "      complement = target - num\n"
                "      if complement in seen:\n"
                "          return [seen[complement], i]\n"
                "      seen[num] = i\n"
                "2. Defensive Boundary Checks: Explicitly test len(input) == 0 and single element inputs before iterating."
            )
        elif issues:
            improvement_suggestions = (
                f"1. Refactoring: {issues[0].get('suggestion', 'Address static issues.')}\n"
                "2. Add docstrings with parameter definitions (PEP 257) and type annotations (PEP 484).\n"
                "3. Ensure all variable declarations use descriptive snake_case naming."
            )
        else:
            improvement_suggestions = (
                "1. Your solution is computationally sound. To further improve, consider typing annotations (from typing import List, Dict).\n"
                "2. Include unit test assertions directly within a test harness or main guard block.\n"
                "3. Document edge cases handled in the function docstring."
            )

        # --- G. Learning Recommendations ---
        learning_recommendations = []
        if time_comp in ("O(n²)", "O(n³)", "O(2ⁿ)"):
            learning_recommendations.extend([
                "Hash Map (Dictionary) Lookups for O(1) Amortized Retrieval",
                "Two-Pointer Technique and Sliding Window Optimization",
                "Dynamic Programming and Memoization Techniques"
            ])
        if error_class in ("index_out_of_range", "boundary_condition_error"):
            learning_recommendations.extend([
                "Defensive Programming and Boundary Condition Testing",
                "Loop Invariants and Off-By-One Index Verification"
            ])
        if error_class in ("recursion_error"):
            learning_recommendations.extend([
                "Call Stack Management and Recursive Base Case Guarantees",
                "Iterative Stack Conversion"
            ])
        if not learning_recommendations:
            learning_recommendations = [
                "Advanced Time-Space Complexity Trade-offs",
                "High-Performance Python Data Structures (collections.deque, bisect, heapq)",
                "Automated Property-Based Testing with Hypothesis"
            ]

        return {
            "overall_assessment": overall_assessment,
            "functional_analysis": functional_analysis,
            "quality_feedback": quality_feedback,
            "complexity_feedback": complexity_feedback,
            "error_explanation": error_explanation,
            "improvement_suggestions": improvement_suggestions,
            "learning_recommendations": learning_recommendations
        }

feedback_generator = PersonalizedFeedbackGenerator()

