import { useState, useEffect } from 'react';
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
  dateRange: { start: string; end: string };
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
    dateRange: { start: '', end: '' },
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      let filtered = [...projects];

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (project) =>
            project.name.toLowerCase().includes(searchLower) ||
            project.teamMembers.some((member) => member.toLowerCase().includes(searchLower)) ||
            project.primaryGoals.some((goal) => goal.toLowerCase().includes(searchLower)) ||
            project.focusKeywords.some((keyword) => keyword.toLowerCase().includes(searchLower))
        );
      }
      if (filters.status.length > 0) {
        filtered = filtered.filter((project) => filters.status.includes(project.status));
      }
      if (filters.projectType.length > 0) {
        filtered = filtered.filter((project) => filters.projectType.includes(project.projectType));
      }
      if (filters.teamMember.length > 0) {
        filtered = filtered.filter((project) =>
          project.teamMembers.some((member) => filters.teamMember.includes(member))
        );
      }
      if (filters.upworkProfile.length > 0) {
        filtered = filtered.filter(
          (project) => project.upworkProfile && filters.upworkProfile.includes(project.upworkProfile)
        );
      }
      if (filters.businessDeveloper.length > 0) {
        filtered = filtered.filter(
          (project) =>
            project.businessDeveloper && filters.businessDeveloper.includes(project.businessDeveloper)
        );
      }
      if (filters.dateRange.start) {
        filtered = filtered.filter(
          (project) => new Date(project.startDate) >= new Date(filters.dateRange.start)
        );
      }
      if (filters.dateRange.end) {
        filtered = filtered.filter(
          (project) => new Date(project.startDate) <= new Date(filters.dateRange.end)
        );
      }

      onFilteredResults(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, projects, onFilteredResults]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (
    key: 'status' | 'projectType' | 'teamMember' | 'upworkProfile' | 'businessDeveloper',
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((item) => item !== value) : [...prev[key], value],
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
      dateRange: { start: '', end: '' },
    });
  };

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.projectType.length > 0 ||
    filters.teamMember.length > 0 ||
    filters.upworkProfile.length > 0 ||
    filters.businessDeveloper.length > 0 ||
    !!filters.dateRange.start ||
    !!filters.dateRange.end;

  const allTeamMembers = [...new Set(projects.flatMap((p) => p.teamMembers))];
  const allUpworkProfiles = [...new Set(projects.map((p) => p.upworkProfile).filter(Boolean))];
  const allBusinessDevelopers = [...new Set(projects.map((p) => p.businessDeveloper).filter(Boolean))];

  const dateInputClass = `w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-colors ${
    isDarkMode
      ? 'bg-gray-700 text-white border border-gray-600 focus:border-emerald-500'
      : 'bg-white text-gray-900 border border-gray-200 focus:border-emerald-500'
  }`;

  const checkboxClass = 'rounded border-gray-300 text-emerald-700 focus:ring-emerald-500';

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search
          className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-400'
          }`}
        />
        <input
          type="text"
          placeholder="Search projects, team members, goals, keywords..."
          value={filters.searchTerm}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
          className={`w-full pl-11 pr-4 py-2.5 rounded-full text-sm outline-none transition-colors ${
            isDarkMode
              ? 'bg-gray-700 text-white placeholder-gray-400'
              : 'bg-gray-50 text-gray-900 placeholder-gray-400'
          }`}
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            showFilters
              ? 'bg-emerald-700 text-white'
              : isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="h-4 w-4" />
          Advanced Filters
          {hasActiveFilters && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                showFilters ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {filters.status.length +
                filters.projectType.length +
                filters.teamMember.length +
                filters.upworkProfile.length +
                filters.businessDeveloper.length +
                (filters.dateRange.start ? 1 : 0) +
                (filters.dateRange.end ? 1 : 0)}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
              isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div
          className={`rounded-2xl p-5 lg:p-6 space-y-6 ${
            isDarkMode ? 'bg-gray-700/40' : 'bg-gray-50'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <div>
              <label
                className={`flex items-center gap-2 text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <Target className="h-4 w-4" />
                Status
              </label>
              <div className="space-y-2">
                {['Active', 'On Pause', 'Ended'].map((status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => toggleArrayFilter('status', status)}
                      className={checkboxClass}
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label
                className={`flex items-center gap-2 text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <Filter className="h-4 w-4" />
                Project Type
              </label>
              <div className="space-y-2">
                {['milestone', 'timer', 'fixed', 'direct-client'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.projectType.includes(type)}
                      onChange={() => toggleArrayFilter('projectType', type)}
                      className={checkboxClass}
                    />
                    <span className={`text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {type === 'direct-client' ? 'Direct Client' : type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label
                className={`flex items-center gap-2 text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <Users className="h-4 w-4" />
                Team Members
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {allTeamMembers.map((member) => (
                  <label key={member} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.teamMember.includes(member)}
                      onChange={() => toggleArrayFilter('teamMember', member)}
                      className={checkboxClass}
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {member}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label
                className={`flex items-center gap-2 text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <Users className="h-4 w-4" />
                Upwork Profile
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {allUpworkProfiles.map((profile) => (
                  <label key={profile} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.upworkProfile.includes(profile as string)}
                      onChange={() => toggleArrayFilter('upworkProfile', profile as string)}
                      className={checkboxClass}
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {profile}
                    </span>
                  </label>
                ))}
                {allUpworkProfiles.length === 0 && (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    No Upwork profiles found
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                className={`flex items-center gap-2 text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <Users className="h-4 w-4" />
                Business Developer
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {allBusinessDevelopers.map((bd) => (
                  <label key={bd} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.businessDeveloper.includes(bd as string)}
                      onChange={() => toggleArrayFilter('businessDeveloper', bd as string)}
                      className={checkboxClass}
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {bd}
                    </span>
                  </label>
                ))}
                {allBusinessDevelopers.length === 0 && (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    No business developers found
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label
              className={`flex items-center gap-2 text-sm font-medium mb-3 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Start Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  From
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                  className={dateInputClass}
                />
              </div>
              <div>
                <label className={`block text-xs mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  To
                </label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                  className={dateInputClass}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
