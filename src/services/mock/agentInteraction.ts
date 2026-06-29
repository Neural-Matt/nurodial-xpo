export const customerProfile = {
  name: 'Jane Smith',
  verified: true,
  customerSince: 'May 2023',
  email: 'jane.smith@example.com',
  phone: '+1 (555) 123-4567',
  location: 'New York, USA',
  accountId: 'ACC-10023',
};

export const interactionOverview = {
  interactionId: 'INT-20250520-00125',
  channel: 'Voice Call',
  status: 'In Progress',
  priority: 'High',
  queue: 'Support Queue',
  startTime: 'May 20, 2025 10:30 AM',
  agent: 'Admin User',
};

export interface TimelineEvent {
  id: string;
  icon: 'call' | 'verify' | 'note' | 'tag' | 'transfer';
  title: string;
  description: string;
  time: string;
}

export const timeline: TimelineEvent[] = [
  { id: '1', icon: 'transfer', title: 'Call Transferred', description: 'Transferred from IVR to Support Queue', time: '10:30:12 AM' },
  { id: '2', icon: 'call', title: 'Call Connected', description: 'Incoming call from +1 (555) 987-6543', time: '10:30:15 AM' },
  { id: '3', icon: 'verify', title: 'Customer Verified', description: 'Phone number matched with existing contact', time: '10:30:20 AM' },
  { id: '4', icon: 'note', title: 'Note Added', description: 'Customer inquired about billing issue for invoice #INV-2025-1023.', time: '10:32:05 AM' },
  { id: '5', icon: 'tag', title: 'Tag Added', description: 'Tags: Support, Billing, Priority: High', time: '10:32:10 AM' },
];

export const callControl = {
  from: '+1 (555) 987-6543',
  to: '+1 (555) 123-4567',
};

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  relevance: number;
}

export const knowledgeArticles: KnowledgeArticle[] = [
  { id: '1', title: 'How to Process a Billing Refund', category: 'Billing', relevance: 98 },
  { id: '2', title: 'Updating Customer Payment Method', category: 'Billing', relevance: 95 },
  { id: '3', title: 'Voicemail Troubleshooting Guide', category: 'Technical', relevance: 92 },
  { id: '4', title: 'Call Transfer Best Practices', category: 'Support', relevance: 96 },
];

export const interactionTags = ['Support', 'Billing', 'Priority: High'];

export const dispositionOptions = ['Resolved', 'Escalated', 'Follow-up Required', 'No Action Needed'];
