import { Router } from 'express';
import { query } from '../db.js';

// vicidial_closer_log (calls transferred to a closer agent) is a rarer,
// specialized scenario -- out of scope for this first pass. vicidial_log
// covers every standard call attempt/disposition.
interface CallLogRow {
  uniqueid: string;
  lead_id: number;
  campaign_id: string | null;
  call_date: string;
  length_in_sec: number | null;
  status: string | null;
  status_name: string | null;
  phone_number: string | null;
  user: string | null;
  user_full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  term_reason: string;
}

export const callLogRouter = Router();

// GET /api/call-log — agents see only their own calls; Supervisors/Admins
// see all calls, optionally filtered by campaignId/user.
callLogRouter.get('/', async (req, res, next) => {
  try {
    const { sub: username, role } = req.jwtUser!;
    const isAgent = role === 'Agent';

    const { startDate, endDate, campaignId, user, limit, offset } = req.query as Record<string, string | undefined>;
    const start = startDate || '1970-01-01';
    const end = endDate || '2100-01-01';
    const pageLimit = Math.min(Number(limit) || 50, 200);
    const pageOffset = Number(offset) || 0;

    const conditions = ['vl.call_date BETWEEN ? AND ?'];
    const params: unknown[] = [start, `${end} 23:59:59`];

    if (isAgent) {
      conditions.push('vl.user = ?');
      params.push(username);
    } else if (user) {
      conditions.push('vl.user = ?');
      params.push(user);
    }
    if (campaignId) {
      conditions.push('vl.campaign_id = ?');
      params.push(campaignId);
    }

    const whereClause = conditions.join(' AND ');

    const countRows = await query<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM vicidial_log vl WHERE ${whereClause}`,
      params,
    );

    const rows = await query<CallLogRow>(
      `SELECT vl.uniqueid, vl.lead_id, vl.campaign_id, vl.call_date, vl.length_in_sec, vl.status,
              vs.status_name, vl.phone_number, vl.user, vu.full_name AS user_full_name,
              vlist.first_name, vlist.last_name, vl.term_reason
       FROM vicidial_log vl
       LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
       LEFT JOIN vicidial_users vu ON vl.user = vu.user
       LEFT JOIN vicidial_list vlist ON vl.lead_id = vlist.lead_id
       WHERE ${whereClause}
       ORDER BY vl.call_date DESC
       LIMIT ? OFFSET ?`,
      [...params, pageLimit, pageOffset],
    );

    res.json({
      total: countRows[0]?.cnt ?? 0,
      calls: rows.map((r) => ({
        uniqueId: r.uniqueid,
        leadId: String(r.lead_id),
        campaignId: r.campaign_id ?? '',
        callDate: r.call_date,
        durationSec: r.length_in_sec ?? 0,
        statusCode: r.status ?? '',
        statusName: r.status_name ?? r.status ?? '',
        phoneNumber: r.phone_number ?? '',
        user: r.user ?? '',
        userFullName: r.user_full_name?.trim() || r.user || '',
        leadFirstName: r.first_name ?? '',
        leadLastName: r.last_name ?? '',
        termReason: r.term_reason,
      })),
    });
  } catch (err) {
    next(err);
  }
});
