import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
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
  className = '' 
}: EmptyStateProps) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`card p-12 text-center ${className}`}>
      <div className="animate-fade-in">
        <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <Icon className={`h-8 w-8 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h3>
        <p className={`mb-6 max-w-sm mx-auto ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {description}
        </p>
        {action && (
          <button
            onClick={action.onClick}
            className="btn btn-primary hover-lift"
          >
            {action.icon && <action.icon className="h-4 w-4 mr-2" />}
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}