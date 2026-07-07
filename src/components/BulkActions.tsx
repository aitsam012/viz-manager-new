import React, { useState } from 'react';
import { CheckSquare, Square, MoreHorizontal, Trash2, Edit, Users, Download } from 'lucide-react';
import { Project } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface BulkActionsProps {
  projects: Project[];
  selectedProjects: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onBulkUpdate: (projectIds: string[], updates: Partial<Project>) => void;
  onBulkDelete: (projectIds: string[]) => void;
}

export default function BulkActions({ 
  projects, 
  selectedProjects, 
  onSelectionChange, 
  onBulkUpdate, 
  onBulkDelete 
}: BulkActionsProps) {
  const { isDarkMode } = useTheme();
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    status: '',
    teamMember: ''
  });

  const isAllSelected = projects.length > 0 && selectedProjects.length === projects.length;
  const isPartiallySelected = selectedProjects.length > 0 && selectedProjects.length < projects.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(projects.map(p => p.id));
    }
  };

  const handleBulkEdit = () => {
    const updates: Partial<Project> = {};
    
    if (bulkEditData.status) {
      updates.status = bulkEditData.status as Project['status'];
    }
    
    if (bulkEditData.teamMember) {
      // Add team member to all selected projects
      updates.teamMembers = [...new Set([bulkEditData.teamMember])];
    }

    onBulkUpdate(selectedProjects, updates);
    setShowBulkEditModal(false);
    setBulkEditData({ status: '', teamMember: '' });
    setShowBulkMenu(false);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedProjects.length} selected projects? This action cannot be undone.`)) {
      onBulkDelete(selectedProjects);
      setShowBulkMenu(false);
    }
  };

  const handleExport = () => {
    const selectedProjectsData = projects.filter(p => selectedProjects.includes(p.id));
    const csvContent = [
      ['Project Name', 'Status', 'Start Date', 'Duration', 'Team Members', 'Goals'].join(','),
      ...selectedProjectsData.map(p => [
        p.name,
        p.status,
        p.startDate,
        p.duration,
        p.teamMembers.join('; '),
        p.primaryGoals.join('; ')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setShowBulkMenu(false);
  };

  if (projects.length === 0) return null;

  return (
    <>
      <div className={`flex items-center justify-between p-4 rounded-lg border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSelectAll}
            className={`p-1 rounded transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-300' 
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            {isAllSelected ? (
              <CheckSquare className="h-5 w-5 text-blue-600" />
            ) : isPartiallySelected ? (
              <div className="h-5 w-5 bg-blue-600 rounded border-2 border-blue-600 flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-sm" />
              </div>
            ) : (
              <Square className="h-5 w-5" />
            )}
          </button>
          
          <span className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {selectedProjects.length > 0 
              ? `${selectedProjects.length} of ${projects.length} selected`
              : `Select projects for bulk actions`
            }
          </span>
        </div>

        {selectedProjects.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowBulkMenu(!showBulkMenu)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MoreHorizontal className="h-4 w-4" />
              Bulk Actions
            </button>

            {showBulkMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowBulkMenu(false)}
                />
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowBulkEditModal(true);
                        setShowBulkMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Edit className="h-4 w-4" />
                      Bulk Edit
                    </button>
                    <button
                      onClick={handleExport}
                      className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Download className="h-4 w-4" />
                      Export Selected
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                        isDarkMode 
                          ? 'text-red-400 hover:bg-gray-700' 
                          : 'text-red-600 hover:bg-gray-50'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg shadow-xl w-full max-w-md ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Bulk Edit Projects
              </h3>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Update {selectedProjects.length} selected projects
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status (optional)
                </label>
                <select
                  value={bulkEditData.status}
                  onChange={(e) => setBulkEditData(prev => ({ ...prev, status: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Keep current status</option>
                  <option value="Active">Active</option>
                  <option value="On Pause">On Pause</option>
                  <option value="Ended">Ended</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Add Team Member (optional)
                </label>
                <input
                  type="text"
                  value={bulkEditData.teamMember}
                  onChange={(e) => setBulkEditData(prev => ({ ...prev, teamMember: e.target.value }))}
                  placeholder="Enter team member name"
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setShowBulkEditModal(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Projects
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}