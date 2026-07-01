import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import {
  fetchMyAgentStatus,
  agentAction,
  startAgentLoginSession,
  isApiConfigured,
  type MyAgentStatus,
  type AgentLead,
} from '../services/api/client';
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

const POLL_MS = 5_000;

function agentLeadToLead(al: AgentLead, campaignId: string): Lead {
  return {
    leadId: al.leadId,
    listId: al.listId,
    campaignId,
    phoneNumber: al.phoneNumber,
    phoneCode: '1',
    firstName: al.firstName,
    lastName: al.lastName,
    email: al.email,
    province: al.province,
    city: al.city,
    address: al.address,
    vendorLeadCode: al.vendorLeadCode,
    sourceId: al.sourceId,
    status: al.status,
    calledCount: al.calledCount,
    lastCallTime: '',
    nextCallbackTime: '',
    customFields: {},
  };
}

function viciStatusToAvailability(status: MyAgentStatus['status']): AvailabilityStatus {
  switch (status) {
    case 'READY':
    case 'QUEUE':
      return 'Available';
    case 'INCALL':
    case 'CLOSER':
    case 'MQUEUE':
      return 'On Call';
    case 'PAUSED':
      return 'Break';
    default:
      return 'Available';
  }
}

export function AgentSessionProvider({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(() => {
    if (!user) return null;
    return readAgentSession(user.username)?.currentCampaignId ?? null;
  });
  const [availability, setAvailabilityState] = useState<AvailabilityStatus>(() => {
    if (!user) return 'Available';
    return readAgentSession(user.username)?.availability ?? 'Available';
  });
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [hasViciSession, setHasViciSession] = useState<boolean | null>(null);

  // Track the lead id currently displayed so polling doesn't restart the timer on every tick
  const activeLeadIdRef = useRef<string | null>(null);
  const pollInFlightRef = useRef(false);
  // Preserve mutable availability for the polling closure without re-registering the effect
  const availabilityRef = useRef(availability);
  availabilityRef.current = availability;
  const currentCampaignIdRef = useRef(currentCampaignId);
  currentCampaignIdRef.current = currentCampaignId;

  const persist = useCallback(
    (next: { currentCampaignId: string | null; availability: AvailabilityStatus }) => {
      if (user) writeAgentSession(user.username, next);
    },
    [user],
  );

  // Real-data polling — runs whenever API is configured
  useEffect(() => {
    if (!isApiConfigured()) return;

    const doFetch = () => {
      if (pollInFlightRef.current) return;
      pollInFlightRef.current = true;

      fetchMyAgentStatus()
        .then((s) => {
          setHasViciSession(true);
          // Sync campaign if VICIdial tells us the agent is in a different one
          if (s.campaignId && s.campaignId !== currentCampaignIdRef.current) {
            setCurrentCampaignId(s.campaignId);
            persist({
              currentCampaignId: s.campaignId,
              availability: availabilityRef.current,
            });
          }

          const isOnCall =
            s.status === 'INCALL' || s.status === 'CLOSER' || s.status === 'MQUEUE';

          if (isOnCall && s.lead) {
            const leadId = s.lead.leadId;
            if (leadId !== activeLeadIdRef.current) {
              activeLeadIdRef.current = leadId;
              setActiveCall({
                lead: agentLeadToLead(s.lead, s.campaignId),
                campaignId: s.campaignId,
                mode: 'auto',
                direction: 'outbound',
                status: 'connected',
                startTime: Date.now(),
              });
            }
          } else if (!isOnCall) {
            if (activeLeadIdRef.current !== null) {
              activeLeadIdRef.current = null;
              // If we were in wrapup (disposition pending), leave it so the agent can submit dispo.
              // Otherwise clear the call — VICIdial already moved the agent to READY/PAUSED.
              setActiveCall((prev) => (prev?.status === 'wrapup' ? prev : null));
            }
            // Keep UI availability in sync with VICIdial status
            const derived = viciStatusToAvailability(s.status);
            if (derived !== availabilityRef.current) {
              setAvailabilityState(derived);
            }
          }
        })
        .catch(() => {
          // 404 = not logged into VICIdial — dialer shows its own banner
          setHasViciSession(false);
        })
        .finally(() => {
          pollInFlightRef.current = false;
        });
    };

    doFetch();
    const id = setInterval(doFetch, POLL_MS);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setCampaign = useCallback(
    (campaignId: string) => {
      setCurrentCampaignId(campaignId);
      persist({ currentCampaignId: campaignId, availability });
    },
    [availability, persist],
  );

  const setAvailability = useCallback(
    async (status: AvailabilityStatus) => {
      if (status === 'Logged Out') {
        if (isApiConfigured()) {
          await agentAction('logout', '1').catch(() => {});
        }
        logout();
        navigate('/login', { replace: true });
        return;
      }

      if (isApiConfigured()) {
        // Let a failed write reject — callers need to know VICIdial didn't
        // actually change state, instead of silently showing a status the
        // agent isn't really in.
        const viciValue = status === 'Available' ? 'RESUME' : 'PAUSE';
        await agentAction('external_pause', viciValue);
      }

      setAvailabilityState(status);
      persist({ currentCampaignId, availability: status });
    },
    [currentCampaignId, logout, navigate, persist],
  );

  const startViciSession = useCallback(async (campaignId: string, extension: string) => {
    await startAgentLoginSession(campaignId, extension);
    setHasViciSession(true);
    setCampaign(campaignId);
  }, [setCampaign]);

  const startCall = useCallback(async (lead: Lead, mode: CallMode, direction: CallDirection = 'outbound') => {
    if (isApiConfigured() && direction === 'outbound') {
      try {
        await agentAction('external_dial', lead.phoneNumber.replace(/\D/g, ''), {
          phone_code: lead.phoneCode || '1',
          search: 'Y',
          preview: mode === 'preview' ? 'Y' : 'N',
          focus: 'Y',
          ...(lead.leadId && !lead.leadId.startsWith('AD-HOC')
            ? { vendor_id: lead.leadId }
            : {}),
        });
        // Polling will detect INCALL and set activeCall
      } catch {
        // Campaign may not have api_manual_dial — fall back to local mock call
        setActiveCall({
          lead,
          campaignId: lead.campaignId,
          mode,
          direction,
          status: 'ringing',
          startTime: Date.now(),
        });
      }
    } else {
      setActiveCall({
        lead,
        campaignId: lead.campaignId,
        mode,
        direction,
        status: 'ringing',
        startTime: Date.now(),
      });
    }
  }, []);

  const advanceCallStatus = useCallback((status: CallStatus) => {
    setActiveCall((prev) => (prev ? { ...prev, status } : prev));
  }, []);

  const endCall = useCallback(async () => {
    if (isApiConfigured() && activeLeadIdRef.current) {
      await agentAction('external_hangup', '1').catch(() => {});
    }
    activeLeadIdRef.current = null;
    setActiveCall(null);
  }, []);

  const submitDisposition = useCallback(async (statusCode: string): Promise<void> => {
    if (isApiConfigured()) {
      await agentAction('external_status', statusCode);
    }
    activeLeadIdRef.current = null;
    setActiveCall(null);
  }, []);

  const value = useMemo<AgentSessionContextValue>(
    () => ({
      currentCampaignId,
      availability,
      activeCall,
      hasViciSession,
      setCampaign,
      setAvailability,
      startViciSession,
      startCall,
      advanceCallStatus,
      endCall,
      submitDisposition,
    }),
    [
      currentCampaignId,
      availability,
      activeCall,
      hasViciSession,
      setCampaign,
      setAvailability,
      startViciSession,
      startCall,
      advanceCallStatus,
      endCall,
      submitDisposition,
    ],
  );

  return <AgentSessionContext.Provider value={value}>{children}</AgentSessionContext.Provider>;
}
