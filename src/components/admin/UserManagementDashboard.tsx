import { useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, Search, UserPlus, Mail, Eye, EyeOff, Settings, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_USERS, User } from '../../types/user';
import RoleBadge from '../ui/RoleBadge';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import ProjectAssignmentModal from './ProjectAssignmentModal';
import MetricCard from '../ui/MetricCard';

interface UserManagementDashboardProps {
  onBack: () => void;
}

export default function UserManagementDashboard(_: UserManagementDashboardProps) {
  const { isDarkMode } = useTheme();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [assigningUser, setAssigningUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      avatar: userData.name.split(' ').map((n) => n[0]).join(''),
    };
    setUsers([...users, newUser]);
  };

  const handleEditUser = (userData: User) => {
    setUsers(users.map((u) => (u.id === userData.id ? userData : u)));
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user && confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      setUsers(users.filter((u) => u.id !== userId));
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)));
  };

  const handleUpdateProjectAssignments = (userId: string, assignments: any) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, ...assignments } : u)));
    setAssigningUser(null);
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    admins: users.filter((u) => u.role === 'admin').length,
    managers: users.filter((u) => u.role === 'manager').length,
  };

  return (
    <div className={`rounded-3xl p-6 md:p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className={`text-4xl font-bold tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Team
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Manage users, roles, and project assignments.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 shadow-sm hover:shadow transition-all"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Users" value={stats.total} variant="highlight" subtitle="All registered team members" />
        <MetricCard title="Active Users" value={stats.active} subtitle="Currently active" />
        <MetricCard title="Administrators" value={stats.admins} subtitle="Full access users" />
        <MetricCard title="Managers" value={stats.managers} subtitle="Project managers" />
      </div>

      {/* Search & Filter */}
      <div className={`rounded-2xl p-4 mb-6 ${isDarkMode ? 'bg-gray-700/40' : 'bg-gray-50'}`}>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-11 pr-4 py-2.5 rounded-full text-sm outline-none transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 text-white placeholder-gray-400'
                  : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200'
              }`}
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={`px-4 py-2.5 rounded-full text-sm outline-none transition-colors ${
              isDarkMode
                ? 'bg-gray-800 text-white border border-gray-700'
                : 'bg-white text-gray-900 border border-gray-200'
            }`}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-700/40' : 'bg-gray-50'}`}>
        <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Users ({filteredUsers.length})
          </h3>
        </div>

        <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`p-5 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-white'}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 mb-1">
                      <h4 className={`text-base font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <RoleBadge role={user.role} size="sm" />
                        {!user.isActive && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 text-xs font-medium rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <span className="hidden lg:inline">·</span>
                      <span>
                        {user.hasAllProjects ? 'All projects' : `${user.projectAssignments.length} projects`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 justify-end">
                  <button
                    onClick={() => setAssigningUser(user)}
                    className={`p-2 rounded-full transition-colors ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/30'
                        : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50'
                    }`}
                    title="Assign projects"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleUserStatus(user.id)}
                    className={`p-2 rounded-full transition-colors ${
                      isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    title={user.isActive ? 'Deactivate user' : 'Activate user'}
                  >
                    {user.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setEditingUser(user)}
                    className={`p-2 rounded-full transition-colors ${
                      isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    title="Edit user"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className={`p-2 rounded-full transition-colors ${
                        isDarkMode
                          ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30'
                          : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 mb-3">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <p className={`text-base font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                No users match your search
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onAdd={handleAddUser} />}
      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleEditUser} />}
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
