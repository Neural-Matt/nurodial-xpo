import type { Campaign, Lead, Disposition } from '../../types/vicidial';
import type { Role } from '../../types';

export type LiveAgentStatus = 'READY' | 'INCALL' | 'PAUSED' | 'QUEUE' | 'CLOSER' | 'MQUEUE';

export interface LiveAgent {
  user: string;
  fullName: string;
  status: LiveAgentStatus;
  campaignId: string;
  callsToday: number;
  statusDurationSec: number;
  pauseCode: string;
  pauseCodeLabel: string;
  extension: string;
  callerId: string;
}

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
  campaignCid: string;
  wrapupSeconds: number;
  dialTimeout: number;
  scheduledCallbacks: boolean;
  voicemailExt: string;
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
    hopperLevel: row.hopperLevel,
    localCallTime: row.localCallTime,
    campaignCid: row.campaignCid,
    wrapupSeconds: row.wrapupSeconds,
    dialTimeout: row.dialTimeout,
    scheduledCallbacks: row.scheduledCallbacks,
    voicemailExt: row.voicemailExt,
    leadOrder: '',
    dialStatuses: [],
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

export interface CreateCampaignInput {
  campaignId: string;
  campaignName: string;
  dialMethod: string;
  autoDialLevel?: number;
  hopperLevel?: number;
  localCallTime?: string;
  campaignCid?: string;
  wrapupSeconds?: number;
  dialTimeout?: number;
  scheduledCallbacks?: boolean;
  voicemailExt?: string;
}

export async function createCampaign(input: CreateCampaignInput): Promise<void> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const token = storedToken();
  const response = await fetch(`${API_BASE_URL}/api/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Failed to create campaign (${response.status})`);
  }
}

export interface UpdateCampaignInput {
  campaignName?: string;
  dialMethod?: string;
  autoDialLevel?: number;
  hopperLevel?: number;
  localCallTime?: string;
  active?: boolean;
  campaignCid?: string;
  wrapupSeconds?: number;
  dialTimeout?: number;
  scheduledCallbacks?: boolean;
  voicemailExt?: string;
}

export async function updateCampaign(campaignId: string, input: UpdateCampaignInput): Promise<void> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const token = storedToken();
  const response = await fetch(`${API_BASE_URL}/api/campaigns/${encodeURIComponent(campaignId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Failed to update campaign (${response.status})`);
  }
}

export interface ListEntry {
  listId: string;
  listName: string;
  campaignId: string;
  active: boolean;
  listDescription: string;
  leadCount: number;
}

export async function fetchLists(campaignId?: string): Promise<ListEntry[]> {
  const query = campaignId ? `?campaignId=${encodeURIComponent(campaignId)}` : '';
  return getJson<ListEntry[]>(`/api/lists${query}`);
}

export interface CreateListInput {
  listId: string;
  listName: string;
  campaignId: string;
  listDescription?: string;
}

export async function createList(input: CreateListInput): Promise<void> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const token = storedToken();
  const response = await fetch(`${API_BASE_URL}/api/lists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Failed to create list (${response.status})`);
  }
}

export interface UpdateListInput {
  listName?: string;
  campaignId?: string;
  active?: boolean;
  listDescription?: string;
}

export async function updateList(listId: string, input: UpdateListInput): Promise<void> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const token = storedToken();
  const response = await fetch(`${API_BASE_URL}/api/lists/${encodeURIComponent(listId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Failed to update list (${response.status})`);
  }
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
    // VICIdial has no native "requires callback" flag on vicidial_statuses;
    // CALLBK is the one status where a callback time is a first-class part
    // of the disposition, so we treat it as the single requiresCallback case.
    requiresCallback: row.statusCode === 'CALLBK',
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
  userGroupTwo: string;
  status: 'Active' | 'Inactive';
  email: string;
  phoneLogin: string;
}

export interface AppUserApi {
  id: number;
  name: string;
  username: string;
  role: 'Administrator' | 'Supervisor' | 'Agent';
  team: string;
  teamTwo: string;
  status: 'Active' | 'Inactive' | 'Locked';
  lastLogin: string;
  email: string;
  phoneLogin: string;
}

export async function fetchLiveAgents(): Promise<LiveAgent[]> {
  return getJson<LiveAgent[]>('/api/live-agents');
}

export interface AgentStat {
  user: string;
  fullName: string;
  status: LiveAgentStatus;
  campaignId: string;
  callsToday: number;
  statusDurationSec: number;
  pauseCode: string;
  pauseCodeLabel: string;
  extension: string;
  totalTalkSec: number;
  totalPauseSec: number;
  totalWaitSec: number;
  avgTalkSec: number;
}

export async function fetchAgentStats(): Promise<AgentStat[]> {
  return getJson<AgentStat[]>('/api/agent-stats');
}

export interface DashboardStats {
  agentsOnline: number;
  activeCalls: number;
  pausedAgents: number;
  callsToday: number;
  avgTalkSecToday: number;
  activeCampaigns: number;
  newLeads: number;
  myCallsToday: number;
  myTalkSecToday: number;
  myAvgTalkSecToday: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return getJson<DashboardStats>('/api/dashboard-stats');
}

export interface AnalyticsKpis {
  totalCalls: number;
  answeredCalls: number;
  avgHandleSec: number;
  contactRatePct: number;
  conversionRatePct: number;
  abandonedCalls: number;
}

export interface AnalyticsTrend {
  dates: string[];
  totalCalls: number[];
  answeredCalls: number[];
  abandonedCalls: number[];
}

export interface AnalyticsTopCampaign {
  rank: number;
  campaignId: string;
  campaignName: string;
  callsHandled: number;
  delta: string;
}

export interface AnalyticsAgentRow {
  user: string;
  fullName: string;
  team: string;
  role: 'Administrator' | 'Supervisor' | 'Agent';
  callsHandled: number;
  activeDays: number;
  talkTimeSec: number;
  conversions: number;
  lastLogin: string | null;
  active: boolean;
}

export interface AnalyticsResponse {
  kpis: AnalyticsKpis;
  trend: AnalyticsTrend;
  heatmap: { data: number[][] };
  topCampaigns: AnalyticsTopCampaign[];
  agentPerformance: AnalyticsAgentRow[];
}

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
  campaignId?: string;
}

export async function fetchAnalytics(params: AnalyticsParams = {}): Promise<AnalyticsResponse> {
  const qs = new URLSearchParams();
  if (params.startDate) qs.set('startDate', params.startDate);
  if (params.endDate) qs.set('endDate', params.endDate);
  if (params.campaignId) qs.set('campaignId', params.campaignId);
  const query = qs.toString();
  return getJson<AnalyticsResponse>(`/api/analytics${query ? `?${query}` : ''}`);
}

export interface AgentLead {
  leadId: string;
  listId: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  province: string;
  address: string;
  status: string;
  calledCount: number;
  vendorLeadCode: string;
  sourceId: string;
}

export interface MyAgentStatus {
  status: LiveAgentStatus;
  campaignId: string;
  extension: string;
  callerId: string;
  callsToday: number;
  statusDurationSec: number;
  leadId: string | null;
  lead: AgentLead | null;
}

export async function fetchMyAgentStatus(): Promise<MyAgentStatus> {
  return getJson<MyAgentStatus>('/api/agent/me');
}

export async function agentAction(
  fn: string,
  value: string,
  extra?: Record<string, string>,
): Promise<void> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const token = storedToken();
  const response = await fetch(`${API_BASE_URL}/api/agent/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ function: fn, value, ...extra }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `Action ${fn} failed (${response.status})`,
    );
  }
}

export interface AgentPhone {
  extension: string;
  protocol: string;
}

export async function fetchAgentPhones(): Promise<AgentPhone[]> {
  return getJson<AgentPhone[]>('/api/agent/phones');
}

export type MonitorMode = 'monitor' | 'whisper' | 'barge';

export async function monitorAgent(agentUser: string, mode: MonitorMode, extension: string): Promise<void> {
  return postJson('/api/supervisor/monitor', { agentUser, mode, extension });
}

export async function startAgentLoginSession(campaignId: string, extension: string): Promise<void> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const token = storedToken();
  const response = await fetch(`${API_BASE_URL}/api/agent/login-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ campaignId, extension }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Failed to start session (${response.status})`);
  }
}

export async function fetchUsers(): Promise<AppUserApi[]> {
  const rows = await getJson<ApiUser[]>('/api/users');
  return rows.map((row) => ({
    id: row.id,
    name: row.fullName,
    username: row.username,
    role: row.role,
    team: row.userGroup,
    teamTwo: row.userGroupTwo,
    status: row.status,
    lastLogin: '',
    email: row.email,
    phoneLogin: row.phoneLogin,
  }));
}

export interface UserGroupApi {
  userGroup: string;
  groupName: string;
}

export async function fetchUserGroups(): Promise<UserGroupApi[]> {
  return getJson<UserGroupApi[]>('/api/users/groups');
}

export interface CreateUserInput {
  username: string;
  password: string;
  fullName: string;
  role: 'Administrator' | 'Supervisor' | 'Agent';
  userGroup?: string;
  userGroupTwo?: string;
  email?: string;
  phoneLogin?: string;
  phonePass?: string;
}

export async function createUser(input: CreateUserInput): Promise<void> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const token = storedToken();
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Failed to create user (${response.status})`);
  }
}

export interface UpdateUserInput {
  fullName?: string;
  role?: 'Administrator' | 'Supervisor' | 'Agent';
  userGroup?: string;
  active?: boolean;
  password?: string;
  userGroupTwo?: string;
  email?: string;
  phoneLogin?: string;
  phonePass?: string;
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<void> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const token = storedToken();
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Failed to update user (${response.status})`);
  }
}

export interface ScheduledCallback {
  callbackId: string;
  leadId: string;
  listId: string;
  campaignId: string;
  callbackTime: string;
  user: string;
  recipient: 'USERONLY' | 'ANYONE';
  comments: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
}

export async function fetchCallbacks(): Promise<ScheduledCallback[]> {
  return getJson<ScheduledCallback[]>('/api/callbacks');
}

export interface CreateCallbackInput {
  leadId: string;
  listId?: string;
  campaignId: string;
  callbackTime: string;
  comments?: string;
  recipient?: 'USERONLY' | 'ANYONE';
}

export async function createCallback(input: CreateCallbackInput): Promise<void> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const token = storedToken();
  const response = await fetch(`${API_BASE_URL}/api/callbacks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Failed to schedule callback (${response.status})`);
  }
}

export async function cancelCallback(callbackId: string): Promise<void> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const token = storedToken();
  const response = await fetch(`${API_BASE_URL}/api/callbacks/${encodeURIComponent(callbackId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Failed to cancel callback (${response.status})`);
  }
}

export interface CallLogEntry {
  uniqueId: string;
  leadId: string;
  campaignId: string;
  callDate: string;
  durationSec: number;
  statusCode: string;
  statusName: string;
  phoneNumber: string;
  user: string;
  userFullName: string;
  leadFirstName: string;
  leadLastName: string;
  termReason: string;
}

export interface CallLogParams {
  startDate?: string;
  endDate?: string;
  campaignId?: string;
  user?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface CallLogResponse {
  total: number;
  calls: CallLogEntry[];
}

export async function fetchCallLog(params: CallLogParams = {}): Promise<CallLogResponse> {
  const search = new URLSearchParams();
  if (params.startDate) search.set('startDate', params.startDate);
  if (params.endDate) search.set('endDate', params.endDate);
  if (params.campaignId) search.set('campaignId', params.campaignId);
  if (params.user) search.set('user', params.user);
  if (params.status) search.set('status', params.status);
  if (params.limit) search.set('limit', String(params.limit));
  if (params.offset) search.set('offset', String(params.offset));
  const qs = search.toString();
  return getJson<CallLogResponse>(`/api/call-log${qs ? `?${qs}` : ''}`);
}

// Loops through every page (the backend caps a single request at 200 rows)
// to gather every matching row for CSV export, ignoring on-screen pagination.
export async function fetchAllCallLog(params: Omit<CallLogParams, 'limit' | 'offset'> = {}): Promise<CallLogEntry[]> {
  const pageSize = 200;
  let offset = 0;
  const all: CallLogEntry[] = [];
  for (;;) {
    const page = await fetchCallLog({ ...params, limit: pageSize, offset });
    all.push(...page.calls);
    if (page.calls.length === 0 || all.length >= page.total) break;
    offset += pageSize;
  }
  return all;
}

async function postJson(path: string, body: unknown): Promise<void> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const token = storedToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const responseBody = await response.json().catch(() => ({}));
    throw new Error((responseBody as { error?: string }).error ?? `Request to ${path} failed (${response.status})`);
  }
}

async function deleteJson(path: string): Promise<void> {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not set.');
  const token = storedToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const responseBody = await response.json().catch(() => ({}));
    throw new Error((responseBody as { error?: string }).error ?? `Request to ${path} failed (${response.status})`);
  }
}

export async function fetchDncList(search?: string): Promise<string[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  return getJson<string[]>(`/api/dnc${qs}`);
}

export async function addToDnc(phoneNumber: string): Promise<void> {
  return postJson('/api/dnc', { phoneNumber });
}

export async function removeFromDnc(phoneNumber: string): Promise<void> {
  return deleteJson(`/api/dnc/${encodeURIComponent(phoneNumber)}`);
}

export async function fetchCampaignDnc(campaignId: string): Promise<string[]> {
  return getJson<string[]>(`/api/dnc/campaign/${encodeURIComponent(campaignId)}`);
}

export async function addToCampaignDnc(campaignId: string, phoneNumber: string): Promise<void> {
  return postJson('/api/dnc/campaign', { phoneNumber, campaignId });
}

export async function removeFromCampaignDnc(campaignId: string, phoneNumber: string): Promise<void> {
  return deleteJson(`/api/dnc/campaign/${encodeURIComponent(campaignId)}/${encodeURIComponent(phoneNumber)}`);
}
