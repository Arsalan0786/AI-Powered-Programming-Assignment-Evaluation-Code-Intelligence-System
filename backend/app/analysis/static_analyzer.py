import ast
import re
from typing import Dict, List, Any

class StaticCodeAnalyzer:
    """
    Static code analysis engine using Python's AST module and lexical parsing.
    Detects code defects, security issues, maintainability issues, and style smells.
    """

    def __init__(self):
        pass

    def analyze(self, code: str, language: str = "python") -> Dict[str, Any]:
        if language.lower() != "python":
            # For non-python languages, provide lexical / rule-based static analysis
            return self._analyze_generic(code, language)
        return self._analyze_python(code)

    def _analyze_python(self, code: str) -> Dict[str, Any]:
        issues: List[Dict[str, Any]] = []

        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            issues.append({
                "name": "Syntax Error",
                "category": "Syntax",
                "severity": "Critical",
                "line": e.lineno or 1,
                "explanation": f"Source code contains a parse error: {e.msg}",
                "suggestion": "Fix syntax syntax errors before proceeding with execution."
            })
            return {
                "score": 0.0,
                "summary": "Syntax error encountered during parsing. Code cannot be statically verified.",
                "issues": issues
            }

        # 1. Inspect imports
        imported_names = {}
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imported_names[alias.asname or alias.name] = (node.lineno, alias.name)
            elif isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    imported_names[alias.asname or alias.name] = (node.lineno, alias.name)

        # Check which imported names are actually used
        all_names = {node.id for node in ast.walk(tree) if isinstance(node, ast.Name)}
        for name, (lineno, orig_name) in imported_names.items():
            # if name only appears in the import itself
            occurrences = sum(1 for node in ast.walk(tree) if isinstance(node, ast.Name) and node.id == name)
            if occurrences <= 0:
                issues.append({
                    "name": "Unused Import",
                    "category": "Maintainability",
                    "severity": "Low",
                    "line": lineno,
                    "explanation": f"Module or symbol '{orig_name}' is imported but never referenced.",
                    "suggestion": f"Remove 'import {orig_name}' to reduce clutter and overhead."
                })

        # 2. Inspect functions, nesting, documentation, and dead code
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                func_name = node.name
                
                # Missing docstring
                has_docstring = ast.get_docstring(node) is not None
                if not has_docstring and not func_name.startswith("__"):
                    issues.append({
                        "name": "Missing Function Documentation",
                        "category": "Documentation",
                        "severity": "Informational",
                        "line": node.lineno,
                        "explanation": f"Function '{func_name}' is missing a descriptive docstring.",
                        "suggestion": "Add docstrings describing the purpose, parameters, and return types."
                    })

                # Function length
                func_lines = (node.end_lineno or node.lineno) - node.lineno + 1
                if func_lines > 25:
                    issues.append({
                        "name": "Long Function",
                        "category": "Complexity",
                        "severity": "Medium",
                        "line": node.lineno,
                        "explanation": f"Function '{func_name}' is {func_lines} lines long (threshold: 25).",
                        "suggestion": "Decompose large functions into smaller helper functions with single responsibilities."
                    })

                # Poor naming conventions (non snake_case function)
                if not re.match(r"^[a-z_][a-z0-9_]*$", func_name) and not func_name.startswith("__"):
                    issues.append({
                        "name": "Naming Convention Violation",
                        "category": "Code Style",
                        "severity": "Low",
                        "line": node.lineno,
                        "explanation": f"Function '{func_name}' does not adhere to PEP 8 snake_case naming style.",
                        "suggestion": f"Rename '{func_name}' to lowercase words separated by underscores."
                    })

                # Dead code detection within function body
                for idx, stmt in enumerate(node.body[:-1]):
                    if isinstance(stmt, (ast.Return, ast.Raise)):
                        unreachable = node.body[idx + 1]
                        issues.append({
                            "name": "Unreachable Dead Code",
                            "category": "Logical",
                            "severity": "High",
                            "line": unreachable.lineno,
                            "explanation": f"Code at line {unreachable.lineno} appears after a terminating statement ('{type(stmt).__name__}').",
                            "suggestion": "Delete unreachable statements to maintain code clarity."
                        })
                        break

            # 3. Excessive nesting (> 3 levels)
            depth = self._get_nesting_depth(node)
            if depth > 3 and isinstance(node, (ast.If, ast.For, ast.While)):
                issues.append({
                    "name": "Excessive Nesting Depth",
                    "category": "Complexity",
                    "severity": "Medium",
                    "line": getattr(node, "lineno", 1),
                    "explanation": f"Control block exceeds recommended nesting depth ({depth} levels).",
                    "suggestion": "Use guard clauses, early returns, or extract inner logic into a helper method."
                })

            # 4. Potentially unsafe patterns (eval, exec, os.system)
            if isinstance(node, ast.Call):
                func_id = None
                if isinstance(node.func, ast.Name):
                    func_id = node.func.id
                elif isinstance(node.func, ast.Attribute):
                    func_id = node.func.attr

                if func_id in ("eval", "exec"):
                    issues.append({
                        "name": "Dangerous Execution Function",
                        "category": "Security",
                        "severity": "Critical",
                        "line": node.lineno,
                        "explanation": f"Direct use of '{func_id}()' allows arbitrary code execution and poses severe security hazards.",
                        "suggestion": f"Refactor your logic to avoid '{func_id}'. Use safe parsers like json or ast.literal_eval."
                    })

            # 5. Unnecessary boolean comparisons (e.g. if x == True, if len(arr) > 0)
            if isinstance(node, ast.Compare):
                for comparator in node.comparators:
                    if isinstance(comparator, ast.Constant) and isinstance(comparator.value, bool):
                        issues.append({
                            "name": "Redundant Boolean Comparison",
                            "category": "Code Quality",
                            "severity": "Low",
                            "line": node.lineno,
                            "explanation": f"Explicit comparison to boolean literal '{comparator.value}' is redundant.",
                            "suggestion": "Simplify condition: write 'if condition:' or 'if not condition:' directly."
                        })

            # 6. Bare except clause
            if isinstance(node, ast.ExceptHandler):
                if node.type is None:
                    issues.append({
                        "name": "Bare Exception Handler",
                        "category": "Robustness",
                        "severity": "High",
                        "line": node.lineno,
                        "explanation": "A bare 'except:' catches all exceptions, including KeyboardInterrupt and SystemExit.",
                        "suggestion": "Catch specific exception types (e.g., 'except ValueError:' or 'except Exception:')."
                    })

        # Calculate code quality score based on detected issues
        score = 100.0
        penalty_weights = {
            "Critical": 25.0,
            "High": 12.0,
            "Medium": 6.0,
            "Low": 2.5,
            "Informational": 1.0
        }
        for issue in issues:
            score -= penalty_weights.get(issue["severity"], 2.0)
        score = max(0.0, min(100.0, score))

        summary = (
            f"Static analysis found {len(issues)} issue(s). "
            f"Quality index evaluated at {score:.1f}/100."
        )

        return {
            "score": round(score, 1),
            "summary": summary,
            "issues": issues
        }

    def _get_nesting_depth(self, node: ast.AST) -> int:
        depth = 0
        curr = getattr(node, "parent", None)
        while curr:
            if isinstance(curr, (ast.If, ast.For, ast.While, ast.With, ast.Try)):
                depth += 1
            curr = getattr(curr, "parent", None)
        return depth

    def _analyze_generic(self, code: str, language: str) -> Dict[str, Any]:
        """Heuristic static analyzer for C++, Java, and JavaScript."""
        issues = []
        lines = code.split("\n")
        
        # Check for long lines or large files
        if len(lines) > 200:
            issues.append({
                "name": "File Length Exceeded",
                "category": "Maintainability",
                "severity": "Low",
                "line": len(lines),
                "explanation": f"Source file contains {len(lines)} lines.",
                "suggestion": "Modularize code into separate translation units or functions."
            })

        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            # Check console.log / debugging prints in JS / Java
            if language == "javascript" and "console.log" in stripped:
                issues.append({
                    "name": "Extraneous Debug Output",
                    "category": "Maintainability",
                    "severity": "Low",
                    "line": i,
                    "explanation": "Active console.log statement found in submission.",
                    "suggestion": "Remove debugging statements before production evaluation."
                })
            # Check goto in C++
            if language == "cpp" and re.search(r"\bgoto\s+\w+;", stripped):
                issues.append({
                    "name": "Unstructured Control Flow (goto)",
                    "category": "Code Quality",
                    "severity": "High",
                    "line": i,
                    "explanation": "Use of 'goto' creates hard-to-maintain spaghetti control flow.",
                    "suggestion": "Replace with structured loops, breaks, or function decomposition."
                })

        score = max(50.0, 100.0 - (len(issues) * 5.0))
        return {
            "score": round(score, 1),
            "summary": f"Static analysis for {language} found {len(issues)} issue(s).",
            "issues": issues
        }

static_analyzer = StaticCodeAnalyzer()
