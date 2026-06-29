export interface AnalyticsKpi {
  label: string;
  value: string | number;
  delta: string;
}

export const analyticsKpis: AnalyticsKpi[] = [
  { label: 'Total Calls', value: '18,420', delta: '+12.5%' },
  { label: 'Answered Calls', value: '15,680', delta: '+11.3%' },
  { label: 'Avg. Handle Time', value: '04:12', delta: '+2.0%' },
  { label: 'Contact Rate', value: '41%', delta: '+5.2%' },
  { label: 'Conversion Rate', value: '16%', delta: '+3.1%' },
  { label: 'Calls Abandoned', value: 312, delta: '+9.4%' },
];

export const trendDates = ['Apr 20', 'Apr 23', 'Apr 26', 'Apr 29', 'May 02', 'May 05', 'May 08', 'May 11', 'May 14', 'May 17', 'May 20'];

export const callVolumeTrends = {
  totalCalls: [1200, 1340, 1280, 1460, 1580, 1640, 1720, 1810, 1860, 1920, 1980],
  answeredCalls: [980, 1080, 1050, 1180, 1280, 1340, 1410, 1490, 1530, 1580, 1640],
  abandonedCalls: [60, 65, 58, 70, 75, 72, 80, 84, 78, 82, 88],
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

export interface CampaignRanking {
  rank: number;
  campaign: string;
  callsHandled: number;
  delta: string;
}

export const topCampaigns: CampaignRanking[] = [
  { rank: 1, campaign: 'Outbound Sales Q2', callsHandled: 6840, delta: '+26.5%' },
  { rank: 2, campaign: 'Retention Campaign - May 2025', callsHandled: 5120, delta: '+22.1%' },
  { rank: 3, campaign: 'Customer Win-back', callsHandled: 2360, delta: '+18.7%' },
  { rank: 4, campaign: 'Survey Follow-up', callsHandled: 1480, delta: '+15.3%' },
  { rank: 5, campaign: 'Inbound Support Overflow', callsHandled: 980, delta: '+10.2%' },
];

export interface AgentPerformanceRow {
  agent: string;
  team: string;
  role: string;
  callsHandled: number;
  activeDays: number;
  talkTime: string;
  conversions: number;
  lastLogin: string;
  status: 'Active' | 'Inactive';
}

export const agentPerformance: AgentPerformanceRow[] = [
  { agent: 'Jane Smith', team: 'Sales Campaign', role: 'Supervisor', callsHandled: 245, activeDays: 28, talkTime: '38h 20m', conversions: 23, lastLogin: 'May 20, 2025 09:15 AM', status: 'Active' },
  { agent: 'Michael Johnson', team: 'Sales Campaign', role: 'Agent', callsHandled: 312, activeDays: 26, talkTime: '44h 10m', conversions: 18, lastLogin: 'May 20, 2025 04:45 PM', status: 'Active' },
  { agent: 'Brian Williams', team: 'Support Queue', role: 'Agent', callsHandled: 280, activeDays: 27, talkTime: '41h 50m', conversions: 12, lastLogin: 'May 19, 2025 02:20 PM', status: 'Active' },
  { agent: 'Sarah Lee', team: 'Quality', role: 'Quality Assurance', callsHandled: 0, activeDays: 22, talkTime: '0h', conversions: 0, lastLogin: 'May 19, 2025 11:05 AM', status: 'Inactive' },
  { agent: 'Emily Davis', team: 'Sales Campaign', role: 'Agent', callsHandled: 298, activeDays: 24, talkTime: '39h 30m', conversions: 15, lastLogin: 'May 20, 2025 08:55 AM', status: 'Active' },
];

export const agentPerformanceTotal = 128;
