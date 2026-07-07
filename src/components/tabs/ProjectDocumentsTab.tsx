import React, { useState } from 'react';
import { Plus, FileText, ExternalLink, FolderOpen, Link, Trash2, Edit, BarChart3 } from 'lucide-react';
import { Project, ProjectDocument } from '../../types';
import EmptyState from '../ui/EmptyState';
import Tooltip from '../ui/Tooltip';
import { useTheme } from '../../contexts/ThemeContext';

interface ProjectDocumentsTabProps {
  project: Project;
  onUpdate: (project: Project) => void;
}

export default function ProjectDocumentsTab({ project, onUpdate }: ProjectDocumentsTabProps) {
  const { isDarkMode } = useTheme();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ProjectDocument | null>(null);
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'google-sheet' as ProjectDocument['type'],
    url: '',
    category: '',
    description: ''
  });

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDocument) {
      // Update existing document
      const updatedProject = {
        ...project,
        documents: project.documents.map(d => 
          d.id === editingDocument.id 
            ? { ...editingDocument, ...newDocument }
            : d
        )
      };
      onUpdate(updatedProject);
      setEditingDocument(null);
    } else {
      // Add new document
      const document: ProjectDocument = {
        id: Date.now().toString(),
        ...newDocument,
        uploadDate: new Date().toISOString().split('T')[0]
      };

      const updatedProject = {
        ...project,
        documents: [...project.documents, document]
      };
      onUpdate(updatedProject);
    }

    setNewDocument({ name: '', type: 'google-sheet', url: '', category: '', description: '' });
    setShowAddForm(false);
  };

  const handleDeleteDocument = (documentId: string) => {
    const document = project.documents.find(d => d.id === documentId);
    if (confirm(`Are you sure you want to delete "${document?.name}"? This action cannot be undone.`)) {
      const updatedProject = {
        ...project,
        documents: project.documents.filter(d => d.id !== documentId)
      };
      onUpdate(updatedProject);
    }
  };

  const handleEditDocument = (document: ProjectDocument) => {
    setEditingDocument(document);
    setNewDocument({
      name: document.name,
      type: document.type,
      url: document.url,
      category: document.category,
      description: document.description || ''
    });
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setEditingDocument(null);
    setNewDocument({ name: '', type: 'google-sheet', url: '', category: '', description: '' });
    setShowAddForm(false);
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'progress-report':
        return <FileText className="h-8 w-8 text-orange-600" />;
      case 'google-sheet':
        return <FileText className="h-8 w-8 text-green-600" />;
      case 'looker-studio':
        return <BarChart3 className="h-8 w-8 text-blue-600" />;
      case 'internal-doc':
        return <FileText className="h-8 w-8 text-purple-600" />;
      default:
        return <FileText className="h-8 w-8 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'progress-report':
        return 'bg-orange-100 text-orange-800';
      case 'google-sheet':
        return 'bg-green-100 text-green-800';
      case 'looker-studio':
        return 'bg-blue-100 text-blue-800';
      case 'internal-doc':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'progress-report':
        return 'Progress Report';
      case 'google-sheet':
        return 'Google Sheet';
      case 'looker-studio':
        return 'Looker Studio';
      case 'internal-doc':
        return 'Internal Document';
      default:
        return 'Document';
    }
  };

  const documentsByType = {
    'progress-report': project.documents.filter(d => d.type === 'progress-report'),
    'google-sheet': project.documents.filter(d => d.type === 'google-sheet'),
    'looker-studio': project.documents.filter(d => d.type === 'looker-studio'),
    'internal-doc': project.documents.filter(d => d.type === 'internal-doc')
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Project Documents</h2>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage Google Sheets, client documents, and internal files</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Document
        </button>
      </div>

      {/* Document Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-lg shadow-sm border transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progress Reports</p>
              <p className="text-2xl font-bold text-orange-600">{documentsByType['progress-report'].length}</p>
            </div>
            <FileText className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-sm border transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Google Sheets</p>
              <p className="text-2xl font-bold text-green-600">{documentsByType['google-sheet'].length}</p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-sm border transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Looker Studio</p>
              <p className="text-2xl font-bold text-blue-600">{documentsByType['looker-studio'].length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-sm border transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Internal Docs</p>
              <p className="text-2xl font-bold text-purple-600">{documentsByType['internal-doc'].length}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Quick Add Sections */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`rounded-lg shadow-sm border p-6 transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="text-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${
              isDarkMode ? 'bg-orange-900' : 'bg-orange-100'
            }`}>
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Progress Reports</h3>
            <p className={`mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Upload monthly progress presentations (PPT)</p>
            <button 
              onClick={() => {
                setNewDocument(prev => ({ ...prev, type: 'progress-report' }));
                setShowAddForm(true);
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover-lift border-2 border-dashed ${
                isDarkMode 
                  ? 'bg-orange-900/30 text-orange-400 border-orange-600 hover:bg-orange-900/50' 
                  : 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100'
              }`}
            >
              <Link className="h-4 w-4" />
              Add Progress Report
            </button>
          </div>
        </div>

        <div className={`rounded-lg shadow-sm border p-6 transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="text-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${
              isDarkMode ? 'bg-green-900' : 'bg-green-100'
            }`}>
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Google Sheets</h3>
            <p className={`mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Link to Google Sheets for real-time collaboration</p>
            <button 
              onClick={() => {
                setNewDocument(prev => ({ ...prev, type: 'google-sheet' }));
                setShowAddForm(true);
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover-lift border-2 border-dashed ${
                isDarkMode 
                  ? 'bg-green-900/30 text-green-400 border-green-600 hover:bg-green-900/50' 
                  : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
              }`}
            >
              <Link className="h-4 w-4" />
              Add Google Sheet
            </button>
          </div>
        </div>

        <div className={`rounded-lg shadow-sm border p-6 transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="text-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${
              isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
            }`}>
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Looker Studio Reports</h3>
            <p className={`mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Link to Looker Studio dashboards and reports</p>
            <button 
              onClick={() => {
                setNewDocument(prev => ({ ...prev, type: 'looker-studio' }));
                setShowAddForm(true);
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover-lift border-2 border-dashed ${
                isDarkMode 
                  ? 'bg-blue-900/30 text-blue-400 border-blue-600 hover:bg-blue-900/50' 
                  : 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
              }`}
            >
              <Link className="h-4 w-4" />
              Add Looker Report
            </button>
          </div>
        </div>

        <div className={`rounded-lg shadow-sm border p-6 transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="text-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${
              isDarkMode ? 'bg-purple-900' : 'bg-purple-100'
            }`}>
              <FolderOpen className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Internal Documents</h3>
            <p className={`mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Link to internal working documents and reports</p>
            <button 
              onClick={() => {
                setNewDocument(prev => ({ ...prev, type: 'internal-doc' }));
                setShowAddForm(true);
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover-lift border-2 border-dashed ${
                isDarkMode 
                  ? 'bg-purple-900/30 text-purple-400 border-purple-600 hover:bg-purple-900/50' 
                  : 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100'
              }`}
            >
              <Link className="h-4 w-4" />
              Add Internal Doc
            </button>
          </div>
        </div>
      </div>

      {/* Add Document Form */}
      {showAddForm && (
        <div className={`rounded-lg shadow-sm border p-6 transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {editingDocument ? 'Edit Document' : 'Add New Document'}
          </h3>
          <form onSubmit={handleAddDocument} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Document Name *</label>
                <input
                  type="text"
                  required
                  value={newDocument.name}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="e.g., SEO Tracking Sheet, Client Analytics"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Document Type</label>
                <select
                  value={newDocument.type}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value as ProjectDocument['type'] }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="progress-report">Progress Report</option>
                  <option value="google-sheet">Google Sheet</option>
                  <option value="looker-studio">Looker Studio</option>
                  <option value="internal-doc">Internal Document</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {newDocument.type === 'progress-report' ? 'PowerPoint/Presentation URL *' : 'Document URL *'}
                </label>
                <input
                  type="url"
                  required
                  value={newDocument.url}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, url: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder={
                    newDocument.type === 'progress-report' 
                      ? "https://docs.google.com/presentation/d/..." 
                      : newDocument.type === 'looker-studio'
                      ? "https://lookerstudio.google.com/reporting/..."
                      : "https://docs.google.com/spreadsheets/d/..."
                  }
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Category</label>
                <input
                  type="text"
                  value={newDocument.category}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder={
                    newDocument.type === 'progress-report' 
                      ? "e.g., January 2024, Q1 Report, Monthly Update" 
                      : newDocument.type === 'looker-studio'
                      ? "e.g., Traffic Dashboard, Conversion Report, SEO Overview"
                      : "e.g., Analytics, Keywords, Backlinks"
                  }
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Description</label>
              <textarea
                value={newDocument.description}
                onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                rows={3}
                placeholder="Brief description of this document..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingDocument ? 'Update Document' : 'Add Document'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents List */}
      <div className={`rounded-lg shadow-sm border transition-colors ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className={`px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>All Documents</h3>
        </div>
        
        {project.documents.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={FolderOpen}
              title="No documents added yet"
              description="Start by adding your first Google Sheet or document link."
              action={{ label: "Add First Document", onClick: () => setShowAddForm(true), icon: Plus }}
            />
          </div>
        ) : (
          <div className={`divide-y ${
            isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
          }`}>
            {project.documents
              .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
              .map((document) => (
                <div key={document.id} className={`p-6 transition-all duration-200 hover-lift ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        {getDocumentIcon(document.type)}
                      </div>
                      <div>
                        <h4 className={`text-lg font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{document.name}</h4>
                        <div className={`flex items-center gap-4 text-sm mt-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(document.type)}`}>
                            {getTypeLabel(document.type)}
                          </span>
                          {document.category && <span>{document.category}</span>}
                          <span>Added {new Date(document.uploadDate).toLocaleDateString()}</span>
                        </div>
                        {document.description && (
                          <p className={`text-sm mt-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>{document.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tooltip content="Open document">
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-lg transition-all duration-200 hover-lift ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/30' 
                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      </Tooltip>
                      <Tooltip content="Edit document">
                      <button 
                        onClick={() => handleEditDocument(document)}
                        className={`p-2 rounded-lg transition-all duration-200 hover-lift ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/30' 
                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Edit document"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      </Tooltip>
                      <Tooltip content="Delete document">
                      <button 
                        onClick={() => handleDeleteDocument(document.id)}
                        className={`p-2 rounded-lg transition-all duration-200 hover-lift ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' 
                            : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}