import ast
import math
from typing import Dict, List, Any

class ComplexityAnalyzer:
    """
    Algorithmic Complexity & Efficiency Analysis Engine.
    Examines AST patterns to estimate Big-O Time and Space Complexity,
    McCabe Cyclomatic Complexity, and Maintainability Index.
    """

    def analyze(self, code: str, language: str = "python") -> Dict[str, Any]:
        if language.lower() != "python":
            return self._analyze_generic(code, language)
        return self._analyze_python(code)

    def _analyze_python(self, code: str) -> Dict[str, Any]:
        try:
            tree = ast.parse(code)
        except SyntaxError:
            return {
                "estimated_time_complexity": "Indeterminate",
                "estimated_space_complexity": "Indeterminate",
                "cyclomatic_complexity": 1,
                "maintainability_index": 50.0,
                "explanation": "Code contains syntax errors; complexity cannot be statically estimated.",
                "recommendations": "Resolve syntax errors first.",
                "detected_patterns": []
            }

        patterns = []
        max_loop_depth = 0
        has_recursion = False
        recursion_branching_factor = 1
        has_divide_and_conquer = False
        has_sort = False
        allocates_aux_memory = False
        has_hashmap = False

        # Cyclomatic complexity counters
        decision_points = 0

        # Calculate max loop nesting depth and inspect calls
        for node in ast.walk(tree):
            # McCabe decision points
            if isinstance(node, (ast.If, ast.While, ast.For, ast.AsyncFor,
                                ast.ExceptHandler, ast.With, ast.AsyncWith, ast.Assert)):
                decision_points += 1
            elif isinstance(node, ast.BoolOp):
                decision_points += max(0, len(node.values) - 1)

            # Check loop nesting
            if isinstance(node, (ast.For, ast.While)):
                depth = self._get_loop_nesting_depth(node)
                if depth > max_loop_depth:
                    max_loop_depth = depth

            # Check calls for sorting / hashmap operations / divide and conquer
            if isinstance(node, ast.Call):
                func_name = ""
                if isinstance(node.func, ast.Name):
                    func_name = node.func.id
                elif isinstance(node.func, ast.Attribute):
                    func_name = node.func.attr
                
                if func_name in ("sort", "sorted"):
                    has_sort = True
                if func_name in ("dict", "set"):
                    has_hashmap = True

            # Check divide-and-conquer binary division (// 2 or >> 1)
            if isinstance(node, ast.BinOp):
                if isinstance(node.op, (ast.FloorDiv, ast.Div, ast.RShift)):
                    if isinstance(node.right, ast.Constant) and node.right.value == 2:
                        has_divide_and_conquer = True

            # Check memory allocations (list comprehension, dict comprehension, list creation)
            if isinstance(node, (ast.ListComp, ast.DictComp, ast.SetComp)):
                allocates_aux_memory = True
            if isinstance(node, ast.Assign):
                if isinstance(node.value, (ast.List, ast.Dict, ast.Set)):
                    allocates_aux_memory = True

        # Check recursion in functions
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                fname = node.name
                recursive_calls = 0
                for child in ast.walk(node):
                    if isinstance(child, ast.Call):
                        cname = None
                        if isinstance(child.func, ast.Name):
                            cname = child.func.id
                        if cname == fname:
                            recursive_calls += 1
                if recursive_calls > 0:
                    has_recursion = True
                    recursion_branching_factor = max(recursion_branching_factor, recursive_calls)

        # Estimate Time Complexity based on detected patterns
        time_complexity = "O(1)"
        explanation = "The algorithm executes without repetitive iteration or recursive scaling."
        recommendation = "Optimal constant time execution."

        if has_recursion and recursion_branching_factor >= 2:
            time_complexity = "O(2ⁿ)"
            patterns.append({
                "pattern": "Multi-Branch Tree Recursion",
                "severity": "High",
                "detail": f"Function invokes itself {recursion_branching_factor} times per frame without memoization."
            })
            explanation = "Detected multi-branch recursive calls, which produce an exponential branching call tree."
            recommendation = "Apply memoization (dynamic programming) or iterative state tracking to reduce time complexity to O(n)."
        elif max_loop_depth >= 3:
            time_complexity = "O(n³)"
            patterns.append({
                "pattern": "Triple Nested Loop",
                "severity": "Critical",
                "detail": f"Detected loop nesting depth of {max_loop_depth}."
            })
            explanation = "Three nested loops execute sequentially for each dimension of input data."
            recommendation = "Refactor logic using auxiliary frequency tables, prefixes, or matrix transformations."
        elif max_loop_depth == 2:
            time_complexity = "O(n²)"
            patterns.append({
                "pattern": "Nested Loops",
                "severity": "Medium",
                "detail": "Inner loop executes across input size for every iteration of the outer loop."
            })
            explanation = "Inner loop runs proportional to the outer loop size, yielding quadratic runtime growth."
            recommendation = "Consider using a hash-based lookup (set or dictionary) to reduce repeated searching from O(n²) to O(n)."
        elif has_sort and max_loop_depth == 1:
            time_complexity = "O(n log n)"
            patterns.append({
                "pattern": "Loop with Sorting",
                "severity": "Low",
                "detail": "Loop iteration combined with comparison sort."
            })
            explanation = "Combines linear iteration with comparison sorting algorithms (Timsort/Quicksort)."
            recommendation = "Avoid sorting inside loop bodies; hoist the sort before iteration if possible."
        elif has_sort:
            time_complexity = "O(n log n)"
            patterns.append({
                "pattern": "Comparison Sorting",
                "severity": "Low",
                "detail": "Invokes standard comparison sort routine."
            })
            explanation = "Standard sorting algorithms require O(n log n) comparisons in the average and worst cases."
            recommendation = "Optimal for comparison-based ordering."
        elif max_loop_depth == 1 and has_divide_and_conquer:
            time_complexity = "O(log n)"
            patterns.append({
                "pattern": "Divide and Conquer Step",
                "severity": "Low",
                "detail": "Loop condition halves search space in each iteration (e.g. binary search)."
            })
            explanation = "The search interval is repeatedly bisected by half per iteration step."
            recommendation = "Optimal logarithmic search efficiency."
        elif max_loop_depth == 1 or (has_recursion and recursion_branching_factor == 1):
            time_complexity = "O(n)"
            patterns.append({
                "pattern": "Linear Iteration / Single Branch Recursion",
                "severity": "Low",
                "detail": "Single pass iteration or linear recursive chain over input collection."
            })
            explanation = "The algorithm inspects each element of the input collection once."
            recommendation = "Linear efficiency is generally optimal unless the input is pre-sorted or indexed."

        # Estimate Space Complexity
        if has_recursion and recursion_branching_factor >= 2:
            space_complexity = "O(n)"
            space_explanation = "Call stack depth scales linearly with input depth n."
        elif has_recursion:
            space_complexity = "O(n)"
            space_explanation = "Call stack frames accumulate proportional to recursion depth."
        elif allocates_aux_memory and (max_loop_depth >= 2):
            space_complexity = "O(n²)"
            space_explanation = "Auxiliary 2D matrix or collection allocated for each outer iteration."
        elif allocates_aux_memory or has_hashmap:
            space_complexity = "O(n)"
            space_explanation = "Auxiliary collection (list/set/dictionary) stores up to n elements."
        else:
            space_complexity = "O(1)"
            space_explanation = "Algorithm operates in-place using constant auxiliary variables."

        # Cyclomatic complexity (McCabe)
        cyclomatic = max(1, 1 + decision_points)

        # Maintainability Index estimate
        loc = len([l for l in code.split("\n") if l.strip() and not l.strip().startswith("#")])
        loc = max(1, loc)
        # Standard SEI maintainability index approximation
        mi = max(10.0, min(100.0, 171.0 - 5.2 * math.log(max(10, loc * 5)) - 0.23 * cyclomatic - 16.2 * math.log(loc)))

        return {
            "estimated_time_complexity": time_complexity,
            "estimated_space_complexity": space_complexity,
            "cyclomatic_complexity": cyclomatic,
            "maintainability_index": round(mi, 1),
            "explanation": f"Time: {explanation} Space: {space_explanation}",
            "recommendations": recommendation,
            "detected_patterns": patterns
        }

    def _get_loop_nesting_depth(self, node: ast.AST) -> int:
        depth = 1
        for child in ast.iter_child_nodes(node):
            if isinstance(child, (ast.For, ast.While)):
                depth = max(depth, 1 + self._get_loop_nesting_depth(child))
            else:
                for sub in ast.iter_child_nodes(child):
                    if isinstance(sub, (ast.For, ast.While)):
                        depth = max(depth, 1 + self._get_loop_nesting_depth(sub))
        return depth

    def _analyze_generic(self, code: str, language: str) -> Dict[str, Any]:
        """Pattern-based complexity estimation for C++, Java, JS."""
        lines = code.split("\n")
        loop_count = sum(1 for l in lines if any(k in l for k in ("for (", "for(", "while (", "while(")))
        has_nested = False
        prev_indent = 0
        indent_stack = []
        for l in lines:
            if "for" in l or "while" in l:
                cur_indent = len(l) - len(l.lstrip())
                if indent_stack and cur_indent > indent_stack[-1]:
                    has_nested = True
                indent_stack.append(cur_indent)

        time_comp = "O(n²)" if has_nested else ("O(n)" if loop_count > 0 else "O(1)")
        return {
            "estimated_time_complexity": time_comp,
            "estimated_space_complexity": "O(1)",
            "cyclomatic_complexity": max(1, loop_count + 1),
            "maintainability_index": 80.0,
            "explanation": f"Complexity estimated from lexical structure for {language}.",
            "recommendations": "Verify algorithmic efficiency against benchmark inputs.",
            "detected_patterns": [{"pattern": "Iteration Loop", "detail": f"{loop_count} loop construct(s) detected."}]
        }

complexity_analyzer = ComplexityAnalyzer()

