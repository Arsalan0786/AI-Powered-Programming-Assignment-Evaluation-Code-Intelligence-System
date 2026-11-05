import re
from typing import List, Dict, Any, Tuple
from app.core.config import settings
from app.execution.sandbox_executor import sandbox_executor
from app.execution.docker_executor import docker_executor

class ExecutionRunner:
    """
    Automated test case evaluation engine.
    Dispatches execution to Docker container (if available) or Sandboxed Process,
    evaluates outputs against expected answers, and calculates correctness scores.
    """

    def __init__(self):
        self.use_docker = settings.USE_DOCKER_IF_AVAILABLE

    def run_all_test_cases(
        self,
        language: str,
        source_code: str,
        test_cases: List[Dict[str, Any]],
        timeout_sec: float = 2.0
    ) -> Tuple[List[Dict[str, Any]], float, float, float, str]:
        """
        Runs the student's code against all test cases.
        Returns:
            (results_list, total_execution_time_ms, max_memory_kb, functional_score, overall_status)
        """
        results = []
        total_time_ms = 0.0
        max_mem_kb = 0.0
        passed_weight = 0.0
        total_weight = 0.0
        first_error_summary = ""

        # Check if Docker should and can be used
        use_docker_now = False
        if self.use_docker:
            use_docker_now = docker_executor.is_docker_available()

        for tc in test_cases:
            tc_id = tc["id"]
            input_data = tc.get("input_data", "")
            expected_output = tc.get("expected_output", "")
            weight = tc.get("weight", 1.0)
            total_weight += weight

            # Execute
            if use_docker_now:
                try:
                    exec_res = docker_executor.execute(language, source_code, input_data, timeout_sec)
                except Exception:
                    exec_res = sandbox_executor.execute(language, source_code, input_data, timeout_sec)
            else:
                exec_res = sandbox_executor.execute(language, source_code, input_data, timeout_sec)

            exec_time = exec_res.get("execution_time_ms", 0.0)
            mem_kb = exec_res.get("memory_kb", 0.0)
            total_time_ms += exec_time
            max_mem_kb = max(max_mem_kb, mem_kb)

            actual_output = exec_res.get("stdout", "")
            status = exec_res.get("status", "Runtime Error")
            error_msg = exec_res.get("stderr", "")

            # If process completed cleanly, compare outputs
            if status == "Accepted":
                if self._outputs_match(actual_output, expected_output):
                    passed = True
                    passed_weight += weight
                else:
                    passed = False
                    status = "Wrong Answer"
                    if not first_error_summary:
                        first_error_summary = f"Wrong Answer on test case: expected '{expected_output[:40]}', got '{actual_output[:40]}'"
            else:
                passed = False
                if not first_error_summary:
                    first_error_summary = f"{status}: {error_msg[:120]}"

            results.append({
                "test_case_id": tc_id,
                "status": status,
                "actual_output": actual_output,
                "expected_output": expected_output if not tc.get("is_hidden", False) else None,
                "input_data": input_data if not tc.get("is_hidden", False) else None,
                "execution_time_ms": exec_time,
                "error_message": error_msg,
                "passed": passed,
                "is_hidden": tc.get("is_hidden", False),
                "test_type": tc.get("test_type", "public")
            })

            # Early break if compilation error
            if status == "Compilation Error":
                break

        # Calculate functional score
        functional_score = (passed_weight / total_weight * 100.0) if total_weight > 0 else 0.0
        functional_score = round(min(100.0, max(0.0, functional_score)), 1)

        overall_status = "Accepted" if functional_score >= 100.0 else "Partially Accepted"
        if functional_score == 0.0 and results:
            overall_status = results[0]["status"]

        return results, round(total_time_ms, 2), round(max_mem_kb, 2), functional_score, first_error_summary or overall_status

    def _outputs_match(self, actual: str, expected: str) -> bool:
        """Normalized comparison of outputs ignoring whitespace differences."""
        norm_actual = self._normalize(actual)
        norm_expected = self._normalize(expected)
        return norm_actual == norm_expected

    def _normalize(self, text: str) -> str:
        # Normalize CRLF to LF, strip trailing spaces per line, strip overall
        lines = [line.rstrip() for line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n")]
        # remove trailing empty lines
        while lines and not lines[-1]:
            lines.pop()
        return "\n".join(lines).strip()

execution_runner = ExecutionRunner()

