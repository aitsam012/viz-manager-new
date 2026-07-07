import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Project } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface AddProjectModalProps {
  onClose: () => void;
  onAdd: (project: Omit<Project, 'id'>) => void;
}

export default function AddProjectModal({ onClose, onAdd }: AddProjectModalProps) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    status: 'Active' as Project['status'],
    startDate: '',
    duration: '',
    projectType: 'milestone' as Project['projectType'],
    deadline: '',
    weeklyHours: 0,
    upworkProfile: '',
    businessDeveloper: '',
    equivalentHours: 0,
    teamMembers: [''],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const projectData = {
      ...formData,
      teamMembers: formData.teamMembers.filter((member) => member.trim() !== ''),
      primaryGoals: [],
      focusKeywords: [],
    };

    onAdd(projectData);
    onClose();
  };

  const addListItem = (field: 'teamMembers') => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeListItem = (field: 'teamMembers', index: number) => {
    setFormData((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const updateListItem = (field: 'teamMembers', index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const labelClass = `block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;
  const inputClass = `w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-colors ${
    isDarkMode
      ? 'bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-emerald-500'
      : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-emerald-500'
  }`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className={`rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-100'
          }`}
        >
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Add New Project
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Project Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className={inputClass}
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label className={labelClass}>Client Name *</label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData((prev) => ({ ...prev, clientName: e.target.value }))}
                className={inputClass}
                placeholder="Enter client name"
              />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value as Project['status'] }))
                }
                className={inputClass}
              >
                <option value="Active">Active</option>
                <option value="On Pause">On Pause</option>
                <option value="Ended">Ended</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                className={inputClass}
                placeholder="e.g., 6 months, 1 year"
              />
            </div>

            <div>
              <label className={labelClass}>Business Developer</label>
              <input
                type="text"
                value={formData.businessDeveloper}
                onChange={(e) => setFormData((prev) => ({ ...prev, businessDeveloper: e.target.value }))}
                className={inputClass}
                placeholder="Enter business developer name"
              />
            </div>

            <div>
              <label className={labelClass}>Upwork Profile</label>
              <input
                type="text"
                value={formData.upworkProfile}
                onChange={(e) => setFormData((prev) => ({ ...prev, upworkProfile: e.target.value }))}
                className={inputClass}
                placeholder="Enter Upwork profile name"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Project Type *</label>
              <select
                value={formData.projectType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    projectType: e.target.value as Project['projectType'],
                  }))
                }
                className={inputClass}
              >
                <option value="milestone">Milestone-Based</option>
                <option value="timer">Timer-Based</option>
                <option value="fixed">Fixed Project</option>
                <option value="direct-client">Direct Client</option>
              </select>
            </div>

            {formData.projectType === 'milestone' && (
              <>
                <div>
                  <label className={labelClass}>Project Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Weekly Hours (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={formData.weeklyHours}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, weeklyHours: parseInt(e.target.value) || 0 }))
                    }
                    className={inputClass}
                    placeholder="e.g., 20"
                  />
                </div>
              </>
            )}

            {formData.projectType === 'timer' && (
              <div>
                <label className={labelClass}>Weekly Hours *</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  required
                  value={formData.weeklyHours}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, weeklyHours: parseInt(e.target.value) || 0 }))
                  }
                  className={inputClass}
                  placeholder="e.g., 20"
                />
              </div>
            )}

            {formData.projectType === 'fixed' && (
              <div>
                <label className={labelClass}>Equivalent Hours</label>
                <input
                  type="number"
                  min="1"
                  value={formData.equivalentHours}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, equivalentHours: parseInt(e.target.value) || 0 }))
                  }
                  className={inputClass}
                  placeholder="e.g., 100"
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Team Members
              </label>
              <button
                type="button"
                onClick={() => addListItem('teamMembers')}
                className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 text-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                Add Member
              </button>
            </div>
            <div className="space-y-2">
              {formData.teamMembers.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => updateListItem('teamMembers', index, e.target.value)}
                    className={inputClass}
                    placeholder="Team member name"
                  />
                  {formData.teamMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeListItem('teamMembers', index)}
                      className={`p-2.5 rounded-full transition-colors ${
                        isDarkMode
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30'
                          : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                      }`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            className={`flex justify-end gap-3 pt-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-100'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                isDarkMode
                  ? 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 shadow-sm transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
