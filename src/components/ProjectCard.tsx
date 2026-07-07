import React from 'react';
import { Calendar, Target, ChevronRight, Trash2, Square, CheckSquare, Clock, User } from 'lucide-react';
import { Project } from '../types';
import StatusBadge from './ui/StatusBadge';
import Tooltip from './ui/Tooltip';
import { useTheme } from '../contexts/ThemeContext';

interface ProjectCardProps {
  project: Project;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick: () => void;
  onDelete: (projectId: string, projectName: string) => void;
}

export default function ProjectCard({
  project,
  isSelected = false,
  onSelect,
  onClick,
  onDelete,
}: ProjectCardProps) {
  const { isDarkMode } = useTheme();

  const progress = Math.min(100, Math.floor(Math.random() * 100) + 20);
  const daysSinceStart = Math.floor(
    (new Date().getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id, project.name);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect?.(!isSelected);
  };

  const handleCardClick = () => {
    if (!onSelect) {
      onClick();
    }
  };

  const progressColor =
    progress >= 70 ? 'bg-emerald-500' : progress >= 40 ? 'bg-teal-500' : 'bg-amber-500';

  return (
    <div
      onClick={handleCardClick}
      className={`relative rounded-3xl p-5 md:p-6 group transition-all ${
        isDarkMode ? 'bg-gray-800 hover:bg-gray-800/80' : 'bg-white hover:shadow-md'
      } ${onSelect ? 'cursor-default' : 'cursor-pointer'} ${
        isSelected ? 'ring-2 ring-emerald-500' : ''
      }`}
    >
      {onSelect && (
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleSelectClick}
            className={`p-1 rounded-lg transition-colors ${
              isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isSelected ? (
              <CheckSquare className="h-5 w-5 text-emerald-600" />
            ) : (
              <Square className="h-5 w-5" />
            )}
          </button>
        </div>
      )}

      <div className="absolute top-3 right-3 flex items-center gap-1">
        <button
          onClick={handleDeleteClick}
          className={`p-1.5 rounded-full transition-all ${
            onSelect ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          } ${
            isDarkMode
              ? 'text-gray-500 hover:text-red-400 hover:bg-red-900/20'
              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
          }`}
          title="Delete project"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        {!onSelect && (
          <button
            onClick={onClick}
            className={`p-1.5 rounded-full transition-all ${
              isDarkMode
                ? 'text-gray-500 hover:text-emerald-400 hover:bg-emerald-900/20'
                : 'text-gray-400 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
            title="Open project"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-start justify-between mb-4">
        <h3
          onClick={onSelect ? undefined : onClick}
          className={`text-lg font-bold tracking-tight cursor-pointer flex-1 pr-16 transition-colors ${
            onSelect ? 'ml-8' : ''
          } ${
            isDarkMode
              ? 'text-white group-hover:text-emerald-400'
              : 'text-gray-900 group-hover:text-emerald-700'
          }`}
        >
          {project.name}
        </h3>
      </div>

      <div onClick={onSelect ? undefined : onClick} className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={project.status} size="sm" />
          <div
            className={`flex items-center gap-1 text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <Clock className="h-3 w-3" />
            <span>{daysSinceStart} days</span>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Started {new Date(project.startDate).toLocaleDateString()}</span>
        </div>

        <div
          className={`flex items-center gap-2 text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Client: {project.clientName}</span>
        </div>

        <div
          className={`flex items-center gap-2 text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          <Target className="h-4 w-4" />
          <span>
            {project.teamMembers.length} team member{project.teamMembers.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div
          className={`flex items-center gap-2 text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          <Target className="h-4 w-4" />
          <span>
            {project.primaryGoals.length} active goal
            {project.primaryGoals.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center">
            <span
              className={`text-xs font-semibold ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Progress
            </span>
            <span
              className={`text-xs font-semibold ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {progress}%
            </span>
          </div>
          <div
            className={`h-2 rounded-full overflow-hidden ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            <div
              className={`h-full rounded-full transition-all ${progressColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div
        onClick={onSelect ? undefined : onClick}
        className={`border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}
      >
        <div className="flex flex-wrap gap-1.5">
          {project.focusKeywords.slice(0, 2).map((keyword, index) => (
            <Tooltip key={index} content={`Focus keyword: ${keyword}`}>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-help ${
                  isDarkMode ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {keyword}
              </span>
            </Tooltip>
          ))}
          {project.focusKeywords.length > 2 && (
            <Tooltip
              content={`${project.focusKeywords.length - 2} more keywords: ${project.focusKeywords
                .slice(2)
                .join(', ')}`}
            >
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-help ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                +{project.focusKeywords.length - 2} more
              </span>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
