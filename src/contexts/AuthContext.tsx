import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, PERMISSION_LEVELS } from '../types/user';
import { AuthService } from '../services/authService';
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing Supabase session on mount
  useEffect(() => {
    let initialized = false;

    // Listen for auth changes — fires synchronously with INITIAL_SESSION on mount
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        try {
          if (session?.user) {
            const userData = await AuthService.getCurrentUser();
            setUser(userData);
          }
        } catch (error) {
          console.error('Error getting user data on init:', error);
        } finally {
          initialized = true;
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_IN' && session?.user) {
        try {
          const userData = await AuthService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Error getting user data:', error);
        }
        if (!initialized) {
          initialized = true;
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        if (!initialized) {
          initialized = true;
          setIsLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await AuthService.signIn(email, password);
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    AuthService.signOut();
    setUser(null);
  };

  const hasPermission = (section: string, action: string): boolean => {
    if (!user || !user.isActive) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Check specific permissions based on role
    const rolePermissions = PERMISSION_LEVELS[user.role].permissions;
    return rolePermissions.some(permission => {
      const hasSection = permission.section === 'all' || permission.section === section;
      const hasAction = permission.actions.includes(action as any);
      return hasSection && hasAction;
    });
  };

  const canAccessProject = (projectId: string): boolean => {
    if (!user || !user.isActive) return false;
    
    // Admin can access all projects
    if (user.role === 'admin' || user.hasAllProjects) return true;
    
    // Check if user has specific project assignment
    return user.projectAssignments.some(assignment => 
      assignment.projectId === projectId && assignment.permissions.canView
    );
  };

  const canEditProjectSection = (projectId: string, section: string): boolean => {
    if (!user || !user.isActive) return false;
    
    // Admin can edit everything
    if (user.role === 'admin') return true;
    
    // Check project-specific permissions
    const projectAssignment = user.projectAssignments.find(
      assignment => assignment.projectId === projectId
    );
    
    if (!projectAssignment || !projectAssignment.permissions.canEdit) {
      return false;
    }
    
    // Check if user can edit this specific section
    return projectAssignment.permissions.editableSections.includes(section as any);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    canAccessProject,
    canEditProjectSection,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};