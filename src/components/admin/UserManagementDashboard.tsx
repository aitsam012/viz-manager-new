import React, { useState } from 'react';
import { ArrowLeft, Plus, Users, Shield, Edit, Trash2, Search, Filter, UserPlus, Mail, Eye, EyeOff, Settings } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_USERS, PERMISSION_LEVELS, User } from '../../types/user';
import RoleBadge from '../ui/RoleBadge';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import ProjectAssignmentModal from './ProjectAssignmentModal';
import MetricCard from '../ui/MetricCard';

interface UserManagementDashboardProps {
  onBack: () => void;
}

export default function UserManagementDashboard({ onBack }: UserManagementDashboardProps) {
  const { isDarkMode } = useTheme();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [assigningUser, setAssigningUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      avatar: userData.name.split(' ').map(n => n[0]).join('')
    };
    setUsers([...users, newUser]);
  };

  const handleEditUser = (userData: User) => {
    setUsers(users.map(u => u.id === userData.id ? userData : u));
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
  };

  const handleUpdateProjectAssignments = (userId: string, assignments: any) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, ...assignments } : u
    ));
    setAssigningUser(null);
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length
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
          <div className="flex items-center justify-between py-4 lg:py-6">
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
                <span className="hidden sm:inline">Back to Projects</span>
                <span className="sm:hidden">Back</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add User</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          <div className="pb-4 lg:pb-6">
            <h1 className={`text-xl lg:text-2xl xl:text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              User Management
            </h1>
            <p className={`text-sm lg:text-base ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage users, roles, and project assignments
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 xl:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <MetricCard
            title="Total Users"
            value={stats.total}
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Active Users"
            value={stats.active}
            icon={Users}
            color="emerald"
          />
          <MetricCard
            title="Administrators"
            value={stats.admins}
            icon={Shield}
            color="red"
          />
          <MetricCard
            title="Managers"
            value={stats.managers}
            icon={Users}
            color="blue"
          />
        </div>

        {/* Search and Filter */}
        <div className={`rounded-lg shadow-sm border p-4 lg:p-6 mb-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 lg:py-3 rounded-lg border transition-colors text-sm lg:text-base ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                />
              </div>
            </div>
            <div className="lg:w-48">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className={`w-full px-3 py-2 lg:py-3 rounded-lg border transition-colors text-sm lg:text-base ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className={`rounded-lg shadow-sm border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`px-4 lg:px-6 py-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Users ({filteredUsers.length})
            </h3>
          </div>

          <div className={`divide-y ${
            isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
          }`}>
            {filteredUsers.map((user) => (
              <div key={user.id} className={`p-4 lg:p-6 transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm lg:text-base shadow-sm">
                      {user.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 mb-1">
                        <h4 className={`text-base lg:text-lg font-medium truncate ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {user.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <RoleBadge role={user.role} size="sm" />
                          {!user.isActive && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs font-medium rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 text-xs lg:text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <span className="hidden lg:inline">•</span>
                        <span>{user.hasAllProjects ? 'All projects' : `${user.projectAssignments.length} projects`}</span>
                        <span className="hidden lg:inline">•</span>
                        <span>Created {new Date(user.createdAt).toLocaleDateString()}</span>
                        {user.lastLogin && (
                          <>
                            <span className="hidden lg:inline">•</span>
                            <span>Last login {new Date(user.lastLogin).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:gap-3 justify-end">
                    <button
                      onClick={() => setAssigningUser(user)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-purple-400 hover:bg-purple-900/30' 
                          : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                      title="Assign projects"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleToggleUserStatus(user.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.isActive
                          ? isDarkMode 
                            ? 'text-gray-400 hover:text-amber-400 hover:bg-amber-900/30' 
                            : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                          : isDarkMode 
                            ? 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/30' 
                            : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={user.isActive ? 'Deactivate user' : 'Activate user'}
                    >
                      {user.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => setEditingUser(user)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/30' 
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Edit user"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' 
                            : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddUser}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleEditUser}
        />
      )}

      {assigningUser && (
        <ProjectAssignmentModal
          user={assigningUser}
          onClose={() => setAssigningUser(null)}
          onSave={handleUpdateProjectAssignments}
        />
      )}
    </div>
  );
}