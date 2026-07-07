import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'Active' | 'On Pause' | 'Ended' | 'Pending' | 'In Progress' | 'Resolved' | 'Open';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Resolved':
        return {
          classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
          icon: CheckCircle,
          dot: 'bg-emerald-500'
        };
      case 'On Pause':
      case 'Pending':
        return {
          classes: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
          icon: Clock,
          dot: 'bg-amber-500'
        };
      case 'In Progress':
        return {
          classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          icon: Clock,
          dot: 'bg-blue-500'
        };
      case 'Open':
        return {
          classes: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          icon: AlertCircle,
          dot: 'bg-red-500'
        };
      case 'Ended':
        return {
          classes: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
          icon: XCircle,
          dot: 'bg-gray-500'
        };
      default:
        return {
          classes: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
          icon: AlertCircle,
          dot: 'bg-gray-500'
        };
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${config.classes}`}>
      {showIcon && (
        <div className="flex items-center">
          <div className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
        </div>
      )}
      <span>{status}</span>
    </span>
  );
}