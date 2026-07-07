import React, { useState } from 'react';
import { ArrowLeft, Users, Calendar, Target, Key, MessageSquare, HelpCircle, Image, Settings, X, Save, Plus, Trash2, User } from 'lucide-react';
import { Project } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import OverviewTab from './tabs/OverviewTab';
import GoalsTab from './tabs/GoalsTab';
import AccessTab from './tabs/AccessTab';
import ProgressReportTab from './tabs/ProgressReportTab';
import QueriesTab from './tabs/QueriesTab';
import ProjectDocumentsTab from './tabs/ProjectDocumentsTab';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdate: (project: Project) => void;
}

type TabType = 'overview' | 'goals' | 'access' | 'progress' | 'queries' | 'documents';

export default function ProjectDetail({ project, onBack, onUpdate }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { isDarkMode } = useTheme();
  const [editData, setEditData] = useState({
    name: project.name,
    clientName: project.clientName,
    status: project.status,
    duration: project.duration,
    deadline: project.deadline || '',
    weeklyHours: project.weeklyHours || 0,
    equivalentHours: project.equivalentHours || 0,
    upworkProfile: project.upworkProfile || '',
    businessDeveloper: project.businessDeveloper || '',
    teamMembers: [...project.teamMembers]
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'goals', label: 'Goals & KPIs', icon: Target },
    { id: 'access', label: 'Access Management', icon: Key },
    { id: 'queries', label: 'Client Queries', icon: HelpCircle },
    { id: 'documents', label: 'Project Documents', icon: Image }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'On Pause':
        return 'bg-yellow-100 text-yellow-800';
      case 'Ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenSettings = () => {
    setEditData({
      name: project.name,
      clientName: project.clientName,
      status: project.status,
      duration: project.duration,
      deadline: project.deadline || '',
      weeklyHours: project.weeklyHours || 0,
      equivalentHours: project.equivalentHours || 0,
      upworkProfile: project.upworkProfile || '',
      businessDeveloper: project.businessDeveloper || '',
      teamMembers: [...project.teamMembers]
    });
    setShowSettingsModal(true);
  };

  const handleSaveSettings = () => {
    const updatedProject = {
      ...project,
      ...editData,
      teamMembers: editData.teamMembers.filter(member => member.trim() !== '')
    };
    onUpdate(updatedProject);
    setShowSettingsModal(false);
  };

  const handleCancelSettings = () => {
    setEditData({
      name: project.name,
      clientName: project.clientName,
      status: project.status,
      duration: project.duration,
      deadline: project.deadline || '',
      weeklyHours: project.weeklyHours || 0,
      equivalentHours: project.equivalentHours || 0,
      upworkProfile: project.upworkProfile || '',
      businessDeveloper: project.businessDeveloper || '',
      teamMembers: [...project.teamMembers]
    });
    setShowSettingsModal(false);
  };

  const addTeamMember = () => {
    setEditData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, '']
    }));
  };

  const removeTeamMember = (index: number) => {
    if (editData.teamMembers.length > 1) {
      setEditData(prev => ({
        ...prev,
        teamMembers: prev.teamMembers.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTeamMember = (index: number, value: string) => {
    setEditData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => i === index ? value : member)
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab project={project} onUpdate={onUpdate} />;
      case 'goals':
        return <GoalsTab project={project} onUpdate={onUpdate} />;
      case 'access':
        return <AccessTab project={project} onUpdate={onUpdate} />;
      case 'queries':
        return <QueriesTab project={project} onUpdate={onUpdate} />;
      case 'documents':
        return <ProjectDocumentsTab project={project} onUpdate={onUpdate} />;
      default:
        return <OverviewTab project={project} onUpdate={onUpdate} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`shadow-sm border-b transition-colors ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className={`flex items-center gap-2 transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              <button 
                onClick={handleOpenSettings}
                className={`transition-colors ${
                  isDarkMode 
                    ? 'text-gray-500 hover:text-gray-300' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Project Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="pb-6">
            <h1 className={`text-2xl md:text-3xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {project.name}
            </h1>
            <div className={`flex flex-wrap gap-4 md:gap-6 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Started {new Date(project.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Client: {project.clientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{project.teamMembers.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>{project.duration} duration</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={`flex space-x-4 md:space-x-8 border-b overflow-x-auto ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : isDarkMode 
                        ? 'border-transparent text-gray-400 hover:text-gray-300' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {renderTabContent()}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Project Settings
              </h2>
              <button
                onClick={handleCancelSettings}
                className={`transition-colors ${
                  isDarkMode 
                    ? 'text-gray-500 hover:text-gray-300' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={editData.clientName}
                    onChange={(e) => setEditData(prev => ({ ...prev, clientName: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as Project['status'] }))}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="Active">Active</option>
                    <option value="On Pause">On Pause</option>
                    <option value="Ended">Ended</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Duration
                  </label>
                  <input
                    type="text"
                    value={editData.duration}
                    onChange={(e) => setEditData(prev => ({ ...prev, duration: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="e.g., 6 months, 1 year"
                  />
                </div>
                {project.projectType === 'milestone' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={editData.deadline}
                      onChange={(e) => setEditData(prev => ({ ...prev, deadline: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                )}
                {(project.projectType === 'timer' || (project.projectType === 'milestone' && project.weeklyHours)) && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Weekly Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={editData.weeklyHours}
                      onChange={(e) => setEditData(prev => ({ ...prev, weeklyHours: parseInt(e.target.value) || 0 }))}
                      className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                )}
                {project.projectType === 'fixed' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Equivalent Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editData.equivalentHours}
                      onChange={(e) => setEditData(prev => ({ ...prev, equivalentHours: parseInt(e.target.value) || 0 }))}
                      className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                )}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Upwork Profile
                  </label>
                  <input
                    type="text"
                    value={editData.upworkProfile}
                    onChange={(e) => setEditData(prev => ({ ...prev, upworkProfile: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter Upwork profile name"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Business Developer
                  </label>
                  <input
                    type="text"
                    value={editData.businessDeveloper}
                    onChange={(e) => setEditData(prev => ({ ...prev, businessDeveloper: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter business developer name"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`block text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Team Members
                  </label>
                  <button
                    onClick={addTeamMember}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    Add Member
                  </button>
                </div>
                <div className="space-y-2">
                  {editData.teamMembers.map((member, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={member}
                        onChange={(e) => updateTeamMember(index, e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="Team member name"
                      />
                      {editData.teamMembers.length > 1 && (
                        <button
                          onClick={() => removeTeamMember(index)}
                          className={`p-2 transition-colors ${
                            isDarkMode 
                              ? 'text-red-400 hover:text-red-300' 
                              : 'text-red-600 hover:text-red-700'
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={handleCancelSettings}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}