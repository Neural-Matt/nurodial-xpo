// Central TypeScript type definitions for the XpoDial frontend
export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  roles: Role[];
}

export type Role =
  | 'Administrator'
  | 'Agent'
  | 'Supervisor'
  | 'QualityAssurance'
  | 'MIS'
  | 'CampaignManager';

export interface Breadcrumb {
  label: string;
  path?: string;
}

// Example mock data shape for a table row
export interface TableRow {
  id: string | number;
  [key: string]: any;
}

// Ensure named exports are available for ES module imports
export { NavItem, Role, Breadcrumb, TableRow };
