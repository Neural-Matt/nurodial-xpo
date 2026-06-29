export interface AnalyticsKpi {
  label: string;
  value: string | number;
  delta: string;
}

export const analyticsKpis: AnalyticsKpi[] = [
  { label: 'Total Users', value: 128, delta: '+12.5%' },
  { label: 'Active Users', value: 98, delta: '+11.3%' },
  { label: 'New Users', value: 24, delta: '+20.0%' },
  { label: 'User Logins', value: 1246, delta: '+18.7%' },
  { label: 'Deals Created', value: 312, delta: '+25.4%' },
  { label: 'Activities Logged', value: 4562, delta: '+22.1%' },
];

export const trendDates = ['Apr 20', 'Apr 23', 'Apr 26', 'Apr 29', 'May 02', 'May 05', 'May 08', 'May 11', 'May 14', 'May 17', 'May 20'];

export const activityTrends = {
  logins: [620, 700, 680, 780, 850, 900, 980, 1050, 1100, 1180, 1246],
  activeUsers: [70, 75, 78, 80, 82, 85, 88, 90, 92, 95, 98],
  newUsers: [10, 12, 14, 11, 15, 18, 16, 19, 20, 22, 24],
  activities: [300, 340, 360, 380, 400, 420, 440, 460, 480, 500, 520],
};

export const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const heatmapHours = ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
export const heatmapData: number[][] = [
  [5, 8, 40, 70, 90, 85, 60, 20],
  [4, 6, 38, 65, 95, 88, 58, 18],
  [6, 9, 42, 72, 100, 92, 62, 22],
  [5, 7, 39, 68, 88, 80, 55, 19],
  [7, 10, 45, 75, 98, 95, 70, 30],
  [15, 5, 10, 20, 35, 40, 50, 35],
  [10, 4, 8, 15, 25, 30, 35, 20],
];

export interface TeamRanking {
  rank: number;
  team: string;
  activities: number;
  delta: string;
}

export const topTeams: TeamRanking[] = [
  { rank: 1, team: 'Sales Team', activities: 1234, delta: '+26.5%' },
  { rank: 2, team: 'Support Team', activities: 987, delta: '+22.1%' },
  { rank: 3, team: 'Marketing Team', activities: 765, delta: '+18.7%' },
  { rank: 4, team: 'Development Team', activities: 543, delta: '+15.3%' },
  { rank: 5, team: 'Admin Team', activities: 321, delta: '+10.2%' },
];

export interface UserPerformanceRow {
  user: string;
  team: string;
  role: string;
  logins: number;
  activeDays: number;
  activities: number;
  dealsCreated: number;
  lastLogin: string;
  status: 'Active' | 'Inactive';
}

export const userPerformance: UserPerformanceRow[] = [
  { user: 'Jane Smith', team: 'Sales', role: 'Manager', logins: 45, activeDays: 28, activities: 156, dealsCreated: 23, lastLogin: 'May 20, 2025 09:15 AM', status: 'Active' },
  { user: 'Michael Johnson', team: 'Sales', role: 'Sales Rep', logins: 38, activeDays: 26, activities: 134, dealsCreated: 18, lastLogin: 'May 20, 2025 04:45 PM', status: 'Active' },
  { user: 'Brian Williams', team: 'Support', role: 'Support Agent', logins: 42, activeDays: 27, activities: 210, dealsCreated: 12, lastLogin: 'May 19, 2025 02:20 PM', status: 'Active' },
  { user: 'Sarah Lee', team: 'Marketing', role: 'Marketing User', logins: 30, activeDays: 22, activities: 98, dealsCreated: 8, lastLogin: 'May 19, 2025 11:05 AM', status: 'Inactive' },
  { user: 'Emily Davis', team: 'Sales', role: 'Sales Rep', logins: 35, activeDays: 24, activities: 121, dealsCreated: 15, lastLogin: 'May 20, 2025 08:55 AM', status: 'Active' },
];

export const userPerformanceTotal = 128;
