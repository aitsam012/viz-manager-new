import React, { useState } from 'react';
import {
  Plus,
  Moon,
  Sun,
  LayoutGrid,
  FolderKanban,
  Users,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  Search,
  Bell,
  Mail,
  Circle,
  HelpCircle,
  Download,
  BarChart3,
  Command,
  AlertCircle,
} from 'lucide-react';
import ProjectCard from './ProjectCard';
import AddProjectModal from './AddProjectModal';
import SearchAndFilter from './SearchAndFilter';
import BulkActions from './BulkActions';
import NotificationCenter from './NotificationCenter';
import MetricCard from './ui/MetricCard';
import LoadingSkeleton from './ui/LoadingSkeleton';
import { calculateMetrics } from '../utils/metricsCalculator';
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

export default function Dashboard({
  projects,
  onProjectSelect,
  onProjectAdd,
  onProjectDelete,
  onViewChange,
  currentView,
  loading = false,
}: DashboardProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout, hasPermission } = useAuth();
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'paused' | 'ended'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    setFilteredProjects(projects);
  }, [projects]);

  React.useEffect(() => {
    setIsSelectionMode(selectedProjects.length > 0);
  }, [selectedProjects]);

  const metrics = calculateMetrics(projects);
  const showDatabaseSetup = projects.length === 0 && !loading;

  const displayedProjects = filteredProjects.filter((project) => {
    const matchesView =
      viewMode === 'all' ||
      (viewMode === 'active' && project.status === 'Active') ||
      (viewMode === 'paused' && project.status === 'On Pause') ||
      (viewMode === 'ended' && project.status === 'Ended');
    return matchesView;
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

  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutGrid },
    { id: 'projects' as const, label: 'Projects', icon: FolderKanban, badge: stats.total > 0 ? `${stats.total}` : undefined },
    { id: 'audits' as const, label: 'Audits', icon: ClipboardList },
    { id: 'reports' as const, label: 'Reports', icon: FileText },
  ];

  if (hasPermission('all', 'create')) {
    menuItems.push({ id: 'users' as const, label: 'Team', icon: Users });
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U';

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-[#f2f4f0]'}`}>
      {/* Sidebar */}
      <aside
        className={`hidden lg:flex flex-col w-64 shrink-0 p-4 gap-4 ${
          isDarkMode ? 'bg-gray-900' : 'bg-[#f2f4f0]'
        }`}
      >
        <div
          className={`rounded-3xl flex-1 flex flex-col p-5 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Circle className="h-5 w-5 text-emerald-600 fill-emerald-600" strokeWidth={0} />
              <div className="absolute w-3 h-3 rounded-full bg-white" />
            </div>
            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              VIZ Manager
            </span>
          </div>

          {/* Menu */}
          <div className="mb-6">
            <p className={`text-xs font-semibold tracking-widest mb-3 px-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              MENU
            </p>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = currentView === item.id || (item.id === 'projects' && currentView === 'projects');
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id === 'dashboard' ? 'projects' : item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-[18px] w-[18px]" />
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* General */}
          <div>
            <p className={`text-xs font-semibold tracking-widest mb-3 px-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              GENERAL
            </p>
            <nav className="space-y-1">
              <button
                onClick={toggleDarkMode}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {isDarkMode ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-[18px] w-[18px]" />
                Settings
              </button>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <HelpCircle className="h-[18px] w-[18px]" />
                Help
              </button>
              <button
                onClick={logout}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LogOut className="h-[18px] w-[18px]" />
                Logout
              </button>
            </nav>
          </div>

          <div className="flex-1" />

          {/* Download card */}
          <div className="relative rounded-2xl overflow-hidden mt-6 bg-gradient-to-br from-emerald-800 to-emerald-900 p-5 text-white">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 20% 100%, rgba(255,255,255,0.3) 0%, transparent 40%)'
            }} />
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center mb-3">
                <Download className="h-4 w-4" />
              </div>
              <h4 className="font-semibold text-sm leading-tight mb-1">Download our<br />Mobile App</h4>
              <p className="text-white/70 text-xs mb-4">Get easy in another way</p>
              <button className="w-full bg-white text-emerald-800 text-xs font-semibold py-2 rounded-full hover:bg-gray-50 transition-colors">
                Download
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 min-w-0 p-4 lg:pl-0 lg:pr-4 lg:py-4">
        {/* Top bar */}
        <div className={`rounded-3xl px-6 py-4 flex items-center gap-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex-1 relative">
            <Search className={`h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className={`w-full pl-11 pr-16 py-2.5 rounded-full text-sm outline-none transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-white placeholder-gray-400'
                  : 'bg-gray-50 text-gray-900 placeholder-gray-400'
              }`}
            />
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-medium ${
              isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-500 border border-gray-200'
            }`}>
              <Command className="h-3 w-3" /> F
            </div>
          </div>

          <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}>
            <Mail className="h-4 w-4" />
          </button>

          <div className="relative">
            <NotificationCenter />
          </div>

          <div className={`flex items-center gap-3 pl-3 border-l ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-semibold text-sm">
              {initials}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name || 'User'}
                </p>
                <RoleBadge role={user?.role || 'viewer'} size="sm" showIcon={false} />
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Content card */}
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
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 shadow-sm hover:shadow transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Project
              </button>
              <button
                onClick={() => onViewChange('reports')}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all ${
                  isDarkMode
                    ? 'border-gray-600 text-white hover:bg-gray-700'
                    : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                View Reports
              </button>
            </div>
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
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <AddProjectModal onClose={() => setShowAddModal(false)} onAdd={onProjectAdd} />
      )}

      {/* Mobile bottom bar for add */}
      <button
        onClick={() => setShowAddModal(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-700 text-white rounded-full shadow-lg hover:bg-emerald-800 flex items-center justify-center z-40 transition-colors"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
