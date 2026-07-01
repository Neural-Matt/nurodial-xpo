import { Router } from 'express';
import { query } from '../db.js';
import { writeQuery } from '../writeDb.js';
import type { ApiCallback } from '../types.js';

// VICIdial's own agent/admin screens (agc/vdc_db_query.php, vicidial/non_agent_api.php)
// insert callbacks with status='ACTIVE', which a background process promotes to
// 'LIVE' once callback_time is imminent. Cancelling sets status='INACTIVE'. We
// follow the same convention so rows created here behave like native ones.
interface CallbackRow {
  callback_id: number;
  lead_id: number | null;
  list_id: string | null;
  campaign_id: string | null;
  callback_time: string | null;
  user: string | null;
  recipient: 'USERONLY' | 'ANYONE' | null;
  comments: string | null;
  phone_number: string | null;
  first_name: string | null;
  last_name: string | null;
}

export const callbacksRouter = Router();

// GET /api/callbacks — agents see only their own pending callbacks;
// supervisors/admins see all pending callbacks across the system.
callbacksRouter.get('/', async (req, res, next) => {
  try {
    const { sub: username, role } = req.jwtUser!;
    const scopeOwn = role === 'Agent';

    const rows = await query<CallbackRow>(
      `SELECT cb.callback_id, cb.lead_id, cb.list_id, cb.campaign_id,
              cb.callback_time, cb.user, cb.recipient, cb.comments,
              vl.phone_number, vl.first_name, vl.last_name
       FROM vicidial_callbacks cb
       LEFT JOIN vicidial_list vl ON cb.lead_id = vl.lead_id
       WHERE cb.status IN ('ACTIVE', 'LIVE') ${scopeOwn ? 'AND cb.user = ?' : ''}
       ORDER BY cb.callback_time ASC`,
      scopeOwn ? [username] : [],
    );

    const callbacks: ApiCallback[] = rows.map((r) => ({
      callbackId: String(r.callback_id),
      leadId: r.lead_id ? String(r.lead_id) : '',
      listId: r.list_id ?? '',
      campaignId: r.campaign_id ?? '',
      callbackTime: r.callback_time ?? '',
      user: r.user ?? '',
      recipient: r.recipient ?? 'USERONLY',
      comments: r.comments ?? '',
      phoneNumber: r.phone_number ?? '',
      firstName: r.first_name ?? '',
      lastName: r.last_name ?? '',
    }));
    res.json(callbacks);
  } catch (err) {
    next(err);
  }
});

// POST /api/callbacks — schedule a new callback for a lead.
callbacksRouter.post('/', async (req, res, next) => {
  try {
    const username = req.jwtUser!.sub;
    const { leadId, listId, campaignId, callbackTime, comments, recipient } = req.body as {
      leadId?: string;
      listId?: string;
      campaignId?: string;
      callbackTime?: string;
      comments?: string;
      recipient?: 'USERONLY' | 'ANYONE';
    };

    if (!leadId || !campaignId || !callbackTime) {
      return res.status(400).json({ error: 'leadId, campaignId, and callbackTime are required.' });
    }

    await writeQuery(
      `INSERT INTO vicidial_callbacks
         (lead_id, list_id, campaign_id, status, entry_time, callback_time, user, recipient, comments, lead_status)
       VALUES (?, ?, ?, 'ACTIVE', NOW(), ?, ?, ?, ?, 'CALLBK')`,
      [leadId, listId || null, campaignId, callbackTime, username, recipient ?? 'USERONLY', comments ?? ''],
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/callbacks/:id — cancel a scheduled callback. Agents may only
// cancel their own; supervisors/admins may cancel any.
callbacksRouter.patch('/:id', async (req, res, next) => {
  try {
    const { sub: username, role } = req.jwtUser!;
    const { id } = req.params;

    const scopeOwn = role === 'Agent';
    await writeQuery(
      `UPDATE vicidial_callbacks SET status = 'INACTIVE'
       WHERE callback_id = ? AND status IN ('ACTIVE', 'LIVE') ${scopeOwn ? 'AND user = ?' : ''}`,
      scopeOwn ? [id, username] : [id],
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
