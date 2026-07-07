import React, { useState } from 'react';
import { X, Check, Eye, CreditCard as Edit } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { User, ProjectAssignment } from '../../types/user';

interface ProjectAssignmentModalProps {
  user: User;
  onClose: () => void;
  onSave: (userId: string, assignments: { projectAssignments: ProjectAssignment[]; hasAllProjects: boolean }) => void;
}

const MOCK_PROJECTS = [
  { id: '1', name: 'TechCorp Solutions' },
  { id: '2', name: 'GreenLeaf Organics' },
  { id: '3', name: 'Digital Marketing Pro' },
  { id: '4', name: 'E-commerce Boost' },
];

const EDITABLE_SECTIONS = [
  { id: 'overview', name: 'Overview', description: 'Project summary and basic info' },
  { id: 'goals', name: 'Goals & KPIs', description: 'Project goals and objectives' },
  { id: 'access', name: 'Access Management', description: 'Client access and credentials' },
  { id: 'queries', name: 'Client Queries', description: 'Q&A and client communication' },
  { id: 'documents', name: 'Documents', description: 'Project files and reports' },
];

export default function ProjectAssignmentModal({ user, onClose, onSave }: ProjectAssignmentModalProps) {
  const { isDarkMode } = useTheme();
  const [hasAllProjects, setHasAllProjects] = useState(user.hasAllProjects);
  const [projectAssignments, setProjectAssignments] = useState<ProjectAssignment[]>(
    user.projectAssignments || [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(user.id, { projectAssignments, hasAllProjects });
  };

  const handleAllProjectsToggle = (checked: boolean) => {
    setHasAllProjects(checked);
    if (checked) setProjectAssignments([]);
  };

  const handleProjectToggle = (projectId: string, checked: boolean) => {
    if (checked) {
      setProjectAssignments([
        ...projectAssignments,
        {
          projectId,
          permissions: { canView: true, canEdit: false, editableSections: [] },
        },
      ]);
    } else {
      setProjectAssignments(projectAssignments.filter((a) => a.projectId !== projectId));
    }
  };

  const handlePermissionChange = (projectId: string, canEdit: boolean) => {
    setProjectAssignments(
      projectAssignments.map((assignment) =>
        assignment.projectId === projectId
          ? {
              ...assignment,
              permissions: {
                ...assignment.permissions,
                canEdit,
                editableSections: canEdit ? assignment.permissions.editableSections : [],
              },
            }
          : assignment,
      ),
    );
  };

  const handleSectionToggle = (projectId: string, sectionId: string, checked: boolean) => {
    setProjectAssignments(
      projectAssignments.map((assignment) =>
        assignment.projectId === projectId
          ? {
              ...assignment,
              permissions: {
                ...assignment.permissions,
                editableSections: checked
                  ? [...assignment.permissions.editableSections, sectionId as any]
                  : assignment.permissions.editableSections.filter((s) => s !== sectionId),
              },
            }
          : assignment,
      ),
    );
  };

  const getProjectAssignment = (projectId: string) =>
    projectAssignments.find((a) => a.projectId === projectId);
  const isProjectAssigned = (projectId: string) =>
    projectAssignments.some((a) => a.projectId === projectId);

  const checkboxClass =
    'rounded border-gray-300 text-emerald-700 focus:ring-emerald-500 mr-3 h-4 w-4 flex-shrink-0';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className={`rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
          }`}
        >
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Assign Projects to {user.name}
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Configure project access and editing permissions
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div
              className={`p-5 rounded-2xl border-2 border-dashed ${
                hasAllProjects
                  ? isDarkMode
                    ? 'border-emerald-500 bg-emerald-900/20'
                    : 'border-emerald-400 bg-emerald-50'
                  : isDarkMode
                  ? 'border-gray-600 bg-gray-700/40'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAllProjects}
                  onChange={(e) => handleAllProjectsToggle(e.target.checked)}
                  className={`${checkboxClass} h-5 w-5`}
                />
                <div>
                  <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    All Projects Access
                  </span>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Grant access to all current and future projects with full permissions
                  </p>
                </div>
              </label>
            </div>

            {!hasAllProjects && (
              <div>
                <h3 className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Individual Project Assignment
                </h3>

                <div className="space-y-3">
                  {MOCK_PROJECTS.map((project) => {
                    const assignment = getProjectAssignment(project.id);
                    const isAssigned = isProjectAssigned(project.id);

                    return (
                      <div
                        key={project.id}
                        className={`rounded-2xl p-4 ${
                          isDarkMode
                            ? isAssigned
                              ? 'bg-gray-700/40 border border-emerald-700/40'
                              : 'bg-gray-700/40 border border-gray-700'
                            : isAssigned
                            ? 'bg-emerald-50/60 border border-emerald-200'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={(e) => handleProjectToggle(project.id, e.target.checked)}
                              className={`${checkboxClass} h-5 w-5`}
                            />
                            <span
                              className={`font-medium flex-1 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {project.name}
                            </span>
                          </label>

                          {isAssigned && (
                            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                              <span
                                className={`text-xs px-2.5 py-0.5 rounded-full ${
                                  assignment?.permissions.canView
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}
                              >
                                <Eye className="h-3 w-3 inline mr-1" />
                                Can View
                              </span>
                              {assignment?.permissions.canEdit && (
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                                  <Edit className="h-3 w-3 inline mr-1" />
                                  Can Edit
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {isAssigned && assignment && (
                          <div
                            className={`ml-8 space-y-4 p-4 rounded-2xl ${
                              isDarkMode ? 'bg-gray-800/60' : 'bg-white'
                            }`}
                          >
                            <div>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={assignment.permissions.canEdit}
                                  onChange={(e) => handlePermissionChange(project.id, e.target.checked)}
                                  className={checkboxClass}
                                />
                                <span
                                  className={`font-medium text-sm ${
                                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                  }`}
                                >
                                  Allow Editing
                                </span>
                              </label>
                            </div>

                            {assignment.permissions.canEdit && (
                              <div>
                                <h4
                                  className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}
                                >
                                  Editable Sections
                                </h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                                  {EDITABLE_SECTIONS.map((section) => (
                                    <label
                                      key={section.id}
                                      className="flex items-start cursor-pointer group"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={assignment.permissions.editableSections.includes(
                                          section.id as any,
                                        )}
                                        onChange={(e) =>
                                          handleSectionToggle(project.id, section.id, e.target.checked)
                                        }
                                        className={`${checkboxClass} mt-1`}
                                      />
                                      <div>
                                        <span
                                          className={`text-sm font-medium ${
                                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                          }`}
                                        >
                                          {section.name}
                                        </span>
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                          {section.description}
                                        </p>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-700/40' : 'bg-gray-50'}`}>
              <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Assignment Summary
              </h4>
              <div className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {hasAllProjects ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span>Full access to all projects (current and future)</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span>{projectAssignments.length} projects assigned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      <span>
                        {projectAssignments.filter((a) => a.permissions.canEdit).length} projects with edit permissions
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      <span>
                        {projectAssignments.reduce((total, a) => total + a.permissions.editableSections.length, 0)}{' '}
                        total editable sections
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div
            className={`flex justify-end gap-3 px-6 py-4 border-t shrink-0 ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 shadow-sm transition-colors"
            >
              <Check className="h-4 w-4" />
              Save Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
