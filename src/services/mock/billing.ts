export const usage = {
  cycleLabel: 'May 01 - May 31, 2025',
  minutes: { used: 12450, limit: 20000, remaining: 7550, resetsInDays: 11 },
  apiCalls: { used: 245680, limit: 500000, remaining: 254320, resetsInDays: 11 },
};

export interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export const invoices: Invoice[] = [
  { id: 'INV-2025-00078', date: 'May 01, 2025', description: 'Enterprise Plan - May 2025', amount: 499, status: 'Paid' },
  { id: 'INV-2025-00077', date: 'Apr 01, 2025', description: 'Enterprise Plan - Apr 2025', amount: 499, status: 'Paid' },
  { id: 'INV-2025-00076', date: 'Mar 01, 2025', description: 'Enterprise Plan - Mar 2025', amount: 499, status: 'Paid' },
  { id: 'INV-2025-00075', date: 'Feb 01, 2025', description: 'Enterprise Plan - Feb 2025', amount: 499, status: 'Paid' },
  { id: 'INV-2025-00074', date: 'Jan 01, 2025', description: 'Enterprise Plan - Jan 2025', amount: 499, status: 'Paid' },
];

export const invoiceTotalCount = 12;

export const subscription = {
  plan: 'Enterprise Plan',
  description: 'All-in-one solution for large teams with advanced capabilities.',
  monthly: 499,
  billingCycle: 'May 01 - May 31, 2025',
  nextBillingDate: 'June 01, 2025',
  status: 'Active',
};

export interface PaymentMethod {
  id: string;
  brand: 'Visa' | 'Mastercard';
  last4: string;
  expires: string;
  isDefault?: boolean;
}

export const paymentMethods: PaymentMethod[] = [
  { id: 'pm_1', brand: 'Visa', last4: '4242', expires: '04/2027', isDefault: true },
  { id: 'pm_2', brand: 'Mastercard', last4: '8888', expires: '11/2026' },
];
