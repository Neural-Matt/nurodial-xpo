import { Router } from 'express';
import { query } from '../db.js';
import type { ApiAgentStat } from '../types.js';

interface AgentStatRow {
  user: string;
  full_name: string;
  status: 'READY' | 'INCALL' | 'PAUSED' | 'QUEUE' | 'CLOSER' | 'MQUEUE';
  campaign_id: string;
  calls_today: number;
  status_duration_sec: number;
  pause_code: string;
  pause_code_label: string;
  extension: string;
  total_talk_sec: number;
  total_pause_sec: number;
  total_wait_sec: number;
  session_count: number;
}

export const agentStatsRouter = Router();

agentStatsRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await query<AgentStatRow>(
      `SELECT
         la.user,
         COALESCE(vu.full_name, la.user) AS full_name,
         la.status,
         COALESCE(la.campaign_id, '') AS campaign_id,
         la.calls_today,
         TIMESTAMPDIFF(SECOND, la.last_state_change, NOW()) AS status_duration_sec,
         COALESCE(la.pause_code, '') AS pause_code,
         COALESCE(pc.pause_code_name, la.pause_code, '') AS pause_code_label,
         COALESCE(la.extension, '') AS extension,
         COALESCE(al.total_talk_sec, 0)  AS total_talk_sec,
         COALESCE(al.total_pause_sec, 0) AS total_pause_sec,
         COALESCE(al.total_wait_sec, 0)  AS total_wait_sec,
         COALESCE(al.session_count, 0)   AS session_count
       FROM vicidial_live_agents la
       LEFT JOIN vicidial_users vu ON la.user = vu.user
       LEFT JOIN vicidial_pause_codes pc ON la.pause_code = pc.pause_code
       LEFT JOIN (
         SELECT user,
           SUM(talk_sec)  AS total_talk_sec,
           SUM(pause_sec) AS total_pause_sec,
           SUM(wait_sec)  AS total_wait_sec,
           COUNT(*)       AS session_count
         FROM vicidial_agent_log
         WHERE DATE(event_time) = CURDATE()
         GROUP BY user
       ) al ON la.user = al.user
       ORDER BY la.user`,
    );

    const stats: ApiAgentStat[] = rows.map((row) => ({
      user: row.user,
      fullName: row.full_name,
      status: row.status,
      campaignId: row.campaign_id,
      callsToday: row.calls_today ?? 0,
      statusDurationSec: row.status_duration_sec ?? 0,
      pauseCode: row.pause_code,
      pauseCodeLabel: row.pause_code_label,
      extension: row.extension,
      totalTalkSec: row.total_talk_sec,
      totalPauseSec: row.total_pause_sec,
      totalWaitSec: row.total_wait_sec,
      avgTalkSec: row.session_count > 0 ? Math.round(row.total_talk_sec / row.session_count) : 0,
    }));

    res.json(stats);
  } catch (err) {
    next(err);
  }
});
