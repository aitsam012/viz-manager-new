export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer';
  projectAssignments: ProjectAssignment[];
  hasAllProjects: boolean; // Admin can assign all projects
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  avatar?: string;
}

export interface ProjectAssignment {
  projectId: string;
  permissions: {
    canView: boolean;
    canEdit: boolean;
    editableSections: ('overview' | 'goals' | 'access' | 'queries' | 'documents')[];
  };
}

export interface Permission {
  section: 'overview' | 'goals' | 'access' | 'queries' | 'documents' | 'progress' | 'all';
  actions: ('view' | 'edit' | 'delete' | 'create')[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (section: string, action: string) => boolean;
  canAccessProject: (projectId: string) => boolean;
  canEditProjectSection: (projectId: string, section: string) => boolean;
  isLoading: boolean;
}

// Simplified Permission Levels Configuration (3 roles only)
export const PERMISSION_LEVELS = {
  admin: {
    description: 'Full system access and user management',
    permissions: [
      { section: 'all' as const, actions: ['view', 'edit', 'delete', 'create'] as const }
    ],
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: 'Shield'
  },
  manager: {
    description: 'Project management with customizable permissions',
    permissions: [
      { section: 'overview' as const, actions: ['view', 'edit'] as const },
      { section: 'goals' as const, actions: ['view', 'edit', 'create'] as const },
      { section: 'queries' as const, actions: ['view', 'edit', 'create'] as const },
      { section: 'documents' as const, actions: ['view', 'edit', 'create'] as const },
      { section: 'progress' as const, actions: ['view'] as const }
    ],
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: 'Users'
  },
  viewer: {
    description: 'View-only access to assigned projects',
    permissions: [
      { section: 'overview' as const, actions: ['view'] as const },
      { section: 'progress' as const, actions: ['view'] as const },
      { section: 'documents' as const, actions: ['view'] as const }
    ],
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    icon: 'Eye'
  }
} as const;

// Mock users for development (updated to 3 roles)
export const MOCK_USERS: User[] = [
  {
    id: 'admin-1',
    email: 'admin@vizmanager.com',
    name: 'Admin User',
    role: 'admin',
    projectAssignments: [],
    hasAllProjects: true, // Admin has access to all projects
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
    isActive: true,
    avatar: 'AU'
  },
  {
    id: 'manager-1',
    email: 'manager@vizmanager.com',
    name: 'Project Manager',
    role: 'manager',
    projectAssignments: [
      {
        projectId: '1',
        permissions: {
          canView: true,
          canEdit: true,
          editableSections: ['goals', 'queries', 'documents']
        }
      },
      {
        projectId: '2',
        permissions: {
          canView: true,
          canEdit: true,
          editableSections: ['queries', 'documents']
        }
      }
    ],
    hasAllProjects: false,
    createdAt: '2024-01-02T00:00:00Z',
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    isActive: true,
    avatar: 'PM'
  },
  {
    id: 'viewer-1',
    email: 'viewer@vizmanager.com',
    name: 'Client Viewer',
    role: 'viewer',
    projectAssignments: [
      {
        projectId: '2',
        permissions: {
          canView: true,
          canEdit: false,
          editableSections: []
        }
      }
    ],
    hasAllProjects: false,
    createdAt: '2024-01-04T00:00:00Z',
    isActive: true,
    avatar: 'CV'
  }
];

// Mock credentials for development (updated)
export const MOCK_CREDENTIALS = {
  'admin@vizmanager.com': 'admin123',
  'manager@vizmanager.com': 'manager123',
  'viewer@vizmanager.com': 'viewer123'
};