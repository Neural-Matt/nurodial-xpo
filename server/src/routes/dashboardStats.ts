import { Router } from 'express';
import { query } from '../db.js';
import type { ApiDashboardStats } from '../types.js';

interface GlobalRow {
  agents_online: number;
  active_calls: number;
  paused_agents: number;
  calls_today: number;
  avg_talk_sec_today: number;
  active_campaigns: number;
  new_leads: number;
}

interface AgentRow {
  my_calls_today: number;
  my_talk_sec_today: number;
  my_avg_talk_sec_today: number;
}

export const dashboardStatsRouter = Router();

dashboardStatsRouter.get('/', async (req, res, next) => {
  try {
    const [globalRow] = await query<GlobalRow>(
      `SELECT
         (SELECT COUNT(*) FROM vicidial_live_agents)                                         AS agents_online,
         (SELECT COUNT(*) FROM vicidial_live_agents WHERE status IN ('INCALL','CLOSER'))     AS active_calls,
         (SELECT COUNT(*) FROM vicidial_live_agents WHERE status = 'PAUSED')                 AS paused_agents,
         (SELECT COUNT(*) FROM vicidial_agent_log WHERE DATE(event_time) = CURDATE())        AS calls_today,
         (SELECT COALESCE(AVG(talk_sec),0) FROM vicidial_agent_log
            WHERE DATE(event_time) = CURDATE() AND talk_sec > 0)                             AS avg_talk_sec_today,
         (SELECT COUNT(*) FROM vicidial_campaigns WHERE active = 'Y')                        AS active_campaigns,
         (SELECT COUNT(*) FROM vicidial_list WHERE status = 'NEW')                           AS new_leads`,
    );

    // Agent-scoped stats — only run when the caller is an agent
    let agentRow: AgentRow = { my_calls_today: 0, my_talk_sec_today: 0, my_avg_talk_sec_today: 0 };
    const callerUser = req.jwtUser?.sub;
    if (callerUser && req.jwtUser?.role === 'Agent') {
      const rows = await query<AgentRow>(
        `SELECT
           COALESCE(COUNT(*), 0)          AS my_calls_today,
           COALESCE(SUM(talk_sec), 0)     AS my_talk_sec_today,
           COALESCE(AVG(talk_sec), 0)     AS my_avg_talk_sec_today
         FROM vicidial_agent_log
         WHERE user = ? AND DATE(event_time) = CURDATE()`,
        [callerUser],
      );
      if (rows.length) agentRow = rows[0];
    }

    const stats: ApiDashboardStats = {
      agentsOnline:      globalRow?.agents_online      ?? 0,
      activeCalls:       globalRow?.active_calls        ?? 0,
      pausedAgents:      globalRow?.paused_agents       ?? 0,
      callsToday:        globalRow?.calls_today         ?? 0,
      avgTalkSecToday:   Math.round(globalRow?.avg_talk_sec_today ?? 0),
      activeCampaigns:   globalRow?.active_campaigns    ?? 0,
      newLeads:          globalRow?.new_leads           ?? 0,
      myCallsToday:      agentRow.my_calls_today,
      myTalkSecToday:    agentRow.my_talk_sec_today,
      myAvgTalkSecToday: Math.round(agentRow.my_avg_talk_sec_today),
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
});
