import React, { useState } from 'react';
import { Plus, FolderKanban, AlertCircle } from 'lucide-react';
import ProjectCard from './ProjectCard';
import AddProjectModal from './AddProjectModal';
import SearchAndFilter from './SearchAndFilter';
import BulkActions from './BulkActions';
import MetricCard from './ui/MetricCard';
import LoadingSkeleton from './ui/LoadingSkeleton';
import { calculateMetrics } from '../utils/metricsCalculator';
import { useTheme } from '../contexts/ThemeContext';
import { Project } from '../types';

interface DashboardProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onProjectAdd: (project: Omit<Project, 'id'>) => void;
  onProjectDelete: (projectId: string) => void;
  loading?: boolean;
}

export default function Dashboard({
  projects,
  onProjectSelect,
  onProjectAdd,
  onProjectDelete,
  loading = false,
}: DashboardProps) {
  const { isDarkMode } = useTheme();
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'paused' | 'ended'>('all');

  React.useEffect(() => {
    setFilteredProjects(projects);
  }, [projects]);

  React.useEffect(() => {
    setIsSelectionMode(selectedProjects.length > 0);
  }, [selectedProjects]);

  const metrics = calculateMetrics(projects);
  const showDatabaseSetup = projects.length === 0 && !loading;

  const displayedProjects = filteredProjects.filter((project) => {
    return (
      viewMode === 'all' ||
      (viewMode === 'active' && project.status === 'Active') ||
      (viewMode === 'paused' && project.status === 'On Pause') ||
      (viewMode === 'ended' && project.status === 'Ended')
    );
  });

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'Active').length,
    onPause: projects.filter((p) => p.status === 'On Pause').length,
    ended: projects.filter((p) => p.status === 'Ended').length,
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    if (confirm(`Are you sure you want to delete the project "${projectName}"? This action cannot be undone.`)) {
      onProjectDelete(projectId);
      setSelectedProjects((prev) => prev.filter((id) => id !== projectId));
    }
  };

  const handleBulkUpdate = () => {
    setSelectedProjects([]);
  };

  const handleBulkDelete = (projectIds: string[]) => {
    projectIds.forEach((id) => onProjectDelete(id));
    setSelectedProjects([]);
  };

  return (
    <>
      <div className={`rounded-3xl p-6 md:p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-4xl font-bold tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Dashboard
            </h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              Plan, prioritize, and accomplish your projects with ease.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 shadow-sm hover:shadow transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        </div>

        {showDatabaseSetup && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-5 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-200 mb-1">No projects yet</p>
              <p className="text-amber-700 dark:text-amber-300">
                Click "Add Project" to create your first project.
              </p>
            </div>
          </div>
        )}

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Projects"
            value={metrics.totalProjects}
            variant="highlight"
            trend={metrics.totalProjectsTrend}
            subtitle="Increased from last month"
            loading={loading}
          />
          <MetricCard
            title="Ended Projects"
            value={stats.ended}
            trend={{ value: 8, isPositive: true }}
            subtitle="Increased from last month"
            loading={loading}
          />
          <MetricCard
            title="Running Projects"
            value={metrics.activeProjects}
            trend={metrics.activeProjectsTrend}
            subtitle="Increased from last month"
            loading={loading}
          />
          <MetricCard
            title="Pending Projects"
            value={stats.onPause}
            subtitle="On pause / awaiting action"
            loading={loading}
          />
        </div>

        {/* Filter pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['all', 'active', 'paused', 'ended'] as const).map((mode) => {
            const isActive = viewMode === mode;
            const labels: Record<typeof mode, string> = {
              all: `All (${projects.length})`,
              active: `Active (${stats.active})`,
              paused: `On Pause (${stats.onPause})`,
              ended: `Ended (${stats.ended})`,
            };
            return (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {labels[mode]}
              </button>
            );
          })}
        </div>

        {/* Search & Filter */}
        <div className="mb-6">
          <SearchAndFilter projects={projects} onFilteredResults={setFilteredProjects} />
        </div>

        {/* Bulk actions */}
        <div className="mb-6">
          <BulkActions
            projects={displayedProjects}
            selectedProjects={selectedProjects}
            onSelectionChange={setSelectedProjects}
            onBulkUpdate={handleBulkUpdate}
            onBulkDelete={handleBulkDelete}
          />
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {loading ? (
            <LoadingSkeleton type="card" count={6} />
          ) : (
            displayedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={isSelectionMode && selectedProjects.includes(project.id)}
                onSelect={
                  isSelectionMode
                    ? (selected) => {
                        if (selected) {
                          setSelectedProjects((prev) => [...prev, project.id]);
                        } else {
                          setSelectedProjects((prev) => prev.filter((id) => id !== project.id));
                        }
                      }
                    : undefined
                }
                onClick={() => !isSelectionMode && onProjectSelect(project)}
                onDelete={handleDeleteProject}
              />
            ))
          )}
        </div>

        {!loading && displayedProjects.length === 0 && !showDatabaseSetup && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 mb-3">
              <FolderKanban className="w-6 h-6 text-gray-400" />
            </div>
            <p className={`text-base font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              No projects match this filter
            </p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Try switching to "All" or add a new project.
            </p>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <AddProjectModal onClose={() => setShowAddModal(false)} onAdd={onProjectAdd} />
      )}

      {/* Mobile floating add */}
      <button
        onClick={() => setShowAddModal(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-700 text-white rounded-full shadow-lg hover:bg-emerald-800 flex items-center justify-center z-40 transition-colors"
      >
        <Plus className="h-6 w-6" />
      </button>
    </>
  );
}
