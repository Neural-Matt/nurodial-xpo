import { Router } from 'express';
import { query } from '../db.js';
import type { ApiLiveAgent } from '../types.js';

interface LiveAgentRow {
  user: string;
  status: 'READY' | 'INCALL' | 'PAUSED' | 'QUEUE' | 'CLOSER' | 'MQUEUE';
  campaign_id: string;
  calls_today: number;
  status_duration_sec: number;
  pause_code: string;
  pause_code_label: string;
  extension: string;
  callerid: string;
  full_name: string;
}

export const liveAgentsRouter = Router();

liveAgentsRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await query<LiveAgentRow>(
      `SELECT
         la.user,
         la.status,
         COALESCE(la.campaign_id, '') AS campaign_id,
         la.calls_today,
         TIMESTAMPDIFF(SECOND, la.last_state_change, NOW()) AS status_duration_sec,
         COALESCE(la.pause_code, '') AS pause_code,
         COALESCE(pc.pause_code_name, la.pause_code, '') AS pause_code_label,
         COALESCE(la.extension, '') AS extension,
         COALESCE(la.callerid, '') AS callerid,
         COALESCE(vu.full_name, la.user) AS full_name
       FROM vicidial_live_agents la
       LEFT JOIN vicidial_users vu ON la.user = vu.user
       LEFT JOIN vicidial_pause_codes pc ON la.pause_code = pc.pause_code
       ORDER BY la.user`,
    );

    const agents: ApiLiveAgent[] = rows.map((row) => ({
      user: row.user,
      fullName: row.full_name,
      status: row.status,
      campaignId: row.campaign_id,
      callsToday: row.calls_today ?? 0,
      statusDurationSec: row.status_duration_sec ?? 0,
      pauseCode: row.pause_code,
      pauseCodeLabel: row.pause_code_label,
      extension: row.extension,
      callerId: row.callerid,
    }));

    res.json(agents);
  } catch (err) {
    next(err);
  }
});
