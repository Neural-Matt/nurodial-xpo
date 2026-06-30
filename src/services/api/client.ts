import type { Campaign, Lead, Disposition } from '../../types/vicidial';
import type { Role } from '../../types';

const API_BASE_URL: string | undefined = import.meta.env.VITE_API_BASE_URL;

export const TOKEN_KEY = 'nurodial.token';

export function isApiConfigured(): boolean {
  return Boolean(API_BASE_URL);
}

function storedToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    role: Role;
  };
}

export async function apiLogin(username: string, password: string): Promise<LoginResponse> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((body as { error?: string }).error ?? `Login failed (${response.status})`);
  return body as LoginResponse;
}

async function getJson<T>(path: string): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not set — the real backend is not configured.');
  }
  const headers: Record<string, string> = {};
  const token = storedToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request to ${path} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// Raw shapes returned by server/src/types.ts — kept distinct from the
// frontend's richer Campaign type because VICIDial doesn't store every
// field that type has (see server/README.md "Known gaps").
interface ApiCampaign {
  campaignId: string;
  campaignName: string;
  active: boolean;
  dialMethod: string;
  autoDialLevel: number;
  hopperLevel: number;
  localCallTime: string;
  type: 'Inbound' | 'Outbound';
  status: 'Active' | 'Paused';
}

function toCampaign(row: ApiCampaign): Campaign {
  return {
    campaignId: row.campaignId,
    campaignName: row.campaignName,
    active: row.active,
    dialMethod: row.dialMethod,
    dialLevel: row.autoDialLevel,
    leadOrder: '',
    dialStatuses: [],
    dialTimeout: 0,
    activeAgents: 0,
    leadsLoaded: 0,
    leadsRemaining: 0,
    contactRate: 0,
    conversionRate: 0,
    dropRate: 0,
    avgHandleTime: 0,
    // Not derivable from VICIDial's schema yet — placeholders until the
    // backend is extended (see server/README.md "Known gaps").
    description: '',
    type: row.type,
    status: row.status,
    assignedAgents: [],
  };
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  const rows = await getJson<ApiCampaign[]>('/api/campaigns');
  return rows.map(toCampaign);
}

export async function fetchLeads(campaignId?: string): Promise<Lead[]> {
  const query = campaignId ? `?campaignId=${encodeURIComponent(campaignId)}` : '';
  return getJson<Lead[]>(`/api/leads${query}`);
}

interface ApiDisposition {
  statusCode: string;
  label: string;
  selectable: boolean;
  humanAnswered: boolean;
  sale: boolean;
  dnc: boolean;
}

function toDisposition(row: ApiDisposition): Disposition {
  return {
    statusCode: row.statusCode,
    label: row.label,
    category: row.sale ? 'Sale' : row.dnc ? 'Compliance' : 'Contact',
    requiresCallback: false,
    requiresNotes: false,
    isSale: row.sale,
    isDnc: row.dnc,
    isFinal: !row.selectable,
  };
}

export async function fetchDispositions(): Promise<Disposition[]> {
  const rows = await getJson<ApiDisposition[]>('/api/dispositions');
  return rows.map(toDisposition);
}

interface ApiUser {
  id: number;
  username: string;
  fullName: string;
  userLevel: number;
  role: 'Administrator' | 'Supervisor' | 'Agent';
  userGroup: string;
  status: 'Active' | 'Inactive';
}

export interface AppUserApi {
  id: number;
  name: string;
  username: string;
  role: 'Administrator' | 'Supervisor' | 'Agent';
  team: string;
  status: 'Active' | 'Inactive' | 'Locked';
  lastLogin: string;
}

export async function fetchUsers(): Promise<AppUserApi[]> {
  const rows = await getJson<ApiUser[]>('/api/users');
  return rows.map((row) => ({
    id: row.id,
    name: row.fullName,
    username: row.username,
    role: row.role,
    team: row.userGroup,
    status: row.status,
    lastLogin: '',
  }));
}
