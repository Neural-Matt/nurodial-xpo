// Fetch wrappers for the real NuroDial backend (server/), which bridges to
// VICIDial's database. Not wired into any page yet — see server/README.md
// for why (the backend hasn't been confirmed against a real VICIDial
// install). Pages still import src/services/mock/* directly for now.
//
// When that's ready, a page swaps over by replacing its mock import with
// the matching function here — same Campaign/Lead/Disposition shapes from
// src/types/vicidial.ts, so no other code needs to change.

import type { Campaign, Lead, Disposition } from '../../types/vicidial';

const API_BASE_URL: string | undefined = import.meta.env.VITE_API_BASE_URL;

export function isApiConfigured(): boolean {
  return Boolean(API_BASE_URL);
}

async function getJson<T>(path: string): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not set — the real backend is not configured.');
  }
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request to ${path} failed with status ${response.status}`);
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
