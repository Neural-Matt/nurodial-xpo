import type { QueueStatus } from '../../types/vicidial';

export const callQueues: QueueStatus[] = [
  { queueId: 'Q-SALES', queueName: 'Sales Support', waitingCalls: 5, longestWait: 215, serviceLevel: 82, abandonedCalls: 3, averageWait: 95, agentsAvailable: 6 },
  { queueId: 'Q-TECH', queueName: 'Technical Support', waitingCalls: 8, longestWait: 340, serviceLevel: 71, abandonedCalls: 6, averageWait: 148, agentsAvailable: 4 },
  { queueId: 'Q-BILL', queueName: 'Billing Inquiries', waitingCalls: 2, longestWait: 92, serviceLevel: 94, abandonedCalls: 1, averageWait: 48, agentsAvailable: 3 },
  { queueId: 'Q-RETAIN', queueName: 'Retention', waitingCalls: 4, longestWait: 180, serviceLevel: 85, abandonedCalls: 2, averageWait: 88, agentsAvailable: 5 },
  { queueId: 'Q-OVRFLW', queueName: 'Inbound Overflow', waitingCalls: 12, longestWait: 410, serviceLevel: 58, abandonedCalls: 9, averageWait: 205, agentsAvailable: 2 },
];
