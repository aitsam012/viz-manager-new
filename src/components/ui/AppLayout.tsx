import { ReactNode, useState } from 'react';
import {
  Moon,
  Sun,
  LayoutGrid,
  Users,
  ClipboardList,
  FileText,
  LogOut,
  Search,
  Mail,
  Command,
  Menu,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems: Array<{ id: View; label: string; icon: typeof LayoutGrid }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'audits', label: 'Audits', icon: ClipboardList },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  if (hasPermission('all', 'create')) {
    menuItems.push({ id: 'users', label: 'Team', icon: Users });
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U';

  const handleNav = (id: View) => {
    onViewChange(id === 'dashboard' ? 'projects' : id);
    setMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-[#f2f4f0]'}`}>
      <div className="p-4">
        {/* Top bar */}
        <div
          className={`sticky top-4 z-40 rounded-3xl px-4 md:px-6 py-3 flex items-center gap-3 md:gap-4 mb-4 shadow-sm ${
            isDarkMode ? 'bg-gray-800/95 backdrop-blur' : 'bg-white/95 backdrop-blur'
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-[3px] border-emerald-600" />
              <div className="absolute w-2 h-2 rounded-full bg-emerald-600" />
            </div>
            <span
              className={`text-lg font-bold hidden sm:block ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              VIZ Manager
            </span>
          </div>

          {/* Divider */}
          <div
            className={`hidden md:block h-8 w-px ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          />

          {/* Nav (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const isActive =
                currentView === item.id ||
                (item.id === 'dashboard' && currentView === 'projects');
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Search */}
          <div className="flex-1 relative min-w-0 hidden sm:block">
            <Search
              className={`h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}
            />
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
            <div
              className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                isDarkMode
                  ? 'bg-gray-600 text-gray-300'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              <Command className="h-3 w-3" /> F
            </div>
          </div>

          <div className="flex-1 sm:hidden" />

          {/* Actions */}
          <button
            onClick={toggleDarkMode}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
              isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            className={`hidden sm:flex w-10 h-10 rounded-full items-center justify-center transition-colors shrink-0 ${
              isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Mail className="h-4 w-4" />
          </button>

          <div className="shrink-0">
            <NotificationCenter />
          </div>

          <button
            onClick={logout}
            className={`hidden sm:flex w-10 h-10 rounded-full items-center justify-center transition-colors shrink-0 ${
              isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>

          {/* User */}
          <div
            className={`hidden md:flex items-center gap-3 pl-3 border-l shrink-0 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-100'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-semibold text-sm">
              {initials}
            </div>
            <div className="hidden xl:block">
              <div className="flex items-center gap-2">
                <p
                  className={`text-sm font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {user?.name || 'User'}
                </p>
                <RoleBadge role={user?.role || 'viewer'} size="sm" showIcon={false} />
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {user?.email}
              </p>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
              isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden rounded-3xl mb-4 p-3 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="sm:hidden mb-2 relative">
              <Search
                className={`h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className={`w-full pl-11 pr-4 py-2.5 rounded-full text-sm outline-none ${
                  isDarkMode
                    ? 'bg-gray-700 text-white placeholder-gray-400'
                    : 'bg-gray-50 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive =
                  currentView === item.id ||
                  (item.id === 'dashboard' && currentView === 'projects');
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-700 text-white'
                        : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {item.label}
                  </button>
                );
              })}
              <div className={`h-px my-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-semibold text-sm">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold truncate ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {user?.name || 'User'}
                  </p>
                  <p
                    className={`text-xs truncate ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LogOut className="h-[18px] w-[18px]" />
                Logout
              </button>
            </nav>
          </div>
        )}

        {/* Page content — full width */}
        {children}
      </div>
    </div>
  );
}
