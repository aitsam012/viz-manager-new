import React, { useState } from 'react';
import { Plus, HelpCircle, Clock, CheckCircle, AlertCircle, User, Edit, Trash2, X, MessageSquare, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Project, Query } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import Tooltip from '../ui/Tooltip';
import { useTheme } from '../../contexts/ThemeContext';

interface QueriesTabProps {
  project: Project;
  onUpdate: (project: Project) => void;
}

export default function QueriesTab({ project, onUpdate }: QueriesTabProps) {
  const { isDarkMode } = useTheme();
  const [expandedQueries, setExpandedQueries] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuery, setEditingQuery] = useState<Query | null>(null);
  const [editingQueryId, setEditingQueryId] = useState<string | null>(null);
  const [newQuery, setNewQuery] = useState({
    title: '',
    qaItems: [{ id: '1', question: '', answer: '' }],
    linkedSheet: '',
    assignedTo: ''
  });

  const handleAddQuery = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filteredQAItems = newQuery.qaItems.filter(item => 
      item.question.trim() !== '' || item.answer.trim() !== ''
    );

    if (filteredQAItems.length === 0) {
      alert('Please add at least one question or answer.');
      return;
    }

    if (editingQuery) {
      // Update existing query
      const updatedProject = {
        ...project,
        queries: project.queries.map(q => 
          q.id === editingQuery.id 
            ? { 
                ...editingQuery, 
                ...newQuery,
                qaItems: filteredQAItems,
                updatedAt: new Date().toISOString()
              }
            : q
        )
      };
      onUpdate(updatedProject);
      setEditingQuery(null);
    } else {
      // Add new query
      const query: Query = {
        id: Date.now().toString(),
        ...newQuery,
        qaItems: filteredQAItems,
        status: 'Open',
        createdAt: new Date().toISOString()
      };

      const updatedProject = {
        ...project,
        queries: [...project.queries, query]
      };
      onUpdate(updatedProject);
    }

    setNewQuery({ title: '', qaItems: [{ id: '1', question: '', answer: '' }], linkedSheet: '', assignedTo: '' });
    setShowAddForm(false);
  };

  const handleStatusChange = (queryId: string, newStatus: Query['status']) => {
    const updatedProject = {
      ...project,
      queries: project.queries.map(q => 
        q.id === queryId ? { ...q, status: newStatus, updatedAt: new Date().toISOString() } : q
      )
    };
    onUpdate(updatedProject);
  };

  const handleDeleteQuery = (queryId: string) => {
    const query = project.queries.find(q => q.id === queryId);
    if (confirm(`Are you sure you want to delete the query "${query?.title}"? This action cannot be undone.`)) {
      const updatedProject = {
        ...project,
        queries: project.queries.filter(q => q.id !== queryId)
      };
      onUpdate(updatedProject);
    }
  };

  const handleEditQuery = (query: Query) => {
    setEditingQuery(query);
    setNewQuery({
      title: query.title,
      qaItems: [...query.qaItems],
      linkedSheet: query.linkedSheet,
      assignedTo: query.assignedTo
    });
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setEditingQuery(null);
    setEditingQueryId(null);
    setNewQuery({ title: '', qaItems: [{ id: '1', question: '', answer: '' }], linkedSheet: '', assignedTo: '' });
    setShowAddForm(false);
  };

  const addQAItem = () => {
    setNewQuery(prev => ({
      ...prev,
      qaItems: [...prev.qaItems, { id: Date.now().toString(), question: '', answer: '' }]
    }));
  };

  const removeQAItem = (itemId: string) => {
    if (newQuery.qaItems.length > 1) {
      setNewQuery(prev => ({
        ...prev,
        qaItems: prev.qaItems.filter(item => item.id !== itemId)
      }));
    }
  };

  const updateQAItem = (itemId: string, field: 'question' | 'answer', value: string) => {
    setNewQuery(prev => ({
      ...prev,
      qaItems: prev.qaItems.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const toggleQueryExpansion = (queryId: string) => {
    const newExpanded = new Set(expandedQueries);
    if (newExpanded.has(queryId)) {
      newExpanded.delete(queryId);
    } else {
      newExpanded.add(queryId);
    }
    setExpandedQueries(newExpanded);
  };

  const formatText = (text: string) => {
    if (!text) return null;

    // Split text into lines and process each line
    const lines = text.split('\n');
    const formattedLines = lines.map((line, index) => {
      // Handle bullet points (lines starting with -, *, or •)
      if (line.trim().match(/^[-*•]\s/)) {
        const bulletText = line.trim().substring(2);
        return (
          <div key={index} className="flex items-start gap-2 mb-1">
            <span className="text-blue-600 mt-1 text-sm">•</span>
            <span className="flex-1">{formatInlineText(bulletText)}</span>
          </div>
        );
      }
      
      // Handle numbered lists (lines starting with numbers)
      if (line.trim().match(/^\d+\.\s/)) {
        const match = line.trim().match(/^(\d+)\.\s(.+)/);
        if (match) {
          return (
            <div key={index} className="flex items-start gap-2 mb-1">
              <span className="text-blue-600 mt-1 text-sm font-medium">{match[1]}.</span>
              <span className="flex-1">{formatInlineText(match[2])}</span>
            </div>
          );
        }
      }
      
      // Handle empty lines as spacing
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      
      // Regular text lines
      return (
        <div key={index} className="mb-1">
          {formatInlineText(line)}
        </div>
      );
    });

    return <div>{formattedLines}</div>;
  };

  const formatInlineText = (text: string) => {
    // Handle URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1"
          >
            {part.length > 50 ? `${part.substring(0, 50)}...` : part}
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      }
      
      // Handle bold text **text**
      if (part.includes('**')) {
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((boldPart, boldIndex) => {
          if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
            return (
              <strong key={`${index}-${boldIndex}`} className="font-semibold">
                {boldPart.slice(2, -2)}
              </strong>
            );
          }
          return boldPart;
        });
      }
      
      return part;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <HelpCircle className="h-5 w-5 text-red-600" />;
      case 'In Progress':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'Resolved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Client Queries</h2>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track and manage client questions and responses</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Query
        </button>
      </div>

      {/* Query Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-lg shadow-sm border transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Open</p>
              <p className="text-2xl font-bold text-red-600">
                {project.queries.filter(q => q.status === 'Open').length}
              </p>
            </div>
            <HelpCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-sm border transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {project.queries.filter(q => q.status === 'In Progress').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-sm border transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Resolved</p>
              <p className="text-2xl font-bold text-green-600">
                {project.queries.filter(q => q.status === 'Resolved').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Add/Edit Query Form */}
      {showAddForm && (
        <div className={`rounded-lg shadow-sm border p-6 transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {editingQuery ? 'Edit Query' : 'Add New Query'}
            </h3>
            <button
              onClick={handleCancelEdit}
              className={`transition-colors ${
                isDarkMode 
                  ? 'text-gray-500 hover:text-gray-300' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleAddQuery} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Query Title *</label>
              <input
                type="text"
                required
                value={newQuery.title}
                onChange={(e) => setNewQuery(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Brief title for this query thread..."
              />
            </div>

            {/* Questions and Answers */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Questions & Answers</label>
                <button
                  type="button"
                  onClick={addQAItem}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    isDarkMode 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  Add Q&A
                </button>
              </div>
              
              <div className="space-y-4">
                {newQuery.qaItems.map((item, index) => (
                  <div key={item.id} className={`border rounded-lg p-4 transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Q&A #{index + 1}</span>
                      {newQuery.qaItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQAItem(item.id)}
                          className={`transition-colors ${
                            isDarkMode 
                              ? 'text-red-400 hover:text-red-300' 
                              : 'text-red-600 hover:text-red-700'
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Question</label>
                        <textarea
                          value={item.question}
                          onChange={(e) => updateQAItem(item.id, 'question', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          rows={4}
                          placeholder="Enter the client question... 

Formatting tips:
- Use bullet points with -, *, or •
- Use numbered lists: 1. Item one
- Add **bold text** with double asterisks
- Include clickable links: https://example.com
- Use empty lines for spacing"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Answer</label>
                        <textarea
                          value={item.answer}
                          onChange={(e) => updateQAItem(item.id, 'answer', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          rows={4}
                          placeholder="Enter your response...

Formatting tips:
- Use bullet points with -, *, or •
- Use numbered lists: 1. Item one
- Add **bold text** with double asterisks
- Include clickable links: https://example.com
- Use empty lines for spacing"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Linked Sheet</label>
                <input
                  type="text"
                  value={newQuery.linkedSheet}
                  onChange={(e) => setNewQuery(prev => ({ ...prev, linkedSheet: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="e.g., Content Strategy Sheet, Row 15"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Assign To</label>
                <select
                  value={newQuery.assignedTo}
                  onChange={(e) => setNewQuery(prev => ({ ...prev, assignedTo: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select team member</option>
                  {project.teamMembers.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`flex justify-end gap-3 pt-4 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
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
                {editingQuery ? 'Update Query' : 'Add Query'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Queries List */}
      <div className="space-y-6">
        {project.queries.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            title="No Queries Yet"
            description="Start tracking client questions and responses."
            action={{ label: "Add First Query", onClick: () => setShowAddForm(true), icon: Plus }}
          />
        ) : (
          project.queries
            .sort((a, b) => {
              const statusOrder = { 'Open': 0, 'In Progress': 1, 'Resolved': 2 };
              return statusOrder[a.status] - statusOrder[b.status];
            })
            .map((query) => (
              <div key={query.id} className={`card card-hover overflow-hidden transition-all duration-200 hover-lift ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                {/* Query Header */}
                <div className={`px-6 py-4 border-b transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleQueryExpansion(query.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg shadow-sm ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                      }`}>
                        {getStatusIcon(query.status)}
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{query.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <StatusBadge status={query.status} size="sm" />
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <MessageSquare className="h-3 w-3 inline mr-1" />
                            {query.qaItems.length} Q&A items
                          </span>
                          <button className={`text-sm flex items-center gap-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {expandedQueries.has(query.id) ? (
                              <>
                                <ChevronUp className="h-4 w-4" />
                                Collapse
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4" />
                                Expand
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Tooltip content="Edit query">
                      <button
                        onClick={() => handleEditQuery(query)}
                        className={`p-2 rounded-lg transition-all duration-200 hover-lift ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700' 
                            : 'text-gray-600 hover:text-blue-600 hover:bg-white'
                        }`}
                        title="Edit query"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      </Tooltip>
                      <div className="relative">
                        <select
                          value={query.status}
                          onChange={(e) => handleStatusChange(query.id, e.target.value as Query['status'])}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                      <Tooltip content="Delete query">
                      <button 
                        onClick={() => handleDeleteQuery(query.id)}
                        className={`p-2 rounded-lg transition-all duration-200 hover-lift ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' 
                            : 'text-gray-600 hover:text-red-600 hover:bg-white'
                        }`}
                        title="Delete query"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      </Tooltip>
                    </div>
                  </div>
                  
                  {/* Query Metadata */}
                  <div className={`flex flex-wrap gap-4 text-sm mt-3 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {query.createdAt && (
                      <span>Created {new Date(query.createdAt).toLocaleDateString()}</span>
                    )}
                    {query.updatedAt && (
                      <span>Updated {new Date(query.updatedAt).toLocaleDateString()}</span>
                    )}
                    {query.linkedSheet && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">📊 {query.linkedSheet}</span>
                    )}
                    {query.assignedTo && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {query.assignedTo}
                      </span>
                    )}
                  </div>
                </div>

                {/* Q&A Items - Only show when expanded */}
                {expandedQueries.has(query.id) && (
                  <div className="p-6 space-y-4">
                  {query.qaItems.map((item, index) => (
                    <div key={item.id} className={`border rounded-lg p-4 transition-all duration-200 hover-lift ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="space-y-3">
                        {item.question && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-600">Q</span>
                              </div>
                              <span className={`text-sm font-medium ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>Question {index + 1}</span>
                            </div>
                            <div className={`w-full rounded-lg border p-3 transition-colors ${
                              isDarkMode 
                                ? 'text-gray-200 bg-gray-800 border-gray-600' 
                                : 'text-gray-800 bg-white border-gray-200'
                            }`}>
                              {formatText(item.question)}
                            </div>
                          </div>
                        )}
                        {item.answer && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-green-600">A</span>
                              </div>
                              <span className={`text-sm font-medium ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>Answer {index + 1}</span>
                            </div>
                            <div className={`w-full rounded-lg border p-3 transition-colors ${
                              isDarkMode 
                                ? 'text-gray-200 bg-gray-800 border-gray-600' 
                                : 'text-gray-800 bg-white border-gray-200'
                            }`}>
                              {formatText(item.answer)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                )}

                {/* Collapsed Preview - Show first Q&A when collapsed */}
                {!expandedQueries.has(query.id) && query.qaItems.length > 0 && (
                  <div className="p-6 border-t">
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">Q</span>
                        </div>
                        <span className="font-medium">Preview:</span>
                      </div>
                      <div className="ml-6">
                        {query.qaItems[0].question ? (
                          <p className="line-clamp-2">
                            {query.qaItems[0].question.length > 100 
                              ? `${query.qaItems[0].question.substring(0, 100)}...`
                              : query.qaItems[0].question
                            }
                          </p>
                        ) : (
                          <p className="italic">No question text</p>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleQueryExpansion(query.id);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-xs mt-1 flex items-center gap-1"
                        >
                          Click to expand full query
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
}