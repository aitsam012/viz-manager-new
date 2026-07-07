import { ReactNode, useState } from 'react';
import {
  Moon,
  Sun,
  LayoutGrid,
  FolderKanban,
  Users,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  Search,
  Mail,
  HelpCircle,
  Command,
} from 'lucide-react';
import NotificationCenter from '../NotificationCenter';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import RoleBadge from './RoleBadge';

type View = 'dashboard' | 'projects' | 'users' | 'audits' | 'reports';

interface AppLayoutProps {
  currentView: View;
  onViewChange: (view: View) => void;
  children: ReactNode;
  searchPlaceholder?: string;
}

export default function AppLayout({
  currentView,
  onViewChange,
  children,
  searchPlaceholder = 'Search...',
}: AppLayoutProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const menuItems: Array<{ id: View; label: string; icon: typeof LayoutGrid; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'audits', label: 'Audits', icon: ClipboardList },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  if (hasPermission('all', 'create')) {
    menuItems.push({ id: 'users', label: 'Team', icon: Users });
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U';

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-[#f2f4f0]'}`}>
      {/* Sidebar */}
      <aside
        className={`hidden lg:flex flex-col w-64 shrink-0 p-4 gap-4 ${
          isDarkMode ? 'bg-gray-900' : 'bg-[#f2f4f0]'
        }`}
      >
        <div
          className={`rounded-3xl flex-1 flex flex-col p-5 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="relative w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-[3px] border-emerald-600" />
              <div className="absolute w-2 h-2 rounded-full bg-emerald-600" />
            </div>
            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              VIZ Manager
            </span>
          </div>

          {/* Menu */}
          <div className="mb-6">
            <p className={`text-xs font-semibold tracking-widest mb-3 px-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              MENU
            </p>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive =
                  currentView === item.id ||
                  (item.id === 'dashboard' && currentView === 'projects');
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id === 'dashboard' ? 'projects' : item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-[18px] w-[18px]" />
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* General */}
          <div>
            <p className={`text-xs font-semibold tracking-widest mb-3 px-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              GENERAL
            </p>
            <nav className="space-y-1">
              <button
                onClick={toggleDarkMode}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {isDarkMode ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-[18px] w-[18px]" />
                Settings
              </button>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <HelpCircle className="h-[18px] w-[18px]" />
                Help
              </button>
              <button
                onClick={logout}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LogOut className="h-[18px] w-[18px]" />
                Logout
              </button>
            </nav>
          </div>

          <div className="flex-1" />
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 min-w-0 p-4 lg:pl-0 lg:pr-4 lg:py-4">
        {/* Top bar */}
        <div className={`rounded-3xl px-6 py-4 flex items-center gap-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex-1 relative min-w-0">
            <Search className={`h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className={`w-full pl-11 pr-16 py-2.5 rounded-full text-sm outline-none transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-white placeholder-gray-400'
                  : 'bg-gray-50 text-gray-900 placeholder-gray-400'
              }`}
            />
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-medium ${
              isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-500 border border-gray-200'
            }`}>
              <Command className="h-3 w-3" /> F
            </div>
          </div>

          <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}>
            <Mail className="h-4 w-4" />
          </button>

          <div className="relative">
            <NotificationCenter />
          </div>

          <div className={`flex items-center gap-3 pl-3 border-l ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-semibold text-sm">
              {initials}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name || 'User'}
                </p>
                <RoleBadge role={user?.role || 'viewer'} size="sm" showIcon={false} />
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Page content */}
        {children}
      </div>
    </div>
  );
}
