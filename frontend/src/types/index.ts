export type UserRole = 'student' | 'faculty';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  profile?: {
    student_id?: string;
    employee_id?: string;
    department?: string;
    semester?: number;
    title?: string;
  };
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface TestCase {
  id: number;
  assignment_id: number;
  test_type: 'public' | 'hidden' | 'edge';
  input_data: string;
  expected_output: string;
  weight: number;
  explanation?: string;
  is_hidden: boolean;
}

export interface ScoringWeights {
  correctness: number;
  quality: number;
  complexity: number;
  robustness: number;
  maintainability: number;
  documentation: number;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  instructions?: string;
  allowed_languages: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  deadline?: string;
  max_time_limit_sec: number;
  max_memory_limit_mb: number;
  scoring_weights: ScoringWeights;
  created_by_faculty_id: number;
  created_at: string;
  updated_at: string;
  test_case_count: number;
  submission_count: number;
  test_cases?: TestCase[];
}

export interface TestCaseResult {
  id: number;
  test_case_id: number;
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded' | 'Compilation Error';
  actual_output?: string;
  expected_output?: string;
  input_data?: string;
  execution_time_ms: number;
  error_message?: string;
  passed: boolean;
  is_hidden: boolean;
  test_type: string;
}

export interface StaticIssue {
  name: string;
  category: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  line?: number;
  explanation: string;
  suggestion: string;
}

export interface StaticAnalysisReport {
  score: number;
  summary?: string;
  issues: StaticIssue[];
}

export interface DetectedPattern {
  pattern: string;
  severity: string;
  detail: string;
}

export interface ComplexityReport {
  estimated_time_complexity: string;
  estimated_space_complexity: string;
  cyclomatic_complexity: number;
  maintainability_index: number;
  explanation?: string;
  recommendations?: string;
  detected_patterns: DetectedPattern[];
}

export interface ErrorClassification {
  error_type: string;
  confidence: number;
  predicted_class: string;
  description?: string;
  suggested_fix?: string;
  is_ml_predicted: boolean;
}

export interface FeedbackReport {
  overall_assessment: string;
  functional_analysis: string;
  quality_feedback: string;
  complexity_feedback: string;
  error_explanation: string;
  improvement_suggestions: string;
  learning_recommendations: string[];
  generated_at: string;
}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  student_name?: string;
  assignment_title?: string;
  language: string;
  source_code: string;
  status: string;
  submitted_at: string;
  execution_time_ms: number;
  memory_used_kb: number;
  functional_score: number;
  quality_score: number;
  complexity_score: number;
  robustness_score: number;
  maintainability_score: number;
  documentation_score: number;
  final_score: number;
  error_summary?: string;
}

export interface EvaluationReport {
  submission: Submission;
  test_results: TestCaseResult[];
  static_analysis?: StaticAnalysisReport;
  complexity_report?: ComplexityReport;
  error_classification?: ErrorClassification;
  feedback?: FeedbackReport;
}

export interface SimilaritySnippet {
  line_a: number;
  line_b: number;
  content: string;
}

export interface SimilarityReport {
  id: number;
  assignment_id: number;
  assignment_title?: string;
  submission_id_a: number;
  submission_id_b: number;
  student_a_name: string;
  student_b_name: string;
  token_similarity: number;
  structural_similarity: number;
  semantic_similarity: number;
  overall_similarity: number;
  is_flagged: boolean;
  faculty_reviewed: boolean;
  faculty_notes?: string;
  matched_snippets: SimilaritySnippet[];
  created_at: string;
}

export interface StudentAnalytics {
  total_assignments: number;
  submitted_assignments: number;
  average_score: number;
  best_score: number;
  pending_assignments: number;
  score_progression: Array<{
    submission_id: number;
    assignment: string;
    score: number;
    correctness: number;
    quality: number;
    date: string;
  }>;
  strongest_skill: string;
  frequent_mistake: string;
  areas_for_improvement: string[];
  recommended_topics: string[];
}

export interface FacultyAnalytics {
  total_students: number;
  total_assignments: number;
  total_submissions: number;
  average_class_score: number;
  pending_evaluations: number;
  score_distribution: Array<{ bracket: string; count: number }>;
  assignment_performance: Array<{
    id: number;
    title: string;
    submission_count: number;
    average_score: number;
    difficulty: string;
  }>;
  common_errors: Array<{ error: string; count: number }>;
  complexity_distribution: Array<{ complexity: string; count: number }>;
  language_distribution: Array<{ language: string; count: number }>;
}
