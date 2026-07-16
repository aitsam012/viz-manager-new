import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, PERMISSION_LEVELS } from '../types/user';
import { supabase } from '../lib/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const FALLBACK_ADMIN: User = {
  id: 'dev-admin',
  email: 'admin@vizmanager.com',
  name: 'Admin User',
  role: 'admin',
  isActive: true,
  avatar: undefined,
  hasAllProjects: true,
  lastLogin: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  projectAssignments: [],
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(FALLBACK_ADMIN);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (!mounted || !userData) return;

      const { data: assignments } = await supabase
        .from('project_assignments')
        .select('project_id, can_view, can_edit, editable_sections')
        .eq('user_id', userData.id);

      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isActive: userData.is_active,
        avatar: userData.avatar ?? undefined,
        hasAllProjects: userData.has_all_projects,
        lastLogin: userData.last_login,
        createdAt: userData.created_at,
        projectAssignments: (assignments || []).map((pa: any) => ({
          projectId: pa.project_id,
          permissions: {
            canView: pa.can_view,
            canEdit: pa.can_edit,
            editableSections: pa.editable_sections || [],
          },
        })),
      });
    })().catch((err) => console.error('Failed to hydrate admin user:', err));

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (): Promise<boolean> => true;
  const logout = () => setUser(FALLBACK_ADMIN);

  const hasPermission = (section: string, action: string): boolean => {
    if (!user || !user.isActive) return false;
    if (user.role === 'admin') return true;
    const rolePermissions = PERMISSION_LEVELS[user.role].permissions;
    return rolePermissions.some((permission) => {
      const hasSection = permission.section === 'all' || permission.section === section;
      const hasAction = permission.actions.includes(action as any);
      return hasSection && hasAction;
    });
  };

  const canAccessProject = (projectId: string): boolean => {
    if (!user || !user.isActive) return false;
    if (user.role === 'admin' || user.hasAllProjects) return true;
    return user.projectAssignments.some(
      (assignment) => assignment.projectId === projectId && assignment.permissions.canView
    );
  };

  const canEditProjectSection = (projectId: string, section: string): boolean => {
    if (!user || !user.isActive) return false;
    if (user.role === 'admin') return true;
    const projectAssignment = user.projectAssignments.find(
      (assignment) => assignment.projectId === projectId
    );
    if (!projectAssignment || !projectAssignment.permissions.canEdit) return false;
    return projectAssignment.permissions.editableSections.includes(section as any);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: true,
    login,
    logout,
    hasPermission,
    canAccessProject,
    canEditProjectSection,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
