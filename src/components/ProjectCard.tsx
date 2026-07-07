import React from 'react';
import { Calendar, Users, Target, ChevronRight, Trash2, Square, CheckSquare, Clock, User } from 'lucide-react';
import { Project } from '../types';
import StatusBadge from './ui/StatusBadge';
import ProgressChart from './ui/ProgressChart';
import Tooltip from './ui/Tooltip';
import { useTheme } from '../contexts/ThemeContext';

interface ProjectCardProps {
  project: Project;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick: () => void;
  onDelete: (projectId: string, projectName: string) => void;
}

export default function ProjectCard({ project, isSelected = false, onSelect, onClick, onDelete }: ProjectCardProps) {
  const { isDarkMode } = useTheme();
  
  // Calculate project progress (mock calculation)
  const progress = Math.min(100, Math.floor(Math.random() * 100) + 20);
  
  // Calculate days since start
  const daysSinceStart = Math.floor((new Date().getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24));

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
    // Only allow navigation if not in selection mode
    if (!onSelect) {
      onClick();
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`card card-interactive p-4 md:p-6 group relative animate-fade-in ${
        onSelect ? 'cursor-default' : 'cursor-pointer'
      } ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={handleSelectClick}
            className={`p-1 rounded hover-lift transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-300' 
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            {isSelected ? (
              <CheckSquare className="h-5 w-5 text-blue-600" />
            ) : (
              <Square className="h-5 w-5" />
            )}
          </button>
        </div>
      )}

      {/* Action Buttons - Top Right Corner */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <button
          onClick={handleDeleteClick}
          className={`p-1.5 rounded-lg transition-all duration-200 hover-lift ${
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
            className={`p-1.5 rounded-lg transition-all duration-200 hover-lift ${
              isDarkMode 
                ? 'text-gray-500 hover:text-blue-400 hover:bg-blue-900/20' 
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
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
          className={`text-title font-semibold transition-colors cursor-pointer flex-1 pr-16 ${
            onSelect ? 'ml-8' : ''
          } ${
            isDarkMode 
              ? 'text-white group-hover:text-blue-400' 
              : 'text-gray-900 group-hover:text-blue-600'
          }`}
        >
          {project.name}
        </h3>
      </div>

      <div onClick={onSelect ? undefined : onClick} className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={project.status} size="sm" />
          <div className={`flex items-center gap-1 text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Clock className="h-3 w-3" />
            <span>{daysSinceStart} days</span>
          </div>
        </div>

        <div className={`flex items-center gap-2 text-caption ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <Calendar className="h-4 w-4" />
          <span>Started {new Date(project.startDate).toLocaleDateString()}</span>
        </div>

        <div className={`flex items-center gap-2 text-caption ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <User className="h-4 w-4" />
          <span>Client: {project.clientName}</span>
        </div>

        <div className={`flex items-center gap-2 text-caption ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <Target className="h-4 w-4" />
          <span>{project.teamMembers.length} team member{project.teamMembers.length !== 1 ? 's' : ''}</span>
        </div>

        <div className={`flex items-center gap-2 text-caption ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <Target className="h-4 w-4" />
          <span>{project.primaryGoals.length} active goal{project.primaryGoals.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className={`text-small font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Progress
            </span>
            <span className={`text-small ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {progress}%
            </span>
          </div>
          <div className="progress-bar h-2">
            <div 
              className={`progress-fill ${
                progress >= 70 ? 'progress-success' : 
                progress >= 40 ? 'progress-info' : 
                'progress-warning'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div onClick={onSelect ? undefined : onClick} className={`border-t pt-4 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex flex-wrap gap-1">
          {project.focusKeywords.slice(0, 2).map((keyword, index) => (
            <Tooltip key={index} content={`Focus keyword: ${keyword}`}>
              <span
              key={index}
              className={`badge badge-info hover-lift cursor-help ${
                isDarkMode 
                  ? 'bg-blue-900/50 text-blue-300' 
                  : 'bg-blue-50 text-blue-700'
              }`}
            >
              {keyword}
            </span>
            </Tooltip>
          ))}
          {project.focusKeywords.length > 2 && (
            <Tooltip content={`${project.focusKeywords.length - 2} more keywords: ${project.focusKeywords.slice(2).join(', ')}`}>
              <span className="badge badge-neutral hover-lift cursor-help">
                +{project.focusKeywords.length - 2} more
              </span>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}