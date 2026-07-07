export interface MetricTrend {
  value: number;
  isPositive: boolean;
}

export interface ProjectMetrics {
  totalProjects: number;
  activeProjects: number;
  newProjectsThisMonth: number;
  activeProjectsThisMonth: number;
  totalProjectsTrend?: MetricTrend;
  activeProjectsTrend?: MetricTrend;
}

export const calculateMetrics = (projects: any[]): ProjectMetrics => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Current month dates
  const currentMonthStart = new Date(currentYear, currentMonth, 1);
  const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);
  
  // Last month dates
  const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthEnd = new Date(currentYear, currentMonth, 0);
  
  // Current metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  
  // New projects this month
  const newProjectsThisMonth = projects.filter(project => {
    const startDate = new Date(project.startDate);
    return startDate >= currentMonthStart && startDate <= currentMonthEnd;
  }).length;
  
  // New projects last month
  const newProjectsLastMonth = projects.filter(project => {
    const startDate = new Date(project.startDate);
    return startDate >= lastMonthStart && startDate <= lastMonthEnd;
  }).length;
  
  // Active projects this month (projects that were active at any point this month)
  const activeProjectsThisMonth = projects.filter(project => {
    const startDate = new Date(project.startDate);
    // Project started before or during this month and is currently active
    return startDate <= currentMonthEnd && project.status === 'Active';
  }).length;
  
  // Active projects last month (estimate based on start dates)
  const activeProjectsLastMonth = projects.filter(project => {
    const startDate = new Date(project.startDate);
    // Project started before or during last month
    return startDate <= lastMonthEnd && (
      project.status === 'Active' || 
      // If project ended, check if it was likely active last month
      (project.status === 'Ended' && startDate <= lastMonthStart)
    );
  }).length;
  
  // Calculate trends only if we have previous month data
  let totalProjectsTrend: MetricTrend | undefined;
  let activeProjectsTrend: MetricTrend | undefined;
  
  if (newProjectsLastMonth > 0) {
    const newProjectsGrowth = ((newProjectsThisMonth - newProjectsLastMonth) / newProjectsLastMonth) * 100;
    totalProjectsTrend = {
      value: Math.abs(Math.round(newProjectsGrowth)),
      isPositive: newProjectsGrowth >= 0
    };
  }
  
  if (activeProjectsLastMonth > 0) {
    const activeProjectsGrowth = ((activeProjectsThisMonth - activeProjectsLastMonth) / activeProjectsLastMonth) * 100;
    activeProjectsTrend = {
      value: Math.abs(Math.round(activeProjectsGrowth)),
      isPositive: activeProjectsGrowth >= 0
    };
  }
  
  return {
    totalProjects,
    activeProjects,
    newProjectsThisMonth,
    activeProjectsThisMonth,
    totalProjectsTrend,
    activeProjectsTrend
  };
};

export const formatTrendTooltip = (
  metric: string,
  currentValue: number,
  trend?: MetricTrend
): string => {
  if (!trend) {
    return `${metric}: ${currentValue} (No previous data for comparison)`;
  }
  
  const direction = trend.isPositive ? 'increase' : 'decrease';
  return `${metric}: ${currentValue} (${trend.value}% ${direction} from last month)`;
};