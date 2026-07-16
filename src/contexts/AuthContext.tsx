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

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        AuthService.getCurrentUser()
          .then((userData) => {
            if (mounted) setUser(userData);
          })
          .catch((error) => console.error('Error getting user data on init:', error))
          .finally(() => {
            if (mounted) setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    }).catch((error) => {
      console.error('Error getting session:', error);
      if (mounted) setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(() => {
          AuthService.getCurrentUser()
            .then((userData) => {
              if (mounted) setUser(userData);
            })
            .catch((error) => console.error('Error getting user data:', error));
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        if (mounted) setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string): Promise<boolean> => {
    try {
      await AuthService.signIn(email);
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
      return !!userData;
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
    if (user.role === 'admin') return true;
    const rolePermissions = PERMISSION_LEVELS[user.role].permissions;
    return rolePermissions.some(permission => {
      const hasSection = permission.section === 'all' || permission.section === section;
      const hasAction = permission.actions.includes(action as any);
      return hasSection && hasAction;
    });
  };

  const canAccessProject = (projectId: string): boolean => {
    if (!user || !user.isActive) return false;
    if (user.role === 'admin' || user.hasAllProjects) return true;
    return user.projectAssignments.some(assignment =>
      assignment.projectId === projectId && assignment.permissions.canView
    );
  };

  const canEditProjectSection = (projectId: string, section: string): boolean => {
    if (!user || !user.isActive) return false;
    if (user.role === 'admin') return true;
    const projectAssignment = user.projectAssignments.find(
      assignment => assignment.projectId === projectId
    );
    if (!projectAssignment || !projectAssignment.permissions.canEdit) {
      return false;
    }
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
