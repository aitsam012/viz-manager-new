import { useState } from 'react';
import { Users, Calendar, Target, Key, HelpCircle, Image, Settings, X, Save, Plus, Trash2, User } from 'lucide-react';
import { Project } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import OverviewTab from './tabs/OverviewTab';
import GoalsTab from './tabs/GoalsTab';
import AccessTab from './tabs/AccessTab';
import QueriesTab from './tabs/QueriesTab';
import ProjectDocumentsTab from './tabs/ProjectDocumentsTab';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdate: (project: Project) => void;
}

type TabType = 'overview' | 'goals' | 'access' | 'queries' | 'documents';

export default function ProjectDetail({ project, onUpdate }: ProjectDetailProps) {
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
    teamMembers: [...project.teamMembers],
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'goals', label: 'Goals & KPIs', icon: Target },
    { id: 'access', label: 'Access Management', icon: Key },
    { id: 'queries', label: 'Client Queries', icon: HelpCircle },
    { id: 'documents', label: 'Project Documents', icon: Image },
  ];

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800';
      case 'On Pause':
        return 'bg-amber-100 text-amber-800';
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
      teamMembers: [...project.teamMembers],
    });
    setShowSettingsModal(true);
  };

  const handleSaveSettings = () => {
    const updatedProject = {
      ...project,
      ...editData,
      teamMembers: editData.teamMembers.filter((member) => member.trim() !== ''),
    };
    onUpdate(updatedProject);
    setShowSettingsModal(false);
  };

  const handleCancelSettings = () => {
    setShowSettingsModal(false);
  };

  const addTeamMember = () => {
    setEditData((prev) => ({ ...prev, teamMembers: [...prev.teamMembers, ''] }));
  };

  const removeTeamMember = (index: number) => {
    if (editData.teamMembers.length > 1) {
      setEditData((prev) => ({
        ...prev,
        teamMembers: prev.teamMembers.filter((_, i) => i !== index),
      }));
    }
  };

  const updateTeamMember = (index: number, value: string) => {
    setEditData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => (i === index ? value : member)),
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

  const inputBase = `w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-colors ${
    isDarkMode
      ? 'bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-emerald-500'
      : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-emerald-500'
  }`;

  return (
    <div className={`rounded-3xl p-6 md:p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1
              className={`text-3xl md:text-4xl font-bold tracking-tight truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {project.name}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusPill(
                project.status
              )}`}
            >
              {project.status}
            </span>
          </div>
          <div className={`flex flex-wrap gap-3 md:gap-5 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Started {new Date(project.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>Client: {project.clientName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span className="truncate max-w-xs">{project.teamMembers.join(', ')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Target className="h-4 w-4" />
              <span>{project.duration}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleOpenSettings}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
            isDarkMode
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>

      {/* Tabs */}
      <div className={`mb-6 flex flex-wrap gap-2 pb-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div
              className={`flex items-center justify-between p-6 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-100'
              }`}
            >
              <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Project Settings
              </h2>
              <button
                onClick={handleCancelSettings}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={editData.clientName}
                    onChange={(e) => setEditData((prev) => ({ ...prev, clientName: e.target.value }))}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, status: e.target.value as Project['status'] }))
                    }
                    className={inputBase}
                  >
                    <option value="Active">Active</option>
                    <option value="On Pause">On Pause</option>
                    <option value="Ended">Ended</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Duration
                  </label>
                  <input
                    type="text"
                    value={editData.duration}
                    onChange={(e) => setEditData((prev) => ({ ...prev, duration: e.target.value }))}
                    className={inputBase}
                    placeholder="e.g., 6 months, 1 year"
                  />
                </div>
                {project.projectType === 'milestone' && (
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={editData.deadline}
                      onChange={(e) => setEditData((prev) => ({ ...prev, deadline: e.target.value }))}
                      className={inputBase}
                    />
                  </div>
                )}
                {(project.projectType === 'timer' ||
                  (project.projectType === 'milestone' && project.weeklyHours)) && (
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Weekly Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={editData.weeklyHours}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, weeklyHours: parseInt(e.target.value) || 0 }))
                      }
                      className={inputBase}
                    />
                  </div>
                )}
                {project.projectType === 'fixed' && (
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Equivalent Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editData.equivalentHours}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, equivalentHours: parseInt(e.target.value) || 0 }))
                      }
                      className={inputBase}
                    />
                  </div>
                )}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Upwork Profile
                  </label>
                  <input
                    type="text"
                    value={editData.upworkProfile}
                    onChange={(e) => setEditData((prev) => ({ ...prev, upworkProfile: e.target.value }))}
                    className={inputBase}
                    placeholder="Enter Upwork profile name"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Business Developer
                  </label>
                  <input
                    type="text"
                    value={editData.businessDeveloper}
                    onChange={(e) => setEditData((prev) => ({ ...prev, businessDeveloper: e.target.value }))}
                    className={inputBase}
                    placeholder="Enter business developer name"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Team Members
                  </label>
                  <button
                    onClick={addTeamMember}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
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
                        className={inputBase}
                        placeholder="Team member name"
                      />
                      {editData.teamMembers.length > 1 && (
                        <button
                          onClick={() => removeTeamMember(index)}
                          className={`p-2.5 rounded-full transition-colors ${
                            isDarkMode
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30'
                              : 'text-red-600 hover:text-red-700 hover:bg-red-50'
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

            <div
              className={`flex justify-end gap-3 p-6 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-100'
              }`}
            >
              <button
                onClick={handleCancelSettings}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                  isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="inline-flex items-center gap-2 bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-800 shadow-sm transition-colors"
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
