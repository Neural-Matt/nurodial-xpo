import { createContext } from 'react';
import type { StatusTone } from '../components/common/StatusBadge';
import type { Lead } from '../types/vicidial';

export type AvailabilityStatus =
  | 'Available'
  | 'On Call'
  | 'Wrap-Up'
  | 'Break'
  | 'Lunch'
  | 'Meeting'
  | 'Training'
  | 'Offline'
  | 'Logged Out';

// Statuses an agent can directly pick. 'On Call' is excluded: it's derived
// from activeCall and never set directly. 'Logged Out' IS selectable here —
// picking it triggers a real logout side effect (see AgentSessionContext).
export const SELECTABLE_AVAILABILITY: AvailabilityStatus[] = [
  'Available',
  'Wrap-Up',
  'Break',
  'Lunch',
  'Meeting',
  'Training',
  'Offline',
  'Logged Out',
];

export const AVAILABILITY_TONE: Record<AvailabilityStatus, StatusTone> = {
  Available: 'success',
  'On Call': 'info',
  'Wrap-Up': 'warning',
  Break: 'warning',
  Lunch: 'warning',
  Meeting: 'primary',
  Training: 'primary',
  Offline: 'neutral',
  'Logged Out': 'neutral',
};

export type CallMode = 'manual' | 'auto' | 'preview' | 'click-to-call';
export type CallDirection = 'inbound' | 'outbound';
export type CallStatus = 'ringing' | 'connected' | 'hold' | 'wrapup';

export interface ActiveCall {
  lead: Lead;
  campaignId: string;
  mode: CallMode;
  direction: CallDirection;
  status: CallStatus;
  startTime: number;
}

export interface AgentSessionContextValue {
  currentCampaignId: string | null;
  availability: AvailabilityStatus;
  activeCall: ActiveCall | null;
  setCampaign: (campaignId: string) => void;
  setAvailability: (status: AvailabilityStatus) => void;
  startCall: (lead: Lead, mode: CallMode, direction?: CallDirection) => void;
  advanceCallStatus: (status: CallStatus) => void;
  endCall: () => void;
}

export const AgentSessionContext = createContext<AgentSessionContextValue | undefined>(undefined);

// 'On Call'/'Wrap-Up' are derived from the active call's lifecycle, not the
// stored value — this is the single place that derivation happens so the
// TopBar, the Availability page, and the Dialer never drift out of sync.
export function derivedAvailability(activeCall: ActiveCall | null, availability: AvailabilityStatus): AvailabilityStatus {
  if (!activeCall) return availability;
  return activeCall.status === 'wrapup' ? 'Wrap-Up' : 'On Call';
}

interface PersistedAgentSession {
  currentCampaignId: string | null;
  availability: AvailabilityStatus;
}

function storageKey(username: string): string {
  return `nurodial.agentSession.${username}`;
}

export function readAgentSession(username: string): PersistedAgentSession | null {
  const raw = localStorage.getItem(storageKey(username));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedAgentSession;
  } catch {
    return null;
  }
}

export function writeAgentSession(username: string, data: PersistedAgentSession): void {
  localStorage.setItem(storageKey(username), JSON.stringify(data));
}
