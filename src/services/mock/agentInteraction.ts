export interface TimelineEvent {
  id: string;
  icon: 'call' | 'verify' | 'note' | 'tag' | 'transfer';
  title: string;
  description: string;
  time: string;
}

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
