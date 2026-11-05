"""
Training script for the Programming Error Classification Engine.
Trains a Scikit-Learn model to classify code snippets and runtime/static errors
into specific defect categories according to Section 10 specifications.
"""

import json
import os
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score, f1_score
import joblib

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "datasets", "programming_errors.json")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "saved_models")
EVAL_DIR = os.path.join(os.path.dirname(__file__), "..", "evaluation")

# High-quality labeled dataset representing diverse programming error categories
DATASET = [
    # 1. syntax_error
    {"code": "def calculate_sum(a, b\n    return a + b", "error_msg": "SyntaxError: invalid syntax", "label": "syntax_error"},
    {"code": "for i in range(10)\n    print(i)", "error_msg": "SyntaxError: expected ':'", "label": "syntax_error"},
    {"code": "if x == 5\n    y = 10", "error_msg": "SyntaxError: expected ':'", "label": "syntax_error"},
    {"code": "print('Hello world", "error_msg": "SyntaxError: unterminated string literal", "label": "syntax_error"},
    {"code": "class MyClass\n    def __init__(self): pass", "error_msg": "SyntaxError: invalid syntax", "label": "syntax_error"},
    {"code": "return x + y outside of function", "error_msg": "SyntaxError: 'return' outside function", "label": "syntax_error"},
    {"code": "def foo():\n  break", "error_msg": "SyntaxError: 'break' outside loop", "label": "syntax_error"},

    # 2. index_out_of_range
    {"code": "nums = [1, 2, 3]\nprint(nums[3])", "error_msg": "IndexError: list index out of range", "label": "index_out_of_range"},
    {"code": "for i in range(len(arr) + 1):\n    val = arr[i]", "error_msg": "IndexError: list index out of range", "label": "index_out_of_range"},
    {"code": "first = items[0] # empty list items = []", "error_msg": "IndexError: pop from empty list index out of range", "label": "index_out_of_range"},
    {"code": "matrix = [[1, 2], [3, 4]]\nprint(matrix[2][0])", "error_msg": "IndexError: list index out of range", "label": "index_out_of_range"},
    {"code": "while idx <= len(s):\n    c = s[idx]\n    idx += 1", "error_msg": "IndexError: string index out of range", "label": "index_out_of_range"},
    {"code": "arr = [10, 20]\narr[5] = 99", "error_msg": "IndexError: list assignment index out of range", "label": "index_out_of_range"},

    # 3. null_reference (NoneType error)
    {"code": "user = None\nprint(user.name)", "error_msg": "AttributeError: 'NoneType' object has no attribute 'name'", "label": "null_reference"},
    {"code": "node = head\nwhile node:\n    node = node.next\nprint(node.val)", "error_msg": "AttributeError: 'NoneType' object has no attribute 'val'", "label": "null_reference"},
    {"code": "result = find_user(query)\nresult.update()", "error_msg": "AttributeError: 'NoneType' object has no attribute 'update'", "label": "null_reference"},
    {"code": "root = None\nroot.left = TreeNode(5)", "error_msg": "AttributeError: 'NoneType' object has no attribute 'left'", "label": "null_reference"},
    {"code": "ptr = get_pointer()\nreturn ptr.get_value()", "error_msg": "AttributeError: 'NoneType' object has no attribute 'get_value' / NullPointerException", "label": "null_reference"},
    {"code": "data = response.json().get('user')\nprint(data['id'])", "error_msg": "TypeError: 'NoneType' object is not subscriptable", "label": "null_reference"},

    # 4. type_error
    {"code": "age = '25'\nnext_age = age + 1", "error_msg": "TypeError: can only concatenate str (not 'int') to str", "label": "type_error"},
    {"code": "result = 'total: ' + 500", "error_msg": "TypeError: must be str, not int", "label": "type_error"},
    {"code": "num = int('invalid_string')", "error_msg": "ValueError: invalid literal for int() with base 10", "label": "type_error"},
    {"code": "coords = (1, 2)\ncoords[0] = 5", "error_msg": "TypeError: 'tuple' object does not support item assignment", "label": "type_error"},
    {"code": "def add(x, y): return x + y\nadd(5)", "error_msg": "TypeError: add() missing 1 required positional argument: 'y'", "label": "type_error"},
    {"code": "for x in 12345:\n    print(x)", "error_msg": "TypeError: 'int' object is not iterable", "label": "type_error"},

    # 5. uninitialized_variable
    {"code": "def compute():\n    total = count + 10\n    return total", "error_msg": "NameError: name 'count' is not defined", "label": "uninitialized_variable"},
    {"code": "print(unknown_var)", "error_msg": "NameError: name 'unknown_var' is not defined", "label": "uninitialized_variable"},
    {"code": "if condition:\n    res = 10\nprint(res) # condition was False", "error_msg": "UnboundLocalError: local variable 'res' referenced before assignment", "label": "uninitialized_variable"},
    {"code": "def counter():\n    c += 1\n    return c", "error_msg": "UnboundLocalError: local variable 'c' referenced before assignment", "label": "uninitialized_variable"},
    {"code": "for i in range(n):\n    acc = acc + i", "error_msg": "NameError: name 'acc' is not defined", "label": "uninitialized_variable"},

    # 6. zero_division
    {"code": "ratio = total / count # when count is 0", "error_msg": "ZeroDivisionError: division by zero", "label": "zero_division"},
    {"code": "avg = sum(scores) / len(scores)", "error_msg": "ZeroDivisionError: division by zero", "label": "zero_division"},
    {"code": "slope = (y2 - y1) / (x2 - x1)", "error_msg": "ZeroDivisionError: float division by zero", "label": "zero_division"},
    {"code": "rem = 100 % 0", "error_msg": "ZeroDivisionError: integer modulo by zero", "label": "zero_division"},
    {"code": "rate = 1.0 / (step - current_step)", "error_msg": "ZeroDivisionError: float division by zero", "label": "zero_division"},

    # 7. recursion_error
    {"code": "def fib(n):\n    return fib(n-1) + fib(n-2)", "error_msg": "RecursionError: maximum recursion depth exceeded in comparison", "label": "recursion_error"},
    {"code": "def fact(n):\n    return n * fact(n)", "error_msg": "RecursionError: maximum recursion depth exceeded", "label": "recursion_error"},
    {"code": "def dfs(node):\n    dfs(node)", "error_msg": "RecursionError: maximum recursion depth exceeded while calling a Python object", "label": "recursion_error"},
    {"code": "def countdown(n):\n    return countdown(n-1)", "error_msg": "RecursionError: maximum recursion depth exceeded", "label": "recursion_error"},
    {"code": "def traverse(curr):\n    traverse(curr.next)", "error_msg": "RecursionError: maximum recursion depth exceeded", "label": "recursion_error"},

    # 8. infinite_loop
    {"code": "i = 0\nwhile i < 10:\n    print(i)\n    # forgot i += 1", "error_msg": "TimeLimitExceeded: infinite loop detected loop counter not incremented", "label": "infinite_loop"},
    {"code": "while True:\n    pass", "error_msg": "TimeLimitExceeded: infinite loop process killed timeout", "label": "infinite_loop"},
    {"code": "while target > 0:\n    target = target", "error_msg": "TimeLimitExceeded: execution timed out in while loop", "label": "infinite_loop"},
    {"code": "while low < high:\n    mid = (low + high) // 2\n    # low not advancing when low == mid", "error_msg": "TimeLimitExceeded: while condition never terminates", "label": "infinite_loop"},
    {"code": "for i in list_iter:\n    list_iter.append(i)", "error_msg": "TimeLimitExceeded: loop never terminates mutating list during iteration", "label": "infinite_loop"},

    # 9. boundary_condition_error
    {"code": "def is_valid_index(i, n):\n    return i > 0 and i < n # off-by-one missing i >= 0", "error_msg": "LogicalError: fails boundary test with index 0 or n-1", "label": "boundary_condition_error"},
    {"code": "if score > 90:\n    return 'A' # fails for exact boundary score == 90", "error_msg": "AssertionError: boundary value edge case failed for input exactly at limit", "label": "boundary_condition_error"},
    {"code": "def binary_search(arr, target):\n    low, high = 0, len(arr) - 2 # wrong upper bound", "error_msg": "WrongAnswer: failed for single element array or last element", "label": "boundary_condition_error"},
    {"code": "for i in range(1, len(arr)):\n    process(arr[i]) # missed first element index 0", "error_msg": "WrongAnswer: boundary test empty array or single element mismatch", "label": "boundary_condition_error"},
    {"code": "if len(s) == 0:\n    return None # expected empty string or 0 count", "error_msg": "WrongAnswer: boundary condition empty input edge case handled incorrectly", "label": "boundary_condition_error"},

    # 10. loop_condition_error
    {"code": "for i in range(len(arr)):\n    if arr[i] == target: break\nreturn i # wrong index if not found", "error_msg": "LogicalError: loop condition terminated prematurely or inverted exit check", "label": "loop_condition_error"},
    {"code": "while i > 0: # was supposed to be i < len(arr)\n    print(arr[i])", "error_msg": "LogicalError: loop never executed inverted loop condition", "label": "loop_condition_error"},
    {"code": "while i <= len(arr):\n    do_work(arr[i])", "error_msg": "IndexError / LogicalError: loop condition uses <= instead of <", "label": "loop_condition_error"},
    {"code": "for i in range(n, 0):\n    # range step missing negative 1", "error_msg": "LogicalError: loop condition generates empty range sequence", "label": "loop_condition_error"},

    # 11. inefficient_algorithm
    {"code": "def two_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]", "error_msg": "TimeLimitExceeded: O(N^2) brute force nested loops too slow for large inputs", "label": "inefficient_algorithm"},
    {"code": "def contains_duplicate(nums):\n    for i in range(len(nums)):\n        if nums.count(nums[i]) > 1:\n            return True", "error_msg": "TimeLimitExceeded: O(N^2) repeated scanning list.count inside loop", "label": "inefficient_algorithm"},
    {"code": "def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2) # exponential O(2^N) without memoization", "error_msg": "TimeLimitExceeded: exponential recursion O(2^N) algorithmic complexity", "label": "inefficient_algorithm"},
    {"code": "res = []\nfor item in large_list:\n    if item not in res:\n        res.append(item) # O(N^2) linear search in list", "error_msg": "TimeLimitExceeded: inefficient quadratic algorithm consider set lookup", "label": "inefficient_algorithm"},
    {"code": "for i in range(len(arr)):\n    arr = sorted(arr) # re-sorting inside loop O(N^2 log N)", "error_msg": "PerformanceWarning: repetitive sorting inside loop inefficient algorithmic pattern", "label": "inefficient_algorithm"},

    # 12. logical_error
    {"code": "def max_two(a, b):\n    if a < b:\n        return a\n    return b # inverted logic returns minimum", "error_msg": "WrongAnswer: expected maximum but received minimum inverted comparison", "label": "logical_error"},
    {"code": "def is_even(n):\n    return n % 2 == 1 # inverted condition for even check", "error_msg": "WrongAnswer: parity logic reversed for test inputs", "label": "logical_error"},
    {"code": "total = 0\nfor x in nums:\n    total = x # overwrote total instead of total += x", "error_msg": "WrongAnswer: accumulation variable reassigned rather than added", "label": "logical_error"},
    {"code": "def palindrome(s):\n    return s == s.lower() # checked case instead of reverse", "error_msg": "WrongAnswer: incorrect logic comparison string reverse missing", "label": "logical_error"},
    {"code": "def discount(price):\n    return price * 0.20 # returned discount amount instead of discounted price", "error_msg": "WrongAnswer: logic calculated discount deduction not final payable amount", "label": "logical_error"},

    # 13. runtime_error
    {"code": "import non_existent_custom_library_xyz\nnon_existent_custom_library_xyz.run()", "error_msg": "ModuleNotFoundError: No module named 'non_existent_custom_library_xyz'", "label": "runtime_error"},
    {"code": "d = {'a': 1}\nprint(d['missing_key'])", "error_msg": "KeyError: 'missing_key'", "label": "runtime_error"},
    {"code": "with open('/non/existent/path/file.txt') as f:\n    c = f.read()", "error_msg": "FileNotFoundError: [Errno 2] No such file or directory", "label": "runtime_error"},
    {"code": "assert 2 + 2 == 5, 'Math failed'", "error_msg": "AssertionError: Math failed", "label": "runtime_error"},
    {"code": "memory_hog = [0] * (10 ** 10)", "error_msg": "MemoryError: unable to allocate array memory", "label": "runtime_error"}
]

def main():
    os.makedirs(os.path.dirname(DATASET_PATH), exist_ok=True)
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(EVAL_DIR, exist_ok=True)

    # Save dataset to JSON
    with open(DATASET_PATH, "w", encoding="utf-8") as f:
        json.dump(DATASET, f, indent=2)
    print(f"Dataset saved to {DATASET_PATH} with {len(DATASET)} samples.")

    # Data augmentation for robust training
    records = []
    for item in DATASET:
        # Combined text representation
        text = f"{item['code']} \n [ERROR] {item['error_msg']}"
        records.append({"text": text, "label": item["label"]})
        # Variation with error msg emphasized
        records.append({"text": f"{item['error_msg']} {item['code']}", "label": item["label"]})
        # Variation with code only
        records.append({"text": item["code"], "label": item["label"]})

    df = pd.DataFrame(records)
    print(f"Total training instances after preprocessing: {len(df)}")
    print(f"Classes ({len(df['label'].unique())}): {list(df['label'].unique())}")

    X_train, X_test, y_train, y_test = train_test_split(
        df["text"], df["label"], test_size=0.2, random_state=42, stratify=df["label"]
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            token_pattern=r"(?u)\b\w+\b|[^\w\s]",
            max_features=2500,
            sublinear_tf=True
        )),
        ("classifier", LogisticRegression(
            C=5.0,
            max_iter=1000,
            class_weight="balanced",
            random_state=42
        ))
    ])

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")
    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

    print(f"Training completed successfully!")
    print(f"Accuracy: {acc:.4f}, Weighted F1: {f1:.4f}")

    # Save model and artifacts
    model_file = os.path.join(MODEL_DIR, "error_classifier.joblib")
    joblib.dump(pipeline, model_file)
    print(f"Model saved to {model_file}")

    metrics = {
        "accuracy": float(acc),
        "f1_score_weighted": float(f1),
        "total_samples": len(df),
        "num_classes": len(df["label"].unique()),
        "classes": sorted(list(df["label"].unique())),
        "classification_report": report
    }

    metrics_file = os.path.join(EVAL_DIR, "metrics.json")
    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"Metrics saved to {metrics_file}")

if __name__ == "__main__":
    main()

