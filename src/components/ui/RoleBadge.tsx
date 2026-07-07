import React from 'react';
import { Shield, Users, Eye } from 'lucide-react';
import { PERMISSION_LEVELS } from '../../types/user';

interface RoleBadgeProps {
  role: 'admin' | 'manager' | 'viewer';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showDescription?: boolean;
}

export default function RoleBadge({ 
  role, 
  size = 'md', 
  showIcon = true, 
  showDescription = false 
}: RoleBadgeProps) {
  const config = PERMISSION_LEVELS[role];
  
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

  const getIcon = () => {
    switch (role) {
      case 'admin':
        return <Shield className={iconSizes[size]} />;
      case 'manager':
        return <Users className={iconSizes[size]} />;
      case 'viewer':
        return <Eye className={iconSizes[size]} />;
      default:
        return <Eye className={iconSizes[size]} />;
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${config.color}`}>
        {showIcon && getIcon()}
        <span className="capitalize">{role}</span>
      </span>
      {showDescription && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
          {config.description}
        </span>
      )}
    </div>
  );
}