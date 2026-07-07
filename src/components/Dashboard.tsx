import React, { useState } from 'react';
import { Plus, Moon, Sun, BarChart3, Users, Target, Clock, Settings, LogOut, User, FileText, ClipboardList, Calendar, AlertCircle } from 'lucide-react';
import ProjectCard from './ProjectCard';
import AddProjectModal from './AddProjectModal';
import SearchAndFilter from './SearchAndFilter';
import BulkActions from './BulkActions';
import NotificationCenter from './NotificationCenter';
import MetricCard from './ui/MetricCard';
import FloatingActionButton from './ui/FloatingActionButton';
import LoadingSkeleton from './ui/LoadingSkeleton';
import { calculateMetrics, formatTrendTooltip } from '../utils/metricsCalculator';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import RoleBadge from './ui/RoleBadge';
import { Project } from '../types';

interface DashboardProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onProjectAdd: (project: Omit<Project, 'id'>) => void;
  onProjectDelete: (projectId: string) => void;
  onViewChange: (view: 'dashboard' | 'projects' | 'users' | 'audits' | 'reports') => void;
  currentView: 'dashboard' | 'projects' | 'users' | 'audits' | 'reports';
  loading?: boolean;
}

export default function Dashboard({ projects, onProjectSelect, onProjectAdd, onProjectDelete, onViewChange, currentView, loading = false }: DashboardProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout, hasPermission } = useAuth();
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'paused' | 'ended'>('all');

  // Update filtered projects when projects change
  React.useEffect(() => {
    setFilteredProjects(projects);
  }, [projects]);

  // Auto-enable selection mode when projects are selected
  React.useEffect(() => {
    setIsSelectionMode(selectedProjects.length > 0);
  }, [selectedProjects]);

  // Calculate real metrics
  const metrics = calculateMetrics(projects);

  // Show database setup message if no projects and likely due to missing tables
  const showDatabaseSetup = projects.length === 0 && !loading;

  const displayedProjects = filteredProjects.filter(project => {
    const matchesView = viewMode === 'all' || 
      (viewMode === 'active' && project.status === 'Active') ||
      (viewMode === 'paused' && project.status === 'On Pause') ||
      (viewMode === 'ended' && project.status === 'Ended');
    return matchesView;
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'Active').length,
    onPause: projects.filter(p => p.status === 'On Pause').length,
    ended: projects.filter(p => p.status === 'Ended').length
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    if (confirm(`Are you sure you want to delete the project "${projectName}"? This action cannot be undone.`)) {
      onProjectDelete(projectId);
      setSelectedProjects(prev => prev.filter(id => id !== projectId));
    }
  };

  const handleBulkUpdate = (projectIds: string[], updates: Partial<Project>) => {
    projectIds.forEach(id => {
      const project = projects.find(p => p.id === id);
      if (project) {
        const updatedProject = { ...project, ...updates };
        if (updates.teamMembers) {
          updatedProject.teamMembers = [...new Set([...project.teamMembers, ...updates.teamMembers])];
        }
        // Note: In a real app, you'd call an update function here
        // For now, we'll just clear the selection
      }
    });
    setSelectedProjects([]);
  };

  const handleBulkDelete = (projectIds: string[]) => {
    projectIds.forEach(id => onProjectDelete(id));
    setSelectedProjects([]);
  };

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors bg-pattern-dots ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-headline text-gradient mb-2`}>
              VIZ Manager
            </h1>
            <p className={`text-body ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Manage all your client projects and audits in one place
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Audit Management Button */}
            <button
              onClick={() => onViewChange('audits')}
              className={`p-2 rounded-lg transition-colors ${
                currentView === 'audits'
                  ? 'bg-purple-600 text-white'
                  : isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Audit Management"
            >
              <BarChart3 className="h-5 w-5" />
            </button>

            {/* Reports Management Button */}
            <button
              onClick={() => onViewChange('reports')}
              className={`p-2 rounded-lg transition-colors ${
                currentView === 'reports'
                  ? 'bg-green-600 text-white'
                  : isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Reports Management"
            >
              <Calendar className="h-5 w-5" />
            </button>

            {/* User Info */}
            <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-200`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {user?.name.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2">
                    <RoleBadge role={user?.role || 'viewer'} size="sm" showIcon={false} />
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {user?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            {hasPermission('all', 'create') && (
              <button
                onClick={() => onViewChange('users')}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === 'users'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="User Management"
              >
                <Settings className="h-5 w-5" />
              </button>
            )}

            <NotificationCenter />
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <button
              onClick={logout}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-red-400 hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
              }`}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary hover-lift"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Project</span>
            </button>
          </div>
        </div>
      </div>

      {showDatabaseSetup && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Database Setup Required
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                  It looks like your Supabase database tables haven't been created yet. To get started:
                </p>
                <ol className="list-decimal list-inside text-yellow-700 dark:text-yellow-300 space-y-2 mb-4">
                  <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Supabase Dashboard</a></li>
                  <li>Navigate to the SQL Editor</li>
                  <li>Run the migration files from the <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">supabase/migrations</code> folder</li>
                  <li>Refresh this page</li>
                </ol>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  The migration files will create all necessary tables and sample data for your VIZ Manager project.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Segmentation */}
      <div className="mb-6 animate-slide-up">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base hover-lift ${
              viewMode === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : isDarkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Projects ({projects.length})
          </button>
          <button
            onClick={() => setViewMode('active')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base hover-lift ${
              viewMode === 'active'
                ? 'bg-emerald-600 text-white shadow-md'
                : isDarkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => setViewMode('paused')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base hover-lift ${
              viewMode === 'paused'
                ? 'bg-amber-600 text-white shadow-md'
                : isDarkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            On Pause ({stats.onPause})
          </button>
          <button
            onClick={() => setViewMode('ended')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base hover-lift ${
              viewMode === 'ended'
                ? 'bg-gray-600 text-white'
                : isDarkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ended ({stats.ended})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up">
        <MetricCard
          title="Total Projects"
          value={metrics.totalProjects}
          icon={BarChart3}
          color="blue"
          trend={metrics.totalProjectsTrend}
          tooltip={formatTrendTooltip('Total Projects', metrics.totalProjects, metrics.totalProjectsTrend)}
          loading={loading}
        />
        <MetricCard
          title="Active Projects"
          value={metrics.activeProjects}
          icon={Target}
          color="emerald"
          trend={metrics.activeProjectsTrend}
          tooltip={formatTrendTooltip('Active Projects', metrics.activeProjects, metrics.activeProjectsTrend)}
          loading={loading}
        />
        <MetricCard
          title="On Pause"
          value={stats.onPause}
          icon={Clock}
          color="amber"
          tooltip={`Projects on pause: ${stats.onPause}`}
          loading={loading}
        />
        <MetricCard
          title="Team Members"
          value={[...new Set(projects.flatMap(p => p.teamMembers))].length}
          icon={Users}
          color="purple"
          tooltip={`Unique team members across all projects: ${[...new Set(projects.flatMap(p => p.teamMembers))].length}`}
          loading={loading}
        />
      </div>

      {/* Search and Filter */}
      <div className="mb-6 animate-slide-up">
        <SearchAndFilter 
          projects={projects} 
          onFilteredResults={setFilteredProjects}
        />
      </div>

      {/* Bulk Actions */}
      <div className="mb-6 animate-slide-up">
        <BulkActions
          projects={displayedProjects}
          selectedProjects={selectedProjects}
          onSelectionChange={setSelectedProjects}
          onBulkUpdate={handleBulkUpdate}
          onBulkDelete={handleBulkDelete}
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-fade-in">
        {loading ? (
          <LoadingSkeleton type="card" count={6} />
        ) : (
        displayedProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            isSelected={isSelectionMode && selectedProjects.includes(project.id)}
            onSelect={isSelectionMode ? (selected) => {
              if (selected) {
                setSelectedProjects(prev => [...prev, project.id]);
              } else {
                setSelectedProjects(prev => prev.filter(id => id !== project.id));
              }
            } : undefined}
            onClick={() => !isSelectionMode && onProjectSelect(project)}
            onDelete={handleDeleteProject}
          />
        ))
        )}
      </div>

      {displayedProjects.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No projects found matching your criteria
          </p>
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => setShowAddModal(true)}
        tooltip="Add New Project"
      />

      {/* Add Project Modal */}
      {showAddModal && (
        <AddProjectModal
          onClose={() => setShowAddModal(false)}
          onAdd={onProjectAdd}
        />
      )}
    </div>
  );
}