export interface ScorecardCriterion {
  id: string;
  label: string;
  description: string;
  weight: number;
  maxScore: number;
  score: number;
}

export const scorecardCriteria: ScorecardCriterion[] = [
  { id: 'greeting', label: 'Greeting & Introduction', description: 'Agent greeted the customer warmly and introduced themselves.', weight: 10, maxScore: 10, score: 9 },
  { id: 'verification', label: 'Verification & Authentication', description: "Agent verified the customer's identity appropriately.", weight: 10, maxScore: 10, score: 8 },
  { id: 'communication', label: 'Communication & Listening Skills', description: 'Agent listened actively and communicated clearly.', weight: 20, maxScore: 20, score: 18 },
  { id: 'resolution', label: 'Issue Resolution', description: 'Agent resolved the issue effectively and efficiently.', weight: 25, maxScore: 25, score: 21 },
  { id: 'knowledge', label: 'Product Knowledge', description: 'Agent demonstrated strong product/service knowledge.', weight: 15, maxScore: 15, score: 12 },
  { id: 'closing', label: 'Closing & Thank You', description: 'Agent closed the call positively and thanked the customer.', weight: 10, maxScore: 10, score: 9 },
  { id: 'compliance', label: 'Compliance & Policy Adherence', description: 'Agent followed company policies and compliance guidelines.', weight: 10, maxScore: 10, score: 9 },
];

export const callDetails = {
  callId: 'CALL-2025-05-20-001234',
  dateTime: 'May 20, 2025 09:15 AM',
  duration: '08:42',
  direction: 'Outbound',
  customer: 'Jane Smith',
  phoneNumber: '+1 (555) 123-4567',
  campaign: 'Retention Campaign - May 2025',
  queue: 'Customer Support',
  agent: 'Brian Williams',
};

export const evaluationDetails = {
  scorecard: 'Customer Support Scorecard',
  form: 'Standard Call Evaluation Form',
  evaluator: 'Admin User',
  status: 'In Progress',
  dueDate: 'May 22, 2025 11:59 PM',
};

export const defaultFeedback =
  "Great job maintaining a professional and empathetic tone throughout the call. You handled the customer's concern well and provided a clear solution. Work on reducing hold time and proactively offering additional help before closing.";
