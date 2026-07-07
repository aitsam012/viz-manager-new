import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface PermissionGateProps {
  children: React.ReactNode;
  section: string;
  action: string;
  fallback?: React.ReactNode;
  projectId?: string;
}

export default function PermissionGate({ 
  children, 
  section, 
  action, 
  fallback = null,
  projectId 
}: PermissionGateProps) {
  const { hasPermission, canAccessProject } = useAuth();

  // Check basic permission
  if (!hasPermission(section, action)) {
    return <>{fallback}</>;
  }

  // Check project access if projectId is provided
  if (projectId && !canAccessProject(projectId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}