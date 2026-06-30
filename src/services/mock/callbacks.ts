export interface ScheduledCallback {
  id: string;
  leadId: string;
  campaignId: string;
  agentUser: string;
  scheduledTime: string;
  notes: string;
  createdAt: string;
}

export const callbacks: ScheduledCallback[] = [];

export function scheduleCallback(entry: ScheduledCallback): void {
  callbacks.push(entry);
}
