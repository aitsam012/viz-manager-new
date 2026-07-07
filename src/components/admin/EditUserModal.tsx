import React, { useState } from 'react';
import { X, Mail, User, Shield } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { User as UserType, PERMISSION_LEVELS } from '../../types/user';
import RoleBadge from '../ui/RoleBadge';

interface EditUserModalProps {
  user: UserType;
  onClose: () => void;
  onSave: (user: UserType) => void;
}

export default function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({ ...user });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData });
  };

  const selectedRoleConfig = PERMISSION_LEVELS[formData.role];

  const labelClass = `block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;
  const inputClass = `w-full pl-10 pr-3 py-2.5 rounded-2xl text-sm outline-none transition-colors ${
    isDarkMode
      ? 'bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-emerald-500'
      : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-emerald-500'
  }`;
  const iconClass = `absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
    isDarkMode ? 'text-gray-500' : 'text-gray-400'
  }`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className={`rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
          }`}
        >
          <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Edit User: {user.name}
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

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <div className="relative">
                  <User className={iconClass} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Email Address *</label>
                <div className="relative">
                  <Mail className={iconClass} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`${labelClass} mb-3`}>User Role *</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(PERMISSION_LEVELS).map(([roleKey, roleConfig]) => (
                  <label
                    key={roleKey}
                    className={`relative flex items-start p-4 rounded-2xl cursor-pointer transition-all ${
                      formData.role === roleKey
                        ? isDarkMode
                          ? 'border-2 border-emerald-500 bg-emerald-900/20'
                          : 'border-2 border-emerald-500 bg-emerald-50'
                        : isDarkMode
                        ? 'border border-gray-600 hover:border-gray-500'
                        : 'border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={roleKey}
                      checked={formData.role === roleKey}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, role: e.target.value as UserType['role'] }))
                      }
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <RoleBadge role={roleKey as UserType['role']} size="sm" />
                      </div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {roleConfig.description}
                      </p>
                    </div>
                    {formData.role === roleKey && (
                      <div className="absolute top-2 right-2">
                        <div className="w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-700/40' : 'bg-gray-50'}`}>
              <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Permissions for {formData.role} role
              </h4>
              <div className="text-sm space-y-1.5">
                {selectedRoleConfig.permissions.map((permission, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    <Shield className="h-3 w-3 text-emerald-600" />
                    <span>
                      Can {permission.actions.join(', ')} in{' '}
                      {permission.section === 'all' ? 'all sections' : permission.section}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`flex items-center justify-between p-4 rounded-2xl ${
                isDarkMode ? 'bg-gray-700/40' : 'bg-gray-50'
              }`}
            >
              <div>
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Account Status
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Active users can log in and access the system
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
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
              className="px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 shadow-sm transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
