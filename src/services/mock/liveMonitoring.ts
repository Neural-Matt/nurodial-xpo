export const liveKpis = {
  agentsOnline: { value: 32, caption: '78% of total' },
  onLiveCalls: { value: 14, caption: '44% of online' },
  inWrapUp: { value: 8, caption: '25% of online' },
  onBreak: { value: 10, caption: '31% of online' },
};

export interface QueuedCall {
  position: number;
  callerName: string;
  callerPhone: string;
  queue: string;
  waitTime: string;
  waitSeverity: 'low' | 'medium' | 'high';
  priority: 'High' | 'Medium' | 'Low';
}

export const liveQueue: QueuedCall[] = [
  { position: 1, callerName: 'Sarah Mitchell', callerPhone: '+1 (555) 123-4567', queue: 'Sales Support', waitTime: '02:15', waitSeverity: 'high', priority: 'High' },
  { position: 2, callerName: 'John Davis', callerPhone: '+1 (555) 234-5678', queue: 'Technical Support', waitTime: '01:48', waitSeverity: 'medium', priority: 'Medium' },
  { position: 3, callerName: 'Emily Martinez', callerPhone: '+1 (555) 345-6789', queue: 'Billing Inquiries', waitTime: '01:32', waitSeverity: 'medium', priority: 'Medium' },
  { position: 4, callerName: 'Robert Brown', callerPhone: '+1 (555) 456-7890', queue: 'Sales Support', waitTime: '00:58', waitSeverity: 'low', priority: 'Low' },
  { position: 5, callerName: 'Lisa Wilson', callerPhone: '+1 (555) 567-8901', queue: 'Technical Support', waitTime: '00:45', waitSeverity: 'low', priority: 'Low' },
];

export const liveQueueTotal = 24;

export interface AgentStatusCard {
  id: string;
  name: string;
  status: 'On Call' | 'Available' | 'On Break';
  team: string;
  callDuration?: string;
}

export const agentStatuses: AgentStatusCard[] = [
  { id: '1', name: 'Michael Johnson', status: 'On Call', team: 'Sales', callDuration: '00:12:45' },
  { id: '2', name: 'Emily Davis', status: 'On Call', team: 'Sales', callDuration: '00:08:32' },
  { id: '3', name: 'David Wilson', status: 'On Break', team: 'Support', callDuration: '00:02:15' },
  { id: '4', name: 'Sarah Lee', status: 'Available', team: 'Support' },
  { id: '5', name: 'James Taylor', status: 'On Break', team: 'Sales' },
  { id: '6', name: 'Maria Garcia', status: 'Available', team: 'Support' },
];

export const teamPerformanceToday = {
  totalCalls: { value: 156, delta: '+12% vs yesterday' },
  answeredCalls: { value: 142, caption: '91% Answer Rate' },
  avgTalkTime: { value: '04:32', delta: '+8% vs yesterday' },
  csatScore: { value: '4.6/5', delta: '+5% vs yesterday' },
};

export const callsOverTime = [
  { time: '12 AM', calls: 4 }, { time: '2 AM', calls: 2 }, { time: '4 AM', calls: 3 },
  { time: '6 AM', calls: 8 }, { time: '8 AM', calls: 35 }, { time: '10 AM', calls: 52 },
  { time: '12 PM', calls: 48 }, { time: '2 PM', calls: 60 }, { time: '4 PM', calls: 55 },
  { time: '6 PM', calls: 38 }, { time: '8 PM', calls: 20 },
];

export interface ActivityFeedItem {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: 'success' | 'warning' | 'info';
}

export const liveActivityFeed: ActivityFeedItem[] = [
  { id: '1', title: 'New call accepted', description: 'Michael Johnson accepted call from +1 (555) 987-6543', time: '10:30:45 AM', tone: 'success' },
  { id: '2', title: 'Agent status changed', description: 'Emily Davis changed status to On Break', time: '10:30:12 AM', tone: 'info' },
  { id: '3', title: 'High wait time alert', description: 'Technical Support queue wait time is 02:15', time: '10:29:58 AM', tone: 'warning' },
  { id: '4', title: 'CSAT score received', description: 'New CSAT score of 5/5 received for call', time: '10:29:31 AM', tone: 'success' },
];
