export interface Project {
  id: string;
  name: string;
  clientName: string;
  status: 'Active' | 'On Pause' | 'Ended';
  startDate: string;
  duration: string;
  projectType: 'milestone' | 'timer' | 'fixed' | 'direct-client';
  deadline?: string; // For milestone-based projects
  weeklyHours?: number; // For timer-based projects
  upworkProfile?: string; // For all project types
  businessDeveloper?: string; // Business developer name
  equivalentHours?: number; // For fixed projects
  teamMembers: string[];
  primaryGoals: string[];
  focusKeywords: string[];
  accessGranted: AccessItem[];
  progressReports: ProgressReport[];
  queries: Query[];
  documents: ProjectDocument[];
}

export interface AccessItem {
  type: string;
  dateGranted: string;
  status: 'Active' | 'Pending' | 'Revoked';
  email?: string;
  websiteCredentials?: {
    email: string;
    password: string;
  };
  clientEmail?: {
    email: string;
    password: string;
  };
  notes?: string;
}

export interface ProgressReport {
  id: string;
  title: string;
  reportUrl: string;
  timestamp: string;
  month: string;
  notes?: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'progress-report' | 'google-sheet' | 'looker-studio' | 'internal-doc';
  url: string;
  category: string;
  uploadDate: string;
  description?: string;
}

export interface Query {
  id: string;
  title: string;
  qaItems: {
    id: string;
    question: string;
    answer: string;
  }[];
  linkedSheet: string;
  assignedTo: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt?: string;
  updatedAt?: string;
}