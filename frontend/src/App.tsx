import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { AssignmentListingPage } from './pages/AssignmentListingPage';
import { AssignmentDetailPage } from './pages/AssignmentDetailPage';
import { WorkspaceSubmissionPage } from './pages/WorkspaceSubmissionPage';
import { EvaluationResultPage } from './pages/EvaluationResultPage';
import { FacultyAssignmentManagePage } from './pages/FacultyAssignmentManagePage';
import { FacultySimilarityPage } from './pages/FacultySimilarityPage';
import { FacultyAnalyticsPage } from './pages/FacultyAnalyticsPage';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [pageParams, setPageParams] = useState<any>({});

  // When user is authenticated, default landing switches to role dashboard
  React.useEffect(() => {
    if (user && (currentPage === 'landing' || currentPage === 'login' || currentPage === 'register')) {
      setCurrentPage(user.role === 'faculty' ? 'faculty-dashboard' : 'student-dashboard');
    }
  }, [user]);

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center text-surface-400">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <span className="text-sm font-medium">Initializing AI Code Intelligence System...</span>
        </div>
      </div>
    );
  }

  // Render appropriate view based on currentPage
  const renderContent = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'student-dashboard':
        return <StudentDashboard onNavigate={handleNavigate} />;
      case 'faculty-dashboard':
        return <FacultyDashboard onNavigate={handleNavigate} />;
      case 'assignments':
      case 'faculty-assignments':
        return user?.role === 'faculty'
          ? <FacultyAssignmentManagePage onNavigate={handleNavigate} />
          : <AssignmentListingPage onNavigate={handleNavigate} />;
      case 'faculty-create-assignment':
        return <FacultyAssignmentManagePage onNavigate={handleNavigate} />;
      case 'assignment-detail':
        return (
          <AssignmentDetailPage
            assignmentId={pageParams.assignmentId || 1}
            onNavigate={handleNavigate}
          />
        );
      case 'workspace':
        return (
          <WorkspaceSubmissionPage
            assignmentId={pageParams.assignmentId || 1}
            onNavigate={handleNavigate}
          />
        );
      case 'evaluation':
        return (
          <EvaluationResultPage
            submissionId={pageParams.submissionId || 1}
            onNavigate={handleNavigate}
          />
        );
      case 'faculty-submissions':
      case 'submissions':
        return user?.role === 'faculty'
          ? <FacultyDashboard onNavigate={handleNavigate} />
          : <StudentDashboard onNavigate={handleNavigate} />;
      case 'faculty-similarity':
        return <FacultySimilarityPage onNavigate={handleNavigate} />;
      case 'faculty-analytics':
      case 'student-analytics':
        return user?.role === 'faculty'
          ? <FacultyAnalyticsPage onNavigate={handleNavigate} />
          : <StudentDashboard onNavigate={handleNavigate} />;
      default:
        return <StudentDashboard onNavigate={handleNavigate} />;
    }
  };

  const isPublicPage = currentPage === 'landing' || currentPage === 'login' || currentPage === 'register';

  return (
    <div className="min-h-screen bg-surface-950 text-slate-100 flex flex-col font-sans">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      <div className="flex flex-1">
        {!isPublicPage && user && (
          <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
        )}
        <main className="flex-1 overflow-x-hidden min-w-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;

