import { useContext } from 'react';
import { AgentSessionContext, type AgentSessionContextValue } from './agentSessionStore';

export function useAgentSession(): AgentSessionContextValue {
  const ctx = useContext(AgentSessionContext);
  if (!ctx) throw new Error('useAgentSession must be used within an AgentSessionProvider');
  return ctx;
}
