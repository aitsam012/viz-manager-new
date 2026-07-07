import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ProgressChartProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: 'blue' | 'emerald' | 'amber' | 'red';
}

export default function ProgressChart({ 
  progress, 
  size = 'md', 
  showLabel = true,
  color = 'blue' 
}: ProgressChartProps) {
  const { isDarkMode } = useTheme();
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const strokeColors = {
    blue: '#3b82f6',
    emerald: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444'
  };

  const radius = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      <svg
        className="transform -rotate-90"
        width="100%"
        height="100%"
        viewBox={`0 0 ${radius * 2 + 8} ${radius * 2 + 8}`}
      >
        {/* Background circle */}
        <circle
          cx={radius + 4}
          cy={radius + 4}
          r={radius}
          stroke={isDarkMode ? '#374151' : '#e5e7eb'}
          strokeWidth="3"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={radius + 4}
          cy={radius + 4}
          r={radius}
          stroke={strokeColors[color]}
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <div className={`absolute inset-0 flex items-center justify-center ${textSizes[size]} font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {progress}%
        </div>
      )}
    </div>
  );
}