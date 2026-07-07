import React, { useState } from 'react';
import { X, Settings, Check, Eye, Edit } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { User, ProjectAssignment } from '../../types/user';

interface ProjectAssignmentModalProps {
  user: User;
  onClose: () => void;
  onSave: (userId: string, assignments: { projectAssignments: ProjectAssignment[], hasAllProjects: boolean }) => void;
}

// Mock projects for assignment
const MOCK_PROJECTS = [
  { id: '1', name: 'TechCorp Solutions' },
  { id: '2', name: 'GreenLeaf Organics' },
  { id: '3', name: 'Digital Marketing Pro' },
  { id: '4', name: 'E-commerce Boost' }
];

const EDITABLE_SECTIONS = [
  { id: 'overview', name: 'Overview', description: 'Project summary and basic info' },
  { id: 'goals', name: 'Goals & KPIs', description: 'Project goals and objectives' },
  { id: 'access', name: 'Access Management', description: 'Client access and credentials' },
  { id: 'queries', name: 'Client Queries', description: 'Q&A and client communication' },
  { id: 'documents', name: 'Documents', description: 'Project files and reports' }
];

export default function ProjectAssignmentModal({ user, onClose, onSave }: ProjectAssignmentModalProps) {
  const { isDarkMode } = useTheme();
  const [hasAllProjects, setHasAllProjects] = useState(user.hasAllProjects);
  const [projectAssignments, setProjectAssignments] = useState<ProjectAssignment[]>(
    user.projectAssignments || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(user.id, { projectAssignments, hasAllProjects });
  };

  const handleAllProjectsToggle = (checked: boolean) => {
    setHasAllProjects(checked);
    if (checked) {
      // Clear individual assignments when "All Projects" is enabled
      setProjectAssignments([]);
    }
  };

  const handleProjectToggle = (projectId: string, checked: boolean) => {
    if (checked) {
      // Add project with default permissions
      const newAssignment: ProjectAssignment = {
        projectId,
        permissions: {
          canView: true,
          canEdit: false,
          editableSections: []
        }
      };
      setProjectAssignments([...projectAssignments, newAssignment]);
    } else {
      // Remove project
      setProjectAssignments(projectAssignments.filter(a => a.projectId !== projectId));
    }
  };

  const handlePermissionChange = (projectId: string, canEdit: boolean) => {
    setProjectAssignments(projectAssignments.map(assignment => 
      assignment.projectId === projectId 
        ? { 
            ...assignment, 
            permissions: { 
              ...assignment.permissions, 
              canEdit,
              editableSections: canEdit ? assignment.permissions.editableSections : []
            }
          }
        : assignment
    ));
  };

  const handleSectionToggle = (projectId: string, sectionId: string, checked: boolean) => {
    setProjectAssignments(projectAssignments.map(assignment => 
      assignment.projectId === projectId 
        ? { 
            ...assignment, 
            permissions: { 
              ...assignment.permissions, 
              editableSections: checked 
                ? [...assignment.permissions.editableSections, sectionId as any]
                : assignment.permissions.editableSections.filter(s => s !== sectionId)
            }
          }
        : assignment
    ));
  };

  const getProjectAssignment = (projectId: string) => {
    return projectAssignments.find(a => a.projectId === projectId);
  };

  const isProjectAssigned = (projectId: string) => {
    return projectAssignments.some(a => a.projectId === projectId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`flex items-center justify-between p-4 lg:p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-lg lg:text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Assign Projects to {user.name}
            </h2>
            <p className={`text-sm mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Configure project access and editing permissions
            </p>
          </div>
          <button
            onClick={onClose}
            className={`transition-colors ${
              isDarkMode 
                ? 'text-gray-500 hover:text-gray-300' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-6">
          {/* All Projects Toggle */}
          <div className={`p-4 lg:p-6 rounded-lg border-2 border-dashed ${
            hasAllProjects 
              ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
              : isDarkMode 
                ? 'border-gray-600 bg-gray-700' 
                : 'border-gray-300 bg-gray-50'
          }`}>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasAllProjects}
                onChange={(e) => handleAllProjectsToggle(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3 h-5 w-5 flex-shrink-0"
              />
              <div>
                <span className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  All Projects Access
                </span>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Grant access to all current and future projects with full permissions
                </p>
              </div>
            </label>
          </div>

          {/* Individual Project Assignment - Hide when All Projects is selected */}
          {!hasAllProjects && (
            <div>
              <h3 className={`text-lg font-medium mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Individual Project Assignment
              </h3>
              
              <div className="space-y-4">
                {MOCK_PROJECTS.map((project) => {
                  const assignment = getProjectAssignment(project.id);
                  const isAssigned = isProjectAssigned(project.id);
                  
                  return (
                    <div key={project.id} className={`border rounded-lg p-4 ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      {/* Project Header */}
                      <div className="flex items-center justify-between mb-4">
                        <label className="flex items-center cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={(e) => handleProjectToggle(project.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3 h-5 w-5 flex-shrink-0"
                          />
                          <span className={`font-medium flex-1 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {project.name}
                          </span>
                        </label>
                        
                        {isAssigned && (
                          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              assignment?.permissions.canView 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              <Eye className="h-3 w-3 inline mr-1" />
                              Can View
                            </span>
                            {assignment?.permissions.canEdit && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                <Edit className="h-3 w-3 inline mr-1" />
                                Can Edit
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Permission Settings */}
                      {isAssigned && assignment && (
                        <div className={`ml-8 space-y-4 p-4 rounded-lg ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          {/* Edit Permission Toggle */}
                          <div>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={assignment.permissions.canEdit}
                                onChange={(e) => handlePermissionChange(project.id, e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3 h-4 w-4 flex-shrink-0"
                              />
                              <span className={`font-medium ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Allow Editing
                              </span>
                            </label>
                          </div>

                          {/* Editable Sections */}
                          {assignment.permissions.canEdit && (
                            <div>
                              <h4 className={`text-sm font-medium mb-3 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Editable Sections:
                              </h4>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {EDITABLE_SECTIONS.map((section) => (
                                  <label key={section.id} className="flex items-start cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={assignment.permissions.editableSections.includes(section.id as any)}
                                      onChange={(e) => handleSectionToggle(project.id, section.id, e.target.checked)}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3 mt-1 h-4 w-4 flex-shrink-0"
                                    />
                                    <div>
                                      <span className={`text-sm font-medium ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                      }`}>
                                        {section.name}
                                      </span>
                                      <p className={`text-xs ${
                                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                                      }`}>
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

          {/* Summary */}
          <div className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <h4 className={`text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Assignment Summary:
            </h4>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {hasAllProjects ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Full access to all projects (current and future)</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{projectAssignments.length} projects assigned</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{projectAssignments.filter(a => a.permissions.canEdit).length} projects with edit permissions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{projectAssignments.reduce((total, a) => total + a.permissions.editableSections.length, 0)} total editable sections</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`flex flex-col lg:flex-row justify-end gap-3 pt-6 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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