import ast
import re
from typing import Dict, List, Any, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class CodeSimilarityEngine:
    """
    Multi-method code similarity detection engine.
    Implements Token-based, Structural AST, and Semantic Similarity.
    Detects potential plagiarism while accounting for assignment boilerplate.
    """

    def compare_submissions(
        self,
        code_a: str,
        code_b: str,
        language: str = "python"
    ) -> Dict[str, Any]:
        """
        Executes 3 distinct similarity comparison algorithms and synthesizes an overall report.
        """
        token_sim = self._calculate_token_similarity(code_a, code_b)
        struct_sim = self._calculate_structural_similarity(code_a, code_b, language)
        semantic_sim = self._calculate_semantic_similarity(code_a, code_b)

        # Weighted combination
        overall = (0.40 * token_sim) + (0.35 * struct_sim) + (0.25 * semantic_sim)
        overall = round(min(100.0, max(0.0, overall * 100.0)), 1)

        is_flagged = overall >= 70.0

        matched_snippets = self._extract_matching_blocks(code_a, code_b)

        return {
            "token_similarity": round(token_sim * 100.0, 1),
            "structural_similarity": round(struct_sim * 100.0, 1),
            "semantic_similarity": round(semantic_sim * 100.0, 1),
            "overall_similarity": overall,
            "is_flagged": is_flagged,
            "matched_snippets": matched_snippets,
            "notes": (
                "Submission pair flagged for faculty review due to elevated similarity threshold (>= 70%). "
                "Review against boilerplate code before drawing academic integrity conclusions."
                if is_flagged else
                "Similarity within normal peer baseline for standardized algorithmic problem solving."
            )
        }

    def _calculate_token_similarity(self, code_a: str, code_b: str) -> float:
        """Tokenize source code with identifier normalization and compute TF-IDF cosine similarity."""
        norm_a = self._normalize_tokens(code_a)
        norm_b = self._normalize_tokens(code_b)

        if not norm_a.strip() or not norm_b.strip():
            return 0.0

        try:
            vectorizer = TfidfVectorizer(ngram_range=(1, 3), token_pattern=r"(?u)\b\w+\b|[^\w\s]")
            tfidf_matrix = vectorizer.fit_transform([norm_a, norm_b])
            sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(sim)
        except Exception:
            return 0.0

    def _normalize_tokens(self, code: str) -> str:
        # Strip comments
        lines = []
        for line in code.split("\n"):
            line = re.sub(r"#.*$", "", line)
            line = re.sub(r"//.*$", "", line)
            lines.append(line)
        cleaned = "\n".join(lines)
        
        # Replace variable / function identifiers with generic tokens
        # e.g., words followed by = or in def
        cleaned = re.sub(r"\b(def|class|return|if|else|elif|for|while|in|import|from|with|try|except|pass)\b", r"KW_\1", cleaned)
        cleaned = re.sub(r"\b[a-zA-Z_][a-zA-Z0-9_]*\b", "ID", cleaned)
        return cleaned

    def _calculate_structural_similarity(self, code_a: str, code_b: str, language: str) -> float:
        """Parses AST node sequences and computes Jaccard similarity of structural n-grams."""
        if language.lower() != "python":
            return self._calculate_token_similarity(code_a, code_b)

        try:
            tree_a = ast.parse(code_a)
            tree_b = ast.parse(code_b)
        except SyntaxError:
            return 0.0

        seq_a = [type(node).__name__ for node in ast.walk(tree_a)]
        seq_b = [type(node).__name__ for node in ast.walk(tree_b)]

        if not seq_a or not seq_b:
            return 0.0

        # Build 3-grams of AST node sequence
        def get_ngrams(seq, n=3):
            return set(tuple(seq[i:i+n]) for i in range(max(0, len(seq) - n + 1)))

        ngrams_a = get_ngrams(seq_a)
        ngrams_b = get_ngrams(seq_b)

        if not ngrams_a or not ngrams_b:
            return 0.0

        intersection = len(ngrams_a.intersection(ngrams_b))
        union = len(ngrams_a.union(ngrams_b))
        return float(intersection / union) if union > 0 else 0.0

    def _calculate_semantic_similarity(self, code_a: str, code_b: str) -> float:
        """Character n-gram TF-IDF cosine similarity to capture semantic flow."""
        try:
            vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5))
            tfidf = vectorizer.fit_transform([code_a, code_b])
            sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
            return float(sim)
        except Exception:
            return 0.0

    def _extract_matching_blocks(self, code_a: str, code_b: str) -> List[Dict[str, Any]]:
        """Finds matching contiguous lines between the two submissions."""
        lines_a = [l.strip() for l in code_a.split("\n") if l.strip() and not l.strip().startswith(("#", "//"))]
        lines_b = [l.strip() for l in code_b.split("\n") if l.strip() and not l.strip().startswith(("#", "//"))]

        matches = []
        for i, la in enumerate(lines_a):
            for j, lb in enumerate(lines_b):
                if la == lb and len(la) > 15:
                    matches.append({
                        "line_a": i + 1,
                        "line_b": j + 1,
                        "content": la[:80]
                    })
                    break
            if len(matches) >= 5:
                break
        return matches

similarity_engine = CodeSimilarityEngine()
