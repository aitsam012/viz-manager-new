export interface Report {
  id: string;
  projectName: string;
  clientName: string;
  upworkProfile: string;
  businessDeveloper: string;
  reportingPerson: string;
  reportDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  departmentName: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  completionHistory: ReportCompletion[];
}

export interface ReportCompletion {
  date: string; // YYYY-MM-DD format
  completed: boolean;
  completedAt?: string; // ISO timestamp when marked complete
  completedBy?: string; // User who marked it complete
}

export const REPORT_DAYS = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const;

export const DEPARTMENTS = [
  'SEO Department',
  'Content Marketing',
  'PPC Department',
  'Social Media',
  'Web Development',
  'Analytics Team',
  'Client Success'
];

export const BUSINESS_DEVELOPERS = [
  'John Smith',
  'Sarah Wilson',
  'Mike Chen',
  'Lisa Rodriguez',
  'David Johnson',
  'Emily Davis'
];

export const UPWORK_PROFILES = [
  'SEO Expert Pro',
  'Digital Marketing Specialist',
  'Content Strategy Expert',
  'PPC Campaign Manager',
  'Web Analytics Pro',
  'Social Media Guru'
];

// Mock data for development
export const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    projectName: 'TechCorp Solutions',
    clientName: 'TechCorp Inc.',
    upworkProfile: 'SEO Expert Pro',
    businessDeveloper: 'John Smith',
    reportingPerson: 'Alex Johnson',
    reportDay: 'Monday',
    departmentName: 'SEO Department',
    createdAt: '2024-01-15T10:30:00Z',
    isActive: true,
    completionHistory: []
  },
  {
    id: '2',
    projectName: 'GreenLeaf Organics',
    clientName: 'GreenLeaf Foods LLC',
    upworkProfile: 'Digital Marketing Specialist',
    businessDeveloper: 'Sarah Wilson',
    reportingPerson: 'Maria Garcia',
    reportDay: 'Wednesday',
    departmentName: 'Content Marketing',
    createdAt: '2024-02-01T09:15:00Z',
    isActive: true,
    completionHistory: []
  },
  {
    id: '3',
    projectName: 'Digital Marketing Pro',
    clientName: 'DMP Agency',
    upworkProfile: 'PPC Campaign Manager',
    businessDeveloper: 'Mike Chen',
    reportingPerson: 'David Wilson',
    reportDay: 'Friday',
    departmentName: 'PPC Department',
    createdAt: '2024-02-15T11:45:00Z',
    isActive: true,
    completionHistory: []
  },
  {
    id: '4',
    projectName: 'E-commerce Boost',
    clientName: 'Online Retail Co.',
    upworkProfile: 'SEO Expert Pro',
    businessDeveloper: 'Lisa Rodriguez',
    reportingPerson: 'Emily Davis',
    reportDay: 'Tuesday',
    departmentName: 'SEO Department',
    createdAt: '2024-03-01T14:20:00Z',
    isActive: true,
    completionHistory: []
  }
];

// Helper functions for report reminders
export const getTodayReports = (reports: Report[]): (Report & { isPending?: boolean })[] => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayDate = new Date().toISOString().split('T')[0];
  
  return reports
    .filter(report => report.reportDay === today && report.isActive)
    .map(report => {
      const todayCompletion = report.completionHistory.find(c => c.date === todayDate);
      return {
        ...report,
        isPending: !todayCompletion?.completed
      };
    });
};

export const getTomorrowReports = (reports: Report[]): Report[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });
  return reports.filter(report => report.reportDay === tomorrowDay && report.isActive);
};

export const getPendingReports = (reports: Report[]): (Report & { pendingDate: string })[] => {
  const today = new Date();
  const todayDate = today.toISOString().split('T')[0];
  const pending: (Report & { pendingDate: string })[] = [];
  
  // Check last 7 days for incomplete reports
  for (let i = 1; i <= 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const checkDateStr = checkDate.toISOString().split('T')[0];
    const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    const dayReports = reports.filter(report => 
      report.reportDay === dayName && report.isActive
    );
    
    dayReports.forEach(report => {
      const completion = report.completionHistory.find(c => c.date === checkDateStr);
      if (!completion?.completed) {
        pending.push({
          ...report,
          pendingDate: checkDateStr
        });
      }
    });
  }
  
  return pending;
};

export const isReportCompleted = (report: Report, date: string): boolean => {
  const completion = report.completionHistory.find(c => c.date === date);
  return completion?.completed || false;
};

export const getUpcomingReports = (reports: Report[], days: number = 7): Report[] => {
  const upcoming: Report[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    const dayReports = reports.filter(report => 
      report.reportDay === dayName && report.isActive
    );
    
    upcoming.push(...dayReports.map(report => ({
      ...report,
      // Add computed field for display
      dueDate: date.toISOString()
    } as any)));
  }
  
  return upcoming;
};