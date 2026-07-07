import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import UserManagementDashboard from './components/admin/UserManagementDashboard';
import AuditManagementDashboard from './components/audit/AuditManagementDashboard';
import ReportsManagementDashboard from './components/reports/ReportsManagementDashboard';
import { Project } from './types';
import { ProjectService } from './services/projectService';

function AppContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'projects' | 'users' | 'audits' | 'reports'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Load projects from Supabase only when authenticated
  React.useEffect(() => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    const loadProjects = async () => {
      try {
        const projectsData = await ProjectService.getAllProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error('Error loading projects:', error);
        // Handle case where tables don't exist yet
        if (error instanceof Error && error.message.includes('Could not find the table')) {
          console.warn('Database tables not found. Please run migrations in Supabase.');
          setProjects([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [isAuthenticated, authLoading]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToDashboard = () => {
    setSelectedProject(null);
  };

  const handleProjectUpdate = async (updatedProject: Project) => {
    try {
      const updated = await ProjectService.updateProject(updatedProject.id, updatedProject);
      setProjects(projects.map(p => p.id === updated.id ? updated : p));
      setSelectedProject(updated);
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  const handleProjectAdd = async (newProject: Omit<Project, 'id'>) => {
    try {
      const project = await ProjectService.createProject(newProject);
      setProjects([project, ...projects]);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleProjectDelete = async (projectId: string) => {
    try {
      await ProjectService.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const handleViewChange = (view: 'dashboard' | 'projects' | 'users') => {
    setCurrentView(view);
    setSelectedProject(null); // Clear selected project when changing views
  };

  const handleViewChangeExtended = (view: 'dashboard' | 'projects' | 'users' | 'audits' | 'reports') => {
    setCurrentView(view);
    setSelectedProject(null); // Clear selected project when changing views
  };

  // Handle hash-based navigation for cross-page links
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'audits') {
        setCurrentView('audits');
      } else if (hash === 'reports') {
        setCurrentView('reports');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check initial hash

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderCurrentView = () => {
    if (selectedProject) {
      return (
        <ProjectDetail 
          project={selectedProject} 
          onBack={() => setSelectedProject(null)}
          onUpdate={handleProjectUpdate}
        />
      );
    }

    switch (currentView) {
      case 'users':
        return (
          <ProtectedRoute requiredRole={['admin']}>
            <UserManagementDashboard onBack={() => setCurrentView('projects')} />
          </ProtectedRoute>
        );
      case 'audits':
        return (
          <AuditManagementDashboard onBack={() => setCurrentView('projects')} />
        );
      case 'reports':
        return (
          <ReportsManagementDashboard onBack={() => setCurrentView('projects')} />
        );
      case 'projects':
      default:
        return (
          <Dashboard 
            projects={projects} 
            onProjectSelect={handleProjectSelect}
            onProjectAdd={handleProjectAdd}
            onProjectDelete={handleProjectDelete}
            onViewChange={handleViewChangeExtended}
            currentView={currentView}
          />
        );
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {renderCurrentView()}
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;