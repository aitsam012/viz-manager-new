import React, { useState } from 'react';
import { Plus, Key, CheckCircle, Clock, XCircle, Edit, Trash2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Project, AccessItem } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import Tooltip from '../ui/Tooltip';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface AccessTabProps {
  project: Project;
  onUpdate: (project: Project) => void;
}

export default function AccessTab({ project, onUpdate }: AccessTabProps) {
  const { isDarkMode } = useTheme();
  const { user: currentUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccess, setEditingAccess] = useState<AccessItem | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showWebsitePassword, setShowWebsitePassword] = useState(false);
  const [showClientPassword, setShowClientPassword] = useState(false);
  const [newAccess, setNewAccess] = useState({
    type: '',
    dateGranted: '',
    status: 'Active' as AccessItem['status'],
    websiteCredentials: { email: '', password: '' },
    clientEmail: { email: '', password: '' },
    notes: '',
    email: ''
  });

  const handleAddAccess = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAccess && editingIndex !== null) {
      // Update existing access
      const updatedProject = {
        ...project,
        accessGranted: project.accessGranted.map((access, index) => 
          index === editingIndex 
            ? { ...newAccess, dateGranted: newAccess.dateGranted || new Date().toISOString().split('T')[0] }
            : access
        )
      };
      onUpdate(updatedProject);
      setEditingAccess(null);
      setEditingIndex(null);
    } else {
      // Add new access
      const accessItem: AccessItem = {
        ...newAccess,
        dateGranted: newAccess.dateGranted || new Date().toISOString().split('T')[0]
      };

      const updatedProject = {
        ...project,
        accessGranted: [...project.accessGranted, accessItem]
      };
      onUpdate(updatedProject);
    }

    setNewAccess({ 
      type: '', 
      dateGranted: '', 
      status: 'Active', 
      websiteCredentials: { email: '', password: '' },
      clientEmail: { email: '', password: '' },
      notes: '',
      email: ''
    });
    setShowAddForm(false);
  };

  const handleEditAccess = (access: AccessItem, index: number) => {
    setEditingAccess(access);
    setEditingIndex(index);
    setNewAccess({
      type: access.type,
      dateGranted: access.dateGranted,
      status: access.status,
      websiteCredentials: access.websiteCredentials || { email: '', password: '' },
      clientEmail: access.clientEmail || { email: '', password: '' },
      notes: access.notes || '',
      email: access.email || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteAccess = (index: number, accessType: string) => {
    if (confirm(`Are you sure you want to remove access to "${accessType}"? This action cannot be undone.`)) {
      const updatedProject = {
        ...project,
        accessGranted: project.accessGranted.filter((_, i) => i !== index)
      };
      onUpdate(updatedProject);
    }
  };
  const handleCancelEdit = () => {
    setEditingAccess(null);
    setEditingIndex(null);
    setNewAccess({ 
      type: '', 
      dateGranted: '', 
      status: 'Active', 
      websiteCredentials: { email: '', password: '' },
      clientEmail: { email: '', password: '' },
      notes: '',
      email: ''
    });
    setShowAddForm(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'Revoked':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Revoked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Access Management</h2>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track and manage client-granted access to various platforms</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Access
        </button>
      </div>

      {/* Access Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-lg shadow-sm border transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Access</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{project.accessGranted.length}</p>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
            }`}>
              <Key className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-sm border transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active</p>
              <p className="text-2xl font-bold text-green-600">
                {project.accessGranted.filter(a => a.status === 'Active').length}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              isDarkMode ? 'bg-green-900' : 'bg-green-100'
            }`}>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-sm border transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {project.accessGranted.filter(a => a.status === 'Pending').length}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100'
            }`}>
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Access Form */}
      {showAddForm && (
        <div className={`rounded-lg shadow-sm border p-6 transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {editingAccess ? 'Edit Access' : 'Add New Access'}
          </h3>
          <form onSubmit={handleAddAccess} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Access Type *</label>
                <input
                  type="text"
                  required
                  value={newAccess.type}
                  onChange={(e) => setNewAccess(prev => ({ ...prev, type: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="e.g., Google Search Console, Google Analytics"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Date Granted</label>
                <input
                  type="date"
                  value={newAccess.dateGranted}
                  onChange={(e) => setNewAccess(prev => ({ ...prev, dateGranted: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Status</label>
                <select
                  value={newAccess.status}
                  onChange={(e) => setNewAccess(prev => ({ ...prev, status: e.target.value as AccessItem['status'] }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Revoked">Revoked</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Access Email</label>
                <input
                  type="email"
                  value={newAccess.email}
                  onChange={(e) => setNewAccess(prev => ({ 
                    ...prev, 
                    email: e.target.value 
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Email address for this access (optional)"
                />
              </div>
            </div>
            
            {/* Website Credentials Section - Admin Only */}
            {currentUser?.role === 'admin' && (
              <div className={`p-4 rounded-lg border-2 border-dashed ${
                isDarkMode 
                  ? 'border-blue-600 bg-blue-900/20' 
                  : 'border-blue-300 bg-blue-50'
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <Key className="h-5 w-5 text-blue-600" />
                  <h4 className={`text-sm font-semibold ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    Website Credentials (Optional)
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Email</label>
                    <input
                      type="email"
                      value={newAccess.websiteCredentials?.email || ''}
                      onChange={(e) => setNewAccess(prev => ({ 
                        ...prev, 
                        websiteCredentials: { 
                          ...prev.websiteCredentials, 
                          email: e.target.value 
                        } 
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Website login email"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Password</label>
                    <input
                      type="password"
                      value={newAccess.websiteCredentials?.password || ''}
                      onChange={(e) => setNewAccess(prev => ({ 
                        ...prev, 
                        websiteCredentials: { 
                          ...prev.websiteCredentials, 
                          password: e.target.value 
                        } 
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Website login password"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Client Email Section - Admin Only */}
            {currentUser?.role === 'admin' && (
              <div className={`p-4 rounded-lg border-2 border-dashed ${
                isDarkMode 
                  ? 'border-green-600 bg-green-900/20' 
                  : 'border-green-300 bg-green-50'
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-green-600" />
                  <h4 className={`text-sm font-semibold ${
                    isDarkMode ? 'text-green-300' : 'text-green-800'
                  }`}>
                    Client Email (Optional)
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Email</label>
                    <input
                      type="email"
                      value={newAccess.clientEmail?.email || ''}
                      onChange={(e) => setNewAccess(prev => ({ 
                        ...prev, 
                        clientEmail: { 
                          ...prev.clientEmail, 
                          email: e.target.value 
                        } 
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Client email address"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Password</label>
                    <input
                      type="password"
                      value={newAccess.clientEmail?.password || ''}
                      onChange={(e) => setNewAccess(prev => ({ 
                        ...prev, 
                        clientEmail: { 
                          ...prev.clientEmail, 
                          password: e.target.value 
                        } 
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Client email password"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Notes</label>
              <textarea
                value={newAccess.notes}
                onChange={(e) => setNewAccess(prev => ({ ...prev, notes: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                rows={3}
                placeholder="Additional notes about this access..."
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
                {editingAccess ? 'Update Access' : 'Add Access'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Access List */}
      <div className="space-y-4">
        {project.accessGranted.length === 0 ? (
          <EmptyState
            icon={Key}
            title="No Access Granted Yet"
            description="Start tracking client-granted access to various platforms and tools."
            action={{ label: "Add First Access", onClick: () => setShowAddForm(true), icon: Plus }}
          />
        ) : (
          project.accessGranted.map((access, index) => (
            <div key={index} className={`card card-hover p-6 transition-all duration-200 hover-lift ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${
                    isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                  }`}>
                    {getStatusIcon(access.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{access.type}</h3>
                      <StatusBadge status={access.status} size="sm" />
                    </div>
                    <p className={`text-sm mb-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Granted on {new Date(access.dateGranted).toLocaleDateString()}
                    </p>
                    {access.notes && (
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{access.notes}</p>
                    )}
                    
                    {/* Admin-only credential display */}
                    {currentUser?.role === 'admin' && (
                      <div className="mt-4 space-y-3">
                        {/* Website Credentials */}
                        {(access.websiteCredentials?.email || access.websiteCredentials?.password) && (
                          <div className={`p-3 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-blue-900/30 border-blue-700' 
                              : 'bg-blue-50 border-blue-200'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Lock className="h-4 w-4 text-blue-600" />
                              <span className={`text-sm font-medium ${
                                isDarkMode ? 'text-blue-300' : 'text-blue-800'
                              }`}>
                                Website Credentials
                              </span>
                            </div>
                            <div className="space-y-2 text-sm">
                              {access.websiteCredentials?.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3 text-gray-500" />
                                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                    {access.websiteCredentials.email}
                                  </span>
                                </div>
                              )}
                              {access.websiteCredentials?.password && (
                                <div className="flex items-center gap-2">
                                  <Lock className="h-3 w-3 text-gray-500" />
                                  <span className={`font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {showWebsitePassword ? access.websiteCredentials.password : '•'.repeat(access.websiteCredentials.password.length)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setShowWebsitePassword(!showWebsitePassword)}
                                    className={`ml-2 p-1 rounded transition-colors ${
                                      isDarkMode 
                                        ? 'text-gray-400 hover:text-gray-300' 
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                  >
                                    {showWebsitePassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Client Email */}
                        {(access.clientEmail?.email || access.clientEmail?.password) && (
                          <div className={`p-3 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-green-900/30 border-green-700' 
                              : 'bg-green-50 border-green-200'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Mail className="h-4 w-4 text-green-600" />
                              <span className={`text-sm font-medium ${
                                isDarkMode ? 'text-green-300' : 'text-green-800'
                              }`}>
                                Client Email
                              </span>
                            </div>
                            <div className="space-y-2 text-sm">
                              {access.clientEmail?.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3 text-gray-500" />
                                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                    {access.clientEmail.email}
                                  </span>
                                </div>
                              )}
                              {access.clientEmail?.password && (
                                <div className="flex items-center gap-2">
                                  <Lock className="h-3 w-3 text-gray-500" />
                                  <span className={`font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {showClientPassword ? access.clientEmail.password : '•'.repeat(access.clientEmail.password.length)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setShowClientPassword(!showClientPassword)}
                                    className={`ml-2 p-1 rounded transition-colors ${
                                      isDarkMode 
                                        ? 'text-gray-400 hover:text-gray-300' 
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                  >
                                    {showClientPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* General Access Email - For other access types */}
                        {access.email && (
                          <div className={`p-3 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-purple-900/30 border-purple-700' 
                              : 'bg-purple-50 border-purple-200'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Mail className="h-4 w-4 text-purple-600" />
                              <span className={`text-sm font-medium ${
                                isDarkMode ? 'text-purple-300' : 'text-purple-800'
                              }`}>
                                Access Email
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-gray-500" />
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                {access.email}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Non-admin users see locked message */}
                    {currentUser?.role !== 'admin' && (
                      <div className={`mt-4 p-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-gray-100 border-gray-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-gray-500" />
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Credential details are restricted to administrators
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Tooltip content="Edit access">
                    <button 
                      onClick={() => handleEditAccess(access, index)}
                      className={`p-2 rounded-lg transition-all duration-200 hover-lift ${
                        isDarkMode 
                          ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/30' 
                          : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Remove access">
                    <button 
                      onClick={() => handleDeleteAccess(index, access.type)}
                      className={`p-2 rounded-lg transition-all duration-200 hover-lift ${
                        isDarkMode 
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30' 
                          : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}