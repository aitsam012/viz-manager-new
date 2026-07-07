import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, Users, Target } from 'lucide-react';
import { Project } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface SearchAndFilterProps {
  projects: Project[];
  onFilteredResults: (filteredProjects: Project[]) => void;
}

interface FilterState {
  searchTerm: string;
  status: string[];
  projectType: string[];
  teamMember: string[];
  upworkProfile: string[];
  businessDeveloper: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

export default function SearchAndFilter({ projects, onFilteredResults }: SearchAndFilterProps) {
  const { isDarkMode } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: [],
    projectType: [],
    teamMember: [],
    upworkProfile: [],
    businessDeveloper: [],
    dateRange: { start: '', end: '' }
  });

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, projects]);

  const applyFilters = () => {
    let filtered = [...projects];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        project.teamMembers.some(member => member.toLowerCase().includes(searchLower)) ||
        project.primaryGoals.some(goal => goal.toLowerCase().includes(searchLower)) ||
        project.focusKeywords.some(keyword => keyword.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(project => filters.status.includes(project.status));
    }

    // Project type filter
    if (filters.projectType.length > 0) {
      filtered = filtered.filter(project => filters.projectType.includes(project.projectType));
    }

    // Team member filter
    if (filters.teamMember.length > 0) {
      filtered = filtered.filter(project =>
        project.teamMembers.some(member => filters.teamMember.includes(member))
      );
    }

    // Upwork profile filter
    if (filters.upworkProfile.length > 0) {
      filtered = filtered.filter(project =>
        project.upworkProfile && filters.upworkProfile.includes(project.upworkProfile)
      );
    }

    // Business developer filter
    if (filters.businessDeveloper.length > 0) {
      filtered = filtered.filter(project =>
        project.businessDeveloper && filters.businessDeveloper.includes(project.businessDeveloper)
      );
    }

    // Date range filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(project =>
        new Date(project.startDate) >= new Date(filters.dateRange.start)
      );
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(project =>
        new Date(project.startDate) <= new Date(filters.dateRange.end)
      );
    }

    onFilteredResults(filtered);
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'status' | 'projectType' | 'teamMember' | 'upworkProfile' | 'businessDeveloper', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: [],
      projectType: [],
      teamMember: [],
      upworkProfile: [],
      businessDeveloper: [],
      dateRange: { start: '', end: '' }
    });
  };

  const hasActiveFilters = filters.status.length > 0 || filters.projectType.length > 0 || 
    filters.teamMember.length > 0 || filters.upworkProfile.length > 0 || 
    filters.businessDeveloper.length > 0 || filters.dateRange.start || filters.dateRange.end;

  // Get unique values for filters
  const allTeamMembers = [...new Set(projects.flatMap(p => p.teamMembers))];
  const allStatuses = [...new Set(projects.map(p => p.status))];
  const allProjectTypes = [...new Set(projects.map(p => p.projectType))];
  const allUpworkProfiles = [...new Set(projects.map(p => p.upworkProfile).filter(Boolean))];
  const allBusinessDevelopers = [...new Set(projects.map(p => p.businessDeveloper).filter(Boolean))];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-400'
        }`} />
        <input
          type="text"
          placeholder="Search projects, team members, goals, keywords..."
          value={filters.searchTerm}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
          className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
          } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4" />
          Advanced Filters
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
              {filters.status.length + filters.projectType.length + filters.teamMember.length + 
               filters.upworkProfile.length + filters.businessDeveloper.length +
               (filters.dateRange.start ? 1 : 0) + (filters.dateRange.end ? 1 : 0)}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={`flex items-center gap-1 text-sm transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-300' 
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className={`p-6 rounded-lg border space-y-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* Status Filter */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Target className="h-4 w-4 inline mr-2" />
                Status
              </label>
              <div className="space-y-2">
                {['Active', 'On Pause', 'Ended'].map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => toggleArrayFilter('status', status)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`ml-2 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Project Type Filter */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Filter className="h-4 w-4 inline mr-2" />
                Project Type
              </label>
              <div className="space-y-2">
                {['milestone', 'timer', 'fixed', 'direct-client'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.projectType.includes(type)}
                      onChange={() => toggleArrayFilter('projectType', type)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`ml-2 text-sm capitalize ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {type === 'direct-client' ? 'Direct Client' : type === 'milestone' ? 'Milestone' : type === 'timer' ? 'Timer' : type === 'fixed' ? 'Fixed' : type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Team Member Filter */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Users className="h-4 w-4 inline mr-2" />
                Team Members
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {allTeamMembers.map(member => (
                  <label key={member} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.teamMember.includes(member)}
                      onChange={() => toggleArrayFilter('teamMember', member)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`ml-2 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {member}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Upwork Profile Filter */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <svg className="h-4 w-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.543-2.546V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3.014-2.439-5.463-5.439-5.463z"/>
                </svg>
                Upwork Profile
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {allUpworkProfiles.map(profile => (
                  <label key={profile} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.upworkProfile.includes(profile)}
                      onChange={() => toggleArrayFilter('upworkProfile', profile)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`ml-2 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {profile}
                    </span>
                  </label>
                ))}
                {allUpworkProfiles.length === 0 && (
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    No Upwork profiles found
                  </p>
                )}
              </div>
            </div>

            {/* Business Developer Filter */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Users className="h-4 w-4 inline mr-2" />
                Business Developer
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {allBusinessDevelopers.map(bd => (
                  <label key={bd} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.businessDeveloper.includes(bd)}
                      onChange={() => toggleArrayFilter('businessDeveloper', bd)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`ml-2 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {bd}
                    </span>
                  </label>
                ))}
                {allBusinessDevelopers.length === 0 && (
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    No business developers found
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Calendar className="h-4 w-4 inline mr-2" />
              Start Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  From
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  To
                </label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}