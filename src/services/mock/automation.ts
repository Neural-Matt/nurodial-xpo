export type WorkflowNodeType = 'trigger' | 'condition' | 'action' | 'delay' | 'email' | 'end';

export interface WorkflowNodeData {
  id: string;
  type: WorkflowNodeType;
  icon: 'bolt' | 'filter' | 'phone' | 'search' | 'personAdd' | 'editNote' | 'assignment' | 'time' | 'email' | 'flag';
  title: string;
  subtitle: string;
  x: number;
  y: number;
}

export interface WorkflowEdgeData {
  from: string;
  to: string;
  label?: string;
  labelColor?: 'success' | 'info';
}

export const NODE_W = 180;
export const NODE_H = 60;

export const workflowNodes: WorkflowNodeData[] = [
  { id: 'trigger', type: 'trigger', icon: 'bolt', title: 'New Call Received', subtitle: 'When a call is received on any number', x: 380, y: 40 },
  { id: 'condition', type: 'condition', icon: 'filter', title: 'Call Type', subtitle: 'Check if call type is inbound or outbound', x: 380, y: 160 },
  { id: 'callRouting', type: 'action', icon: 'phone', title: 'Call Routing', subtitle: 'Assign to available sales representative', x: 160, y: 280 },
  { id: 'checkStatus', type: 'action', icon: 'search', title: 'Check Status', subtitle: 'Verify if contact is already in our system', x: 600, y: 280 },
  { id: 'createContact', type: 'action', icon: 'personAdd', title: 'Create Contact', subtitle: 'Create new contact in the system', x: 460, y: 400 },
  { id: 'updateContact', type: 'action', icon: 'editNote', title: 'Update Contact', subtitle: 'Update last contact date & time', x: 680, y: 400 },
  { id: 'assignTask', type: 'action', icon: 'assignment', title: 'Assign Task', subtitle: 'Create task for follow-up call in 24 hours', x: 460, y: 520 },
  { id: 'delay', type: 'delay', icon: 'time', title: 'Wait 1 Hour', subtitle: 'Wait for 1 hour before sending follow-up', x: 380, y: 640 },
  { id: 'email', type: 'email', icon: 'email', title: 'Follow-up Email', subtitle: 'Send follow-up email to the contact', x: 380, y: 750 },
  { id: 'end', type: 'end', icon: 'flag', title: 'Workflow Complete', subtitle: 'End this workflow', x: 380, y: 860 },
];

export const workflowEdges: WorkflowEdgeData[] = [
  { from: 'trigger', to: 'condition' },
  { from: 'condition', to: 'callRouting', label: 'Inbound', labelColor: 'success' },
  { from: 'condition', to: 'checkStatus', label: 'Outbound', labelColor: 'info' },
  { from: 'checkStatus', to: 'createContact', label: 'New Contact', labelColor: 'success' },
  { from: 'checkStatus', to: 'updateContact', label: 'Existing Contact', labelColor: 'info' },
  { from: 'createContact', to: 'assignTask' },
  { from: 'callRouting', to: 'delay' },
  { from: 'assignTask', to: 'delay' },
  { from: 'updateContact', to: 'delay' },
  { from: 'delay', to: 'email' },
  { from: 'email', to: 'end' },
];

export interface ActiveTrigger {
  id: string;
  icon: 'phone' | 'personAdd' | 'email' | 'deal' | 'task';
  title: string;
  description: string;
  enabled: boolean;
}

export const activeTriggers: ActiveTrigger[] = [
  { id: '1', icon: 'phone', title: 'New Call Received', description: 'When a call is received on any number', enabled: true },
  { id: '2', icon: 'personAdd', title: 'New Lead Created', description: 'When a new lead is created', enabled: true },
  { id: '3', icon: 'email', title: 'Email Opened', description: 'When an email is opened', enabled: true },
  { id: '4', icon: 'deal', title: 'Deal Stage Changed', description: 'When deal stage is updated', enabled: true },
  { id: '5', icon: 'task', title: 'Task Completed', description: 'When a task is completed', enabled: true },
];

export interface AutomationLogEntry {
  id: string;
  workflow: string;
  result: string;
  status: 'success' | 'error' | 'warning';
  time: string;
}

export const automationLogs: AutomationLogEntry[] = [
  { id: '1', workflow: 'Call Routing & Follow-up', result: 'Workflow executed successfully', status: 'success', time: 'May 20, 2025 10:30 AM' },
  { id: '2', workflow: 'Lead Nurturing Sequence', result: 'Workflow executed successfully', status: 'success', time: 'May 20, 2025 09:15 AM' },
  { id: '3', workflow: 'Email Follow-up Workflow', result: 'Workflow execution failed', status: 'error', time: 'May 20, 2025 08:45 AM' },
  { id: '4', workflow: 'Deal Closure Process', result: 'Workflow executed successfully', status: 'success', time: 'May 19, 2025 04:45 PM' },
  { id: '5', workflow: 'Task Reminder Workflow', result: 'Partial execution completed', status: 'warning', time: 'May 19, 2025 02:20 PM' },
];
