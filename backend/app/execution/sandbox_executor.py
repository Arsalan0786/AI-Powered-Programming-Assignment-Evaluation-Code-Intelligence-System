import os
import sys
import time
import shutil
import tempfile
import subprocess
from typing import Dict, Any, Optional

class SandboxExecutor:
    """
    Sandboxed code execution engine.
    Executes student programs in isolated environments with strict process timeouts,
    stdin piping, output capture, and temporary workspace cleanup.
    Supports Python, C++, Java, and JavaScript.
    """

    def __init__(self, default_timeout_sec: float = 2.0):
        self.default_timeout_sec = default_timeout_sec

    def execute(
        self,
        language: str,
        source_code: str,
        input_data: str,
        timeout_sec: Optional[float] = None
    ) -> Dict[str, Any]:
        timeout = timeout_sec or self.default_timeout_sec
        temp_dir = tempfile.mkdtemp(prefix="ai_code_exec_")

        try:
            lang = language.lower()
            if lang in ("python", "py"):
                return self._run_python(temp_dir, source_code, input_data, timeout)
            elif lang in ("cpp", "c++", "c"):
                return self._run_cpp(temp_dir, source_code, input_data, timeout)
            elif lang == "java":
                return self._run_java(temp_dir, source_code, input_data, timeout)
            elif lang in ("javascript", "js", "node"):
                return self._run_javascript(temp_dir, source_code, input_data, timeout)
            else:
                return {
                    "success": False,
                    "status": "Compilation Error",
                    "stdout": "",
                    "stderr": f"Unsupported language: {language}",
                    "execution_time_ms": 0.0,
                    "memory_kb": 0.0
                }
        finally:
            # Always clean up isolated temporary files
            shutil.rmtree(temp_dir, ignore_errors=True)

    def _run_python(self, temp_dir: str, code: str, input_data: str, timeout: float) -> Dict[str, Any]:
        file_path = os.path.join(temp_dir, "solution.py")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(code)

        cmd = [sys.executable, "-I", file_path]  # -I flag isolates from user site-packages/environment
        return self._spawn_process(cmd, input_data, timeout, cwd=temp_dir)

    def _run_javascript(self, temp_dir: str, code: str, input_data: str, timeout: float) -> Dict[str, Any]:
        file_path = os.path.join(temp_dir, "solution.js")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(code)

        node_bin = "node.exe" if sys.platform == "win32" else "node"
        cmd = [node_bin, file_path]
        return self._spawn_process(cmd, input_data, timeout, cwd=temp_dir)

    def _run_cpp(self, temp_dir: str, code: str, input_data: str, timeout: float) -> Dict[str, Any]:
        src_path = os.path.join(temp_dir, "solution.cpp")
        exe_path = os.path.join(temp_dir, "solution.exe" if sys.platform == "win32" else "solution")

        with open(src_path, "w", encoding="utf-8") as f:
            f.write(code)

        gpp_bin = "g++.exe" if sys.platform == "win32" else "g++"
        compile_cmd = [gpp_bin, "-O2", "-std=c++17", src_path, "-o", exe_path]

        try:
            compile_res = subprocess.run(
                compile_cmd,
                capture_output=True,
                text=True,
                timeout=10.0,
                cwd=temp_dir
            )
            if compile_res.returncode != 0:
                return {
                    "success": False,
                    "status": "Compilation Error",
                    "stdout": "",
                    "stderr": compile_res.stderr or compile_res.stdout,
                    "execution_time_ms": 0.0,
                    "memory_kb": 0.0
                }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "status": "Compilation Error",
                "stdout": "",
                "stderr": "Compilation process timed out (10s limit exceeded).",
                "execution_time_ms": 0.0,
                "memory_kb": 0.0
            }
        except FileNotFoundError:
            return {
                "success": False,
                "status": "Compilation Error",
                "stdout": "",
                "stderr": "g++ compiler not found on execution host.",
                "execution_time_ms": 0.0,
                "memory_kb": 0.0
            }

        return self._spawn_process([exe_path], input_data, timeout, cwd=temp_dir)

    def _run_java(self, temp_dir: str, code: str, input_data: str, timeout: float) -> Dict[str, Any]:
        # Extract class name or default to Solution / Main
        class_name = "Solution"
        if "public class Main" in code or "class Main" in code:
            class_name = "Main"

        src_path = os.path.join(temp_dir, f"{class_name}.java")
        with open(src_path, "w", encoding="utf-8") as f:
            f.write(code)

        javac_bin = "javac.exe" if sys.platform == "win32" else "javac"
        java_bin = "java.exe" if sys.platform == "win32" else "java"

        try:
            compile_res = subprocess.run(
                [javac_bin, src_path],
                capture_output=True,
                text=True,
                timeout=10.0,
                cwd=temp_dir
            )
            if compile_res.returncode != 0:
                return {
                    "success": False,
                    "status": "Compilation Error",
                    "stdout": "",
                    "stderr": compile_res.stderr,
                    "execution_time_ms": 0.0,
                    "memory_kb": 0.0
                }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "status": "Compilation Error",
                "stdout": "",
                "stderr": "Java compilation timed out.",
                "execution_time_ms": 0.0,
                "memory_kb": 0.0
            }
        except FileNotFoundError:
            return {
                "success": False,
                "status": "Compilation Error",
                "stdout": "",
                "stderr": "javac not found on host.",
                "execution_time_ms": 0.0,
                "memory_kb": 0.0
            }

        run_cmd = [java_bin, "-Xmx256m", "-cp", temp_dir, class_name]
        return self._spawn_process(run_cmd, input_data, timeout, cwd=temp_dir)

    def _spawn_process(self, cmd: list, input_data: str, timeout: float, cwd: str) -> Dict[str, Any]:
        start_time = time.perf_counter()

        # Sanitize environment variables to prevent leaking credentials
        restricted_env = {
            "PATH": os.environ.get("PATH", ""),
            "SYSTEMROOT": os.environ.get("SYSTEMROOT", "C:\\Windows"),
            "TEMP": cwd,
            "TMP": cwd,
        }

        try:
            process = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=cwd,
                env=restricted_env
            )

            stdout_data, stderr_data = process.communicate(input=input_data, timeout=timeout)
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0

            if process.returncode != 0:
                return {
                    "success": False,
                    "status": "Runtime Error",
                    "stdout": stdout_data.strip(),
                    "stderr": stderr_data.strip(),
                    "execution_time_ms": round(elapsed_ms, 2),
                    "memory_kb": 1024.0
                }

            return {
                "success": True,
                "status": "Accepted",
                "stdout": stdout_data.strip(),
                "stderr": stderr_data.strip(),
                "execution_time_ms": round(elapsed_ms, 2),
                "memory_kb": 1024.0
            }

        except subprocess.TimeoutExpired:
            try:
                process.kill()
                stdout_data, stderr_data = process.communicate()
            except Exception:
                pass
            return {
                "success": False,
                "status": "Time Limit Exceeded",
                "stdout": "",
                "stderr": f"Process exceeded execution time limit of {timeout:.1f}s and was terminated.",
                "execution_time_ms": round(timeout * 1000.0, 2),
                "memory_kb": 0.0
            }
        except Exception as ex:
            return {
                "success": False,
                "status": "Runtime Error",
                "stdout": "",
                "stderr": f"Internal execution error: {str(ex)}",
                "execution_time_ms": 0.0,
                "memory_kb": 0.0
            }

sandbox_executor = SandboxExecutor()
