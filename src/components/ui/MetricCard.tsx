import React from 'react';
import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple';
  tooltip?: string;
  loading?: boolean;
}

export default function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue',
  tooltip,
  loading = false 
}: MetricCardProps) {
  const { isDarkMode } = useTheme();

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600',
    emerald: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600',
    amber: 'bg-amber-100 dark:bg-amber-900 text-amber-600',
    red: 'bg-red-100 dark:bg-red-900 text-red-600',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600'
  };

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-hover p-6 group" title={tooltip}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {value}
            </p>
            {trend && (
              <div className={`flex items-center gap-1 text-sm font-medium ${
                trend.isPositive 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </div>
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}