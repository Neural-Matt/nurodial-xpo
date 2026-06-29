import type { Campaign } from '../../types/vicidial';

export const campaigns: Campaign[] = [
  { campaignId: 'RETAIN25', campaignName: 'Retention Campaign - May 2025', active: true, dialMethod: 'RATIO', dialLevel: 2.5, leadOrder: 'DOWN', dialStatuses: ['NEW', 'CALLBK', 'NI'], dialTimeout: 30, activeAgents: 14, leadsLoaded: 4200, leadsRemaining: 1180, contactRate: 42, conversionRate: 18, dropRate: 2.1, avgHandleTime: 245 },
  { campaignId: 'OUTSALES', campaignName: 'Outbound Sales Q2', active: true, dialMethod: 'ADAPT_HARD_LIMIT', dialLevel: 3.2, leadOrder: 'RANDOM', dialStatuses: ['NEW', 'CALLBK'], dialTimeout: 25, activeAgents: 22, leadsLoaded: 8600, leadsRemaining: 3120, contactRate: 38, conversionRate: 12, dropRate: 3.4, avgHandleTime: 210 },
  { campaignId: 'WINBACK', campaignName: 'Customer Win-back', active: true, dialMethod: 'RATIO', dialLevel: 1.8, leadOrder: 'UP', dialStatuses: ['NEW', 'CALLBK', 'NI'], dialTimeout: 35, activeAgents: 8, leadsLoaded: 1500, leadsRemaining: 640, contactRate: 51, conversionRate: 22, dropRate: 1.5, avgHandleTime: 268 },
  { campaignId: 'APPTREM', campaignName: 'Appointment Reminders', active: false, dialMethod: 'MANUAL', dialLevel: 1, leadOrder: 'DOWN', dialStatuses: ['NEW'], dialTimeout: 20, activeAgents: 0, leadsLoaded: 320, leadsRemaining: 0, contactRate: 78, conversionRate: 65, dropRate: 0.4, avgHandleTime: 95 },
  { campaignId: 'SURVEY25', campaignName: 'Survey Follow-up', active: true, dialMethod: 'RATIO', dialLevel: 2, leadOrder: 'RANDOM', dialStatuses: ['NEW', 'CALLBK'], dialTimeout: 30, activeAgents: 6, leadsLoaded: 2100, leadsRemaining: 980, contactRate: 35, conversionRate: 9, dropRate: 2.8, avgHandleTime: 140 },
  { campaignId: 'INOVRFLW', campaignName: 'Inbound Support Overflow', active: true, dialMethod: 'INBOUND', dialLevel: 0, leadOrder: 'DOWN', dialStatuses: ['NEW'], dialTimeout: 0, activeAgents: 5, leadsLoaded: 0, leadsRemaining: 0, contactRate: 100, conversionRate: 0, dropRate: 4.2, avgHandleTime: 320 },
];
