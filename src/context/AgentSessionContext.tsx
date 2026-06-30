import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { campaigns } from '../services/mock/campaigns';
import {
  AgentSessionContext,
  readAgentSession,
  writeAgentSession,
  type AgentSessionContextValue,
  type AvailabilityStatus,
  type ActiveCall,
  type CallMode,
  type CallDirection,
  type CallStatus,
} from './agentSessionStore';
import type { Lead } from '../types/vicidial';

function defaultCampaignFor(username: string): string | null {
  return campaigns.find((c) => c.assignedAgents.includes(username))?.campaignId ?? null;
}

export function AgentSessionProvider({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(() => {
    if (!user) return null;
    const persisted = readAgentSession(user.username);
    return persisted?.currentCampaignId ?? defaultCampaignFor(user.username);
  });
  const [availability, setAvailabilityState] = useState<AvailabilityStatus>(() => {
    if (!user) return 'Available';
    return readAgentSession(user.username)?.availability ?? 'Available';
  });
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  const persist = useCallback(
    (next: { currentCampaignId: string | null; availability: AvailabilityStatus }) => {
      if (!user) return;
      writeAgentSession(user.username, next);
    },
    [user],
  );

  const setCampaign = useCallback(
    (campaignId: string) => {
      setCurrentCampaignId(campaignId);
      persist({ currentCampaignId: campaignId, availability });
    },
    [availability, persist],
  );

  const setAvailability = useCallback(
    (status: AvailabilityStatus) => {
      if (status === 'Logged Out') {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      setAvailabilityState(status);
      persist({ currentCampaignId, availability: status });
    },
    [currentCampaignId, logout, navigate, persist],
  );

  const startCall = useCallback((lead: Lead, mode: CallMode, direction: CallDirection = 'outbound') => {
    setActiveCall({ lead, campaignId: lead.campaignId, mode, direction, status: 'ringing', startTime: Date.now() });
  }, []);

  const advanceCallStatus = useCallback((status: CallStatus) => {
    setActiveCall((prev) => (prev ? { ...prev, status } : prev));
  }, []);

  const endCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  const value = useMemo<AgentSessionContextValue>(
    () => ({ currentCampaignId, availability, activeCall, setCampaign, setAvailability, startCall, advanceCallStatus, endCall }),
    [currentCampaignId, availability, activeCall, setCampaign, setAvailability, startCall, advanceCallStatus, endCall],
  );

  return <AgentSessionContext.Provider value={value}>{children}</AgentSessionContext.Provider>;
}
