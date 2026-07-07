import { useState } from 'react';
import { CheckSquare, Square, MoreHorizontal, Trash2, CreditCard as Edit, Download } from 'lucide-react';
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
  onBulkDelete,
}: BulkActionsProps) {
  const { isDarkMode } = useTheme();
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    status: '',
    teamMember: '',
  });

  const isAllSelected = projects.length > 0 && selectedProjects.length === projects.length;
  const isPartiallySelected = selectedProjects.length > 0 && selectedProjects.length < projects.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(projects.map((p) => p.id));
    }
  };

  const handleBulkEdit = () => {
    const updates: Partial<Project> = {};

    if (bulkEditData.status) {
      updates.status = bulkEditData.status as Project['status'];
    }

    if (bulkEditData.teamMember) {
      updates.teamMembers = [...new Set([bulkEditData.teamMember])];
    }

    onBulkUpdate(selectedProjects, updates);
    setShowBulkEditModal(false);
    setBulkEditData({ status: '', teamMember: '' });
    setShowBulkMenu(false);
  };

  const handleBulkDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedProjects.length} selected projects? This action cannot be undone.`
      )
    ) {
      onBulkDelete(selectedProjects);
      setShowBulkMenu(false);
    }
  };

  const handleExport = () => {
    const selectedProjectsData = projects.filter((p) => selectedProjects.includes(p.id));
    const csvContent = [
      ['Project Name', 'Status', 'Start Date', 'Duration', 'Team Members', 'Goals'].join(','),
      ...selectedProjectsData.map((p) =>
        [
          p.name,
          p.status,
          p.startDate,
          p.duration,
          p.teamMembers.join('; '),
          p.primaryGoals.join('; '),
        ].join(',')
      ),
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

  const inputClass = `w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-colors ${
    isDarkMode
      ? 'bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-emerald-500'
      : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-emerald-500'
  }`;

  return (
    <>
      <div
        className={`flex items-center justify-between p-4 rounded-2xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={handleSelectAll}
            className={`p-1 rounded-lg transition-colors ${
              isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isAllSelected ? (
              <CheckSquare className="h-5 w-5 text-emerald-600" />
            ) : isPartiallySelected ? (
              <div className="h-5 w-5 bg-emerald-600 rounded border-2 border-emerald-600 flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-sm" />
              </div>
            ) : (
              <Square className="h-5 w-5" />
            )}
          </button>

          <span
            className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {selectedProjects.length > 0
              ? `${selectedProjects.length} of ${projects.length} selected`
              : `Select projects for bulk actions`}
          </span>
        </div>

        {selectedProjects.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowBulkMenu(!showBulkMenu)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <MoreHorizontal className="h-4 w-4" />
              Bulk Actions
            </button>

            {showBulkMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowBulkMenu(false)} />
                <div
                  className={`absolute right-0 mt-2 w-52 rounded-2xl shadow-xl z-50 overflow-hidden ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowBulkEditModal(true);
                        setShowBulkMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm transition-colors ${
                        isDarkMode
                          ? 'text-gray-200 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Edit className="h-4 w-4" />
                      Bulk Edit
                    </button>
                    <button
                      onClick={handleExport}
                      className={`w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm transition-colors ${
                        isDarkMode
                          ? 'text-gray-200 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Download className="h-4 w-4" />
                      Export Selected
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className={`w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm transition-colors ${
                        isDarkMode
                          ? 'text-red-400 hover:bg-gray-700'
                          : 'text-red-600 hover:bg-red-50'
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

      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-3xl shadow-2xl w-full max-w-md ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div
              className={`p-6 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-100'
              }`}
            >
              <h3
                className={`text-xl font-bold tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Bulk Edit Projects
              </h3>
              <p
                className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Update {selectedProjects.length} selected projects
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Status (optional)
                </label>
                <select
                  value={bulkEditData.status}
                  onChange={(e) => setBulkEditData((prev) => ({ ...prev, status: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Keep current status</option>
                  <option value="Active">Active</option>
                  <option value="On Pause">On Pause</option>
                  <option value="Ended">Ended</option>
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Add Team Member (optional)
                </label>
                <input
                  type="text"
                  value={bulkEditData.teamMember}
                  onChange={(e) =>
                    setBulkEditData((prev) => ({ ...prev, teamMember: e.target.value }))
                  }
                  placeholder="Enter team member name"
                  className={inputClass}
                />
              </div>
            </div>

            <div
              className={`flex justify-end gap-3 p-6 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-100'
              }`}
            >
              <button
                onClick={() => setShowBulkEditModal(false)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                  isDarkMode
                    ? 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkEdit}
                className="px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 shadow-sm transition-colors"
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
