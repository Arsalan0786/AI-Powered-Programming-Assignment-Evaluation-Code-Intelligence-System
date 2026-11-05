import os
import joblib
from typing import Dict, Any, Optional

ERROR_METADATA = {
    "syntax_error": {
        "title": "Syntax & Parser Error",
        "description": "The program violates the grammatical rules of the programming language, preventing parsing or compilation.",
        "fix": "Check for missing colons, unbalanced parentheses, unclosed quotation marks, or incorrect indentation."
    },
    "index_out_of_range": {
        "title": "Index Out of Range Error",
        "description": "An array, list, or string element was accessed using an index outside its valid boundaries [0, length-1].",
        "fix": "Ensure loop upper bounds use '< len(arr)' rather than '<= len(arr)', and verify list emptiness prior to indexing."
    },
    "null_reference": {
        "title": "Null / None Reference Dereference",
        "description": "An attribute or method was invoked on a variable holding 'None' or null.",
        "fix": "Add guard clauses (e.g. 'if node is not None:') to verify references before dereferencing attributes."
    },
    "type_error": {
        "title": "Type Mismatch Error",
        "description": "An operation or function was applied to an object of an inappropriate type.",
        "fix": "Verify variable types using explicit casts (e.g. int(s), str(n)) or add type assertions."
    },
    "uninitialized_variable": {
        "title": "Uninitialized / Undefined Variable",
        "description": "A variable was referenced before being assigned a value in the current execution scope.",
        "fix": "Declare and initialize variables at the top of functions or prior to conditional evaluation branches."
    },
    "zero_division": {
        "title": "Division by Zero",
        "description": "An arithmetic division or modulo operation was attempted with a denominator evaluating to zero.",
        "fix": "Add a precondition check: 'if denominator == 0: handle_edge_case()' before executing division."
    },
    "recursion_error": {
        "title": "Unbounded / Maximum Recursion Exceeded",
        "description": "Recursive calls accumulated without hitting a terminating base case, causing stack overflow.",
        "fix": "Ensure every recursive path has a clearly defined base case that guarantees termination on reduced sub-problems."
    },
    "infinite_loop": {
        "title": "Infinite Loop / Timeout",
        "description": "Loop condition remains perpetually true because loop control variables are never mutated toward termination.",
        "fix": "Verify that loop variables increment/decrement inside every iteration branch toward the terminating condition."
    },
    "boundary_condition_error": {
        "title": "Boundary / Edge Case Failure",
        "description": "Code failed specifically on extreme test inputs: empty arrays, single elements, or exact boundary thresholds.",
        "fix": "Test your logic against edge inputs: empty inputs (n=0), single element (n=1), negative numbers, and boundary limits."
    },
    "loop_condition_error": {
        "title": "Loop Condition / Range Error",
        "description": "Loop terminated prematurely or skipped elements due to improper start, stop, or step arguments.",
        "fix": "Inspect range(start, stop, step) bounds and comparison operators (< vs <=)."
    },
    "inefficient_algorithm": {
        "title": "Algorithmic Inefficiency / TLE",
        "description": "The algorithm exhibits high time complexity (e.g. O(n²) or O(2ⁿ)), causing Time Limit Exceeded on larger inputs.",
        "fix": "Replace brute-force nested iteration with hash maps (dictionaries), two pointers, or dynamic programming memoization."
    },
    "logical_error": {
        "title": "Logical Miscalculation",
        "description": "Program executed cleanly but produced incorrect outputs due to flawed conditional or mathematical logic.",
        "fix": "Trace state transitions step-by-step with pen and paper or print statements on sample input traces."
    },
    "runtime_error": {
        "title": "General Runtime Exception",
        "description": "An unexpected exception halted execution during runtime.",
        "fix": "Review the runtime stack trace, check missing dictionary keys, or add defensive exception handling."
    }
}

class ProgrammingErrorClassifier:
    """
    ML-based programming error classifier trained on AST and error context features,
    with robust rule-based heuristic fallbacks.
    """

    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        # Resolve path to saved model
        curr_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.normpath(
            os.path.join(curr_dir, "..", "..", "..", "ml_models", "saved_models", "error_classifier.joblib")
        )
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
            except Exception as e:
                print(f"Warning: Failed to load ML model: {e}")
                self.model = None

    def classify_error(
        self,
        source_code: str,
        error_message: str,
        execution_status: str,
        failed_test_count: int = 0
    ) -> Dict[str, Any]:
        """
        Predicts error class using Scikit-learn model, or falls back to rule-based heuristics.
        """
        # Rule-based fast heuristics for unambiguous runtime errors
        rule_class = self._rule_based_check(error_message, execution_status)
        if rule_class:
            meta = ERROR_METADATA.get(rule_class, ERROR_METADATA["runtime_error"])
            return {
                "error_type": meta["title"],
                "predicted_class": rule_class,
                "confidence": 0.96,
                "description": meta["description"],
                "suggested_fix": meta["fix"],
                "is_ml_predicted": False
            }

        # If we have the trained ML model, predict
        if self.model is not None and (error_message or source_code):
            combined_text = f"{source_code[:1000]} \n [ERROR] {error_message}"
            try:
                pred_label = self.model.predict([combined_text])[0]
                proba = 0.88
                if hasattr(self.model, "predict_proba"):
                    probas = self.model.predict_proba([combined_text])[0]
                    proba = float(max(probas))

                meta = ERROR_METADATA.get(pred_label, ERROR_METADATA["logical_error"])
                return {
                    "error_type": meta["title"],
                    "predicted_class": pred_label,
                    "confidence": round(proba, 2),
                    "description": meta["description"],
                    "suggested_fix": meta["fix"],
                    "is_ml_predicted": True
                }
            except Exception:
                pass

        # Fallback for logical errors (e.g. Wrong Answer without crash)
        if execution_status == "Wrong Answer" or failed_test_count > 0:
            meta = ERROR_METADATA["logical_error"]
            return {
                "error_type": meta["title"],
                "predicted_class": "logical_error",
                "confidence": 0.80,
                "description": meta["description"],
                "suggested_fix": meta["fix"],
                "is_ml_predicted": False
            }

        return {
            "error_type": "Clean Execution",
            "predicted_class": "none",
            "confidence": 1.0,
            "description": "No execution defects or runtime errors detected.",
            "suggested_fix": "Maintain good coding practices and consider further performance optimizations.",
            "is_ml_predicted": False
        }

    def _rule_based_check(self, error_message: str, execution_status: str) -> Optional[str]:
        msg = error_message.lower()
        if "syntaxerror" in msg:
            return "syntax_error"
        if "indexerror" in msg or "out of range" in msg or "out of bounds" in msg:
            return "index_out_of_range"
        if "noneType" in msg or "nullpointer" in msg or "null pointer" in msg:
            return "null_reference"
        if "typeerror" in msg or "valueerror" in msg:
            return "type_error"
        if "nameerror" in msg or "unboundlocalerror" in msg:
            return "uninitialized_variable"
        if "zerodivisionerror" in msg or "division by zero" in msg:
            return "zero_division"
        if "recursionerror" in msg or "stack overflow" in msg:
            return "recursion_error"
        if "timelimitexceeded" in msg or execution_status == "Time Limit Exceeded":
            if "recursion" in msg:
                return "recursion_error"
            return "inefficient_algorithm"
        return None

error_classifier = ProgrammingErrorClassifier()
