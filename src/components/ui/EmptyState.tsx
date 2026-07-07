import { Divide as LucideIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`rounded-3xl p-12 text-center ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } ${className}`}
    >
      <div
        className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
          isDarkMode ? 'bg-gray-700' : 'bg-emerald-50'
        }`}
      >
        <Icon
          className={`h-8 w-8 ${isDarkMode ? 'text-gray-400' : 'text-emerald-600'}`}
        />
      </div>
      <h3
        className={`text-lg font-bold tracking-tight mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
      >
        {title}
      </h3>
      <p
        className={`mb-6 max-w-sm mx-auto text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 shadow-sm transition-colors"
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </button>
      )}
    </div>
  );
}
