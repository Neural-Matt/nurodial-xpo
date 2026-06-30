// VICIDial specific type definitions
export interface Agent {
  agentId: string;
  user: string;
  fullName: string;
  extension: string;
  phoneLogin: string;
  campaignId: string;
  userGroup: string;
  status: string;
  statusDuration: number;
  sessionId: string;
  serverIp: string;
  callsToday: number;
  talkTime: number;
  pauseTime: number;
  wrapUpTime: number;
  lastLogin: string;
}

export interface Lead {
  leadId: string;
  listId: string;
  campaignId: string;
  phoneNumber: string;
  phoneCode: string;
  firstName: string;
  lastName: string;
  email: string;
  province: string;
  city: string;
  address: string;
  vendorLeadCode: string;
  sourceId: string;
  status: string;
  calledCount: number;
  lastCallTime: string;
  nextCallbackTime: string;
  customFields: Record<string, unknown>;
}

export interface Campaign {
  campaignId: string;
  campaignName: string;
  active: boolean;
  dialMethod: string;
  dialLevel: number;
  leadOrder: string;
  dialStatuses: string[];
  dialTimeout: number;
  activeAgents: number;
  leadsLoaded: number;
  leadsRemaining: number;
  contactRate: number;
  conversionRate: number;
  dropRate: number;
  avgHandleTime: number;
  description: string;
  type: 'Inbound' | 'Outbound' | 'Blended';
  status: 'Active' | 'Paused' | 'Closed';
  assignedAgents: string[];
}

export interface CallSession {
  callId: string;
  uniqueId: string;
  callerId: string;
  customerPhone: string;
  agentUser: string;
  campaignId: string;
  queue: string;
  direction: string;
  status: string;
  startTime: string;
  duration: number;
  recordingId: string;
  leadId: string;
}

export interface Disposition {
  statusCode: string;
  label: string;
  category: string;
  requiresCallback: boolean;
  requiresNotes: boolean;
  isSale: boolean;
  isDnc: boolean;
  isFinal: boolean;
}

export interface Recording {
  recordingId: string;
  leadId: string;
  agentUser: string;
  startTime: string;
  duration: number;
  location: string;
  campaignId: string;
}

export interface QueueStatus {
  queueId: string;
  queueName: string;
  waitingCalls: number;
  longestWait: number;
  serviceLevel: number;
  abandonedCalls: number;
  averageWait: number;
  agentsAvailable: number;
}
