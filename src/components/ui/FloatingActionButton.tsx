import React from 'react';
import { Plus } from 'lucide-react';
import Tooltip from './Tooltip';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  tooltip?: string;
  className?: string;
}

export default function FloatingActionButton({ 
  onClick, 
  icon = <Plus className="h-6 w-6" />, 
  tooltip = "Add new item",
  className = '' 
}: FloatingActionButtonProps) {
  return (
    <Tooltip content={tooltip} position="left">
      <button
        onClick={onClick}
        className={`fab hover-lift hover-glow focus-ring ${className}`}
        aria-label={tooltip}
      >
        {icon}
      </button>
    </Tooltip>
  );
}