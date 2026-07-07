import React, { useState } from 'react';
import { Target, Users, Calendar, Key, Plus, Trash2, TrendingUp, Award } from 'lucide-react';
import { Project } from '../../types';
import MetricCard from '../ui/MetricCard';
import ProgressChart from '../ui/ProgressChart';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import Tooltip from '../ui/Tooltip';
import { useTheme } from '../../contexts/ThemeContext';

interface OverviewTabProps {
  project: Project;
  onUpdate: (project: Project) => void;
}

export default function OverviewTab({ project, onUpdate }: OverviewTabProps) {
  const { isDarkMode } = useTheme();

  const handleDeleteGoal = (goalIndex: number) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      const updatedProject = {
        ...project,
        primaryGoals: project.primaryGoals.filter((_, index) => index !== goalIndex)
      };
      onUpdate(updatedProject);
    }
  };

  const handleAddGoal = () => {
    const newGoal = prompt('Enter new goal:');
    if (newGoal && newGoal.trim()) {
      const updatedProject = {
        ...project,
        primaryGoals: [...project.primaryGoals, newGoal.trim()]
      };
      onUpdate(updatedProject);
    }
  };

  const handleDeleteAccess = (accessIndex: number) => {
    if (confirm('Are you sure you want to remove this access?')) {
      const updatedProject = {
        ...project,
        accessGranted: project.accessGranted.filter((_, index) => index !== accessIndex)
      };
      onUpdate(updatedProject);
    }
  };

  return (
    <div className="space-y-8">
      {/* Project Summary */}
      <div className="card p-6 animate-fade-in">
        <h2 className={`text-title mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Project Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          <MetricCard
            title="Days Active"
            value={Math.floor((new Date().getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))}
            icon={Calendar}
            color="blue"
            trend={{ value: 5, isPositive: true }}
          />
          <MetricCard
            title="Project Type"
            value={project.projectType.charAt(0).toUpperCase() + project.projectType.slice(1)}
            icon={Target}
            color="emerald"
          />
          <MetricCard
            title="Team Members"
            value={project.teamMembers.length}
            icon={Users}
            color="purple"
          />
          <MetricCard
            title="Access Points"
            value={project.accessGranted.length}
            icon={Key}
            color="amber"
          />
        </div>

        {/* Project Type Details */}
        <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Duration</p>
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{project.duration}</p>
            </div>
            {project.projectType === 'milestone' && project.deadline && (
              <div className="text-center">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Deadline</p>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{new Date(project.deadline).toLocaleDateString()}</p>
              </div>
            )}
            {(project.projectType === 'timer' || (project.projectType === 'milestone' && project.weeklyHours && project.weeklyHours > 0)) && (
              <div className="text-center">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Weekly Hours</p>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{project.weeklyHours} hours</p>
              </div>
            )}
            {project.projectType === 'fixed' && project.equivalentHours && project.equivalentHours > 0 && (
              <div className="text-center">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Equivalent Hours</p>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{project.equivalentHours} hours</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="card p-6 animate-slide-up">
        <h3 className={`text-title mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Team Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.teamMembers.map((member, index) => (
            <div key={index} className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-200 hover-lift ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
            }`}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                {member.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{member}</p>
                <p className={`text-caption ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>SEO Specialist</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="status-dot status-active"></div>
                  <span className={`text-small ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Information */}
      <div className="card p-6 animate-slide-up">
        <h3 className={`text-title mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Project Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {project.upworkProfile && (
            <div className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-200 hover-lift ${
              isDarkMode ? 'bg-blue-900/30 hover:bg-blue-900/40' : 'bg-blue-50 hover:bg-blue-100'
            }`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${
                isDarkMode ? 'bg-blue-800' : 'bg-blue-100'
              }`}>
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.543-2.546V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3.014-2.439-5.463-5.439-5.463z"/>
                </svg>
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upwork Profile</p>
                <p className="text-blue-600 font-semibold">{project.upworkProfile}</p>
                <p className={`text-caption mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active freelance profile</p>
              </div>
            </div>
          )}
          {project.businessDeveloper && (
            <div className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-200 hover-lift ${
              isDarkMode ? 'bg-emerald-900/30 hover:bg-emerald-900/40' : 'bg-emerald-50 hover:bg-emerald-100'
            }`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${
                isDarkMode ? 'bg-emerald-800' : 'bg-emerald-100'
              }`}>
                <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Business Developer</p>
                <p className="text-emerald-600 font-semibold">{project.businessDeveloper}</p>
                <p className={`text-caption mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Project lead and client liaison</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Goals */}
      <div className="card p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-title ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Primary Goals</h3>
          <button
            onClick={handleAddGoal}
            className={`btn btn-secondary btn-sm hover-lift ${
              isDarkMode 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            <Plus className="h-4 w-4" />
            Add Goal
          </button>
        </div>
        {project.primaryGoals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No goals set yet"
            description="Add project goals to track progress and objectives"
            action={{ label: "Add First Goal", onClick: handleAddGoal, icon: Plus }}
          />
        ) : (
          <div className="space-y-3 animate-fade-in">
            {project.primaryGoals.map((goal, index) => (
              <div key={index} className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-200 hover-lift ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 shadow-sm ${
                  isDarkMode ? 'bg-emerald-800' : 'bg-emerald-100'
                }`}>
                  <Target className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{goal}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status="In Progress" size="sm" />
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      <span className={`text-small ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        On track
                      </span>
                    </div>
                  </div>
                </div>
                <Tooltip content="Delete goal">
                  <button
                  onClick={() => handleDeleteGoal(index)}
                  className={`p-2 rounded-lg transition-all duration-200 hover-lift ${
                    isDarkMode 
                      ? 'text-gray-500 hover:text-red-400 hover:bg-red-900/20' 
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                </Tooltip>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Client Access Granted */}
      <div className="card p-6 animate-slide-up">
        <h3 className={`text-title mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Client Access Granted</h3>
        {project.accessGranted.length === 0 ? (
          <EmptyState
            icon={Key}
            title="No access granted yet"
            description="Access items will appear here once added in the Access Management tab"
          />
        ) : (
          <div className="space-y-3 animate-fade-in">
            {project.accessGranted.map((access, index) => (
              <div key={index} className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-200 hover-lift ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 shadow-sm ${
                  isDarkMode ? 'bg-blue-800' : 'bg-blue-100'
                }`}>
                  <Key className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{access.type}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={access.status} size="sm" />
                    <span className={`text-caption ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Granted {new Date(access.dateGranted).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Tooltip content="Remove access">
                  <button
                  onClick={() => handleDeleteAccess(index)}
                  className={`p-2 rounded-lg transition-all duration-200 hover-lift ${
                    isDarkMode 
                      ? 'text-gray-500 hover:text-red-400 hover:bg-red-900/20' 
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                </Tooltip>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}