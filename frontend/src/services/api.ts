import axios from 'axios';
import {
  AuthResponse, User, Assignment, Submission, EvaluationReport,
  SimilarityReport, StudentAnalytics, FacultyAnalytics
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Endpoints
export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (payload: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    student_id_number?: string;
    employee_id?: string;
    department?: string;
  }): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', payload);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Assignment Endpoints
export const assignmentService = {
  list: async (): Promise<Assignment[]> => {
    const res = await api.get('/assignments');
    return res.data;
  },
  get: async (id: number): Promise<Assignment> => {
    const res = await api.get(`/assignments/${id}`);
    return res.data;
  },
  create: async (data: any): Promise<Assignment> => {
    const res = await api.post('/assignments', data);
    return res.data;
  },
  update: async (id: number, data: any): Promise<Assignment> => {
    const res = await api.put(`/assignments/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/assignments/${id}`);
  },
};

// Submission Endpoints
export const submissionService = {
  submit: async (data: { assignment_id: number; language: string; source_code: string }): Promise<Submission> => {
    const res = await api.post('/submissions', data);
    return res.data;
  },
  list: async (assignmentId?: number): Promise<Submission[]> => {
    const params = assignmentId ? { assignment_id: assignmentId } : {};
    const res = await api.get('/submissions', { params });
    return res.data;
  },
  get: async (id: number): Promise<Submission> => {
    const res = await api.get(`/submissions/${id}`);
    return res.data;
  },
};

// Evaluation Endpoints
export const evaluationService = {
  getReport: async (submissionId: number): Promise<EvaluationReport> => {
    const res = await api.get(`/evaluation/${submissionId}/report`);
    return res.data;
  },
  rerun: async (submissionId: number): Promise<EvaluationReport> => {
    const res = await api.post(`/evaluation/${submissionId}/run`);
    return res.data;
  },
};

// Similarity Endpoints
export const similarityService = {
  listReports: async (assignmentId?: number, flaggedOnly = false): Promise<SimilarityReport[]> => {
    const params: any = {};
    if (assignmentId) params.assignment_id = assignmentId;
    if (flaggedOnly) params.flagged_only = true;
    const res = await api.get('/similarity/reports', { params });
    return res.data;
  },
  review: async (id: number, data: { faculty_reviewed: boolean; faculty_notes?: string; is_flagged?: boolean }) => {
    const res = await api.post(`/similarity/${id}/review`, data);
    return res.data;
  },
};

// Analytics Endpoints
export const analyticsService = {
  getStudentAnalytics: async (): Promise<StudentAnalytics> => {
    const res = await api.get('/student/analytics');
    return res.data;
  },
  getFacultyAnalytics: async (): Promise<FacultyAnalytics> => {
    const res = await api.get('/faculty/analytics');
    return res.data;
  },
};

export default api;

