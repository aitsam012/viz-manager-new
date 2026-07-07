export interface Audit {
  id: string;
  clientWebsite: string;
  projectName: string;
  businessDeveloper: string;
  auditor: string;
  date: string;
  month: string; // Format: "2024-01" for January 2024
  auditSheetLinks: AuditSheetLink[];
  createdAt: string;
  updatedAt?: string;
}

export interface AuditSheetLink {
  id: string;
  name: string;
  url: string;
  type: 'technical' | 'content' | 'competitor' | 'keyword' | 'backlink' | 'other';
  description?: string;
}

export const AUDIT_SHEET_TYPES = {
  technical: { label: 'Technical Audit', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  content: { label: 'Content Audit', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  competitor: { label: 'Competitor Analysis', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  keyword: { label: 'Keyword Research', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  backlink: { label: 'Backlink Audit', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' }
};

// Available auditors for selection
export const AUDITORS = [
  'Alex Johnson',
  'Sarah Chen',
  'Mike Rodriguez',
  'Emily Davis',
  'David Wilson',
  'Lisa Thompson',
  'James Brown',
  'Maria Garcia'
];

// Mock data for development
export const MOCK_AUDITS: Audit[] = [
  {
    id: '1',
    clientWebsite: 'techcorp.com',
    projectName: 'TechCorp SEO Audit',
    businessDeveloper: 'John Smith',
    auditor: 'Alex Johnson',
    date: '2024-01-15',
    month: '2024-01',
    auditSheetLinks: [
      {
        id: '1',
        name: 'Technical SEO Audit',
        url: 'https://docs.google.com/spreadsheets/d/example-technical-audit',
        type: 'technical',
        description: 'Complete technical SEO analysis including site speed, crawlability, and indexation'
      },
      {
        id: '2',
        name: 'Content Gap Analysis',
        url: 'https://docs.google.com/spreadsheets/d/example-content-audit',
        type: 'content',
        description: 'Content audit and gap analysis for improved rankings'
      }
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  },
  {
    id: '2',
    clientWebsite: 'greenleaf.com',
    projectName: 'GreenLeaf Organic Foods Audit',
    businessDeveloper: 'Sarah Wilson',
    auditor: 'Sarah Chen',
    date: '2024-02-01',
    month: '2024-02',
    auditSheetLinks: [
      {
        id: '3',
        name: 'Local SEO Audit',
        url: 'https://docs.google.com/spreadsheets/d/example-local-audit',
        type: 'technical',
        description: 'Local SEO audit for organic food delivery service'
      },
      {
        id: '4',
        name: 'Competitor Analysis',
        url: 'https://docs.google.com/spreadsheets/d/example-competitor-analysis',
        type: 'competitor',
        description: 'Analysis of top 10 competitors in organic food space'
      }
    ],
    createdAt: '2024-02-01T09:15:00Z'
  },
  {
    id: '3',
    clientWebsite: 'digitalmarketing.pro',
    projectName: 'Digital Marketing Pro Audit',
    businessDeveloper: 'Mike Chen',
    auditor: 'Mike Rodriguez',
    date: '2024-02-15',
    month: '2024-02',
    auditSheetLinks: [
      {
        id: '5',
        name: 'Keyword Research & Strategy',
        url: 'https://docs.google.com/spreadsheets/d/example-keyword-research',
        type: 'keyword',
        description: 'Comprehensive keyword research for digital marketing services'
      }
    ],
    createdAt: '2024-02-15T11:45:00Z'
  }
];

export const BUSINESS_DEVELOPERS = [
  'John Smith',
  'Sarah Wilson',
  'Mike Chen',
  'Lisa Rodriguez',
  'David Johnson',
  'Emily Davis'
];