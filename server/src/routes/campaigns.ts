import { Router } from 'express';
import { query } from '../db.js';
import { writeQuery } from '../writeDb.js';
import type { ApiCampaign } from '../types.js';

// Column names reflect documented VICIDial schema but are NOT verified
// against this specific install yet. Run `DESCRIBE vicidial_campaigns;` on
// the real DB and adjust below if anything doesn't match.
interface CampaignRow {
  campaign_id: string;
  campaign_name: string;
  active: 'Y' | 'N';
  dial_method: string;
  auto_dial_level: number | null;
  hopper_level: number | null;
  local_call_time: string | null;
  campaign_cid: string | null;
  wrapup_seconds: number | null;
  dial_timeout: number | null;
  scheduled_callbacks: 'Y' | 'N' | null;
  voicemail_ext: string | null;
}

const ALLOWED_DIAL_METHODS = [
  'MANUAL', 'RATIO', 'ADAPT_HARD_LIMIT', 'ADAPT_TAPERED', 'ADAPT_AVERAGE', 'ADAPT_PERCENTMAX',
  'INBOUND_MAN', 'SHARED_RATIO', 'SHARED_ADAPT_HARD_LIMIT', 'SHARED_ADAPT_TAPERED',
  'SHARED_ADAPT_AVERAGE', 'SHARED_ADAPT_PERCENTMAX',
];
const CAMPAIGN_ID_PATTERN = /^[A-Za-z0-9_]{2,8}$/;

export const campaignsRouter = Router();

function toApiCampaign(row: CampaignRow): ApiCampaign {
  return {
    campaignId: row.campaign_id,
    campaignName: row.campaign_name,
    active: row.active === 'Y',
    dialMethod: row.dial_method,
    autoDialLevel: row.auto_dial_level ?? 0,
    hopperLevel: row.hopper_level ?? 0,
    localCallTime: row.local_call_time ?? '',
    campaignCid: row.campaign_cid ?? '',
    wrapupSeconds: row.wrapup_seconds ?? 0,
    dialTimeout: row.dial_timeout ?? 0,
    scheduledCallbacks: row.scheduled_callbacks === 'Y',
    voicemailExt: row.voicemail_ext ?? '',
    // Best-effort derivation — VICIDial doesn't store a "Blended" flag on
    // this table; a campaign with both an inbound group and outbound
    // dialing would need a join against vicidial_inbound_groups to detect.
    type: row.dial_method === 'INBOUND_MAN' ? 'Inbound' : 'Outbound',
    status: row.active === 'Y' ? 'Active' : 'Paused',
  };
}

campaignsRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await query<CampaignRow>(
      `SELECT campaign_id, campaign_name, active, dial_method, auto_dial_level, hopper_level, local_call_time,
              campaign_cid, wrapup_seconds, dial_timeout, scheduled_callbacks, voicemail_ext
       FROM vicidial_campaigns
       ORDER BY campaign_name`,
    );
    res.json(rows.map(toApiCampaign));
  } catch (err) {
    next(err);
  }
});

// POST /api/campaigns — create a new campaign
campaignsRouter.post('/', async (req, res, next) => {
  try {
    const {
      campaignId, campaignName, dialMethod, autoDialLevel, hopperLevel, localCallTime,
      campaignCid, wrapupSeconds, dialTimeout, scheduledCallbacks, voicemailExt,
    } = req.body as {
      campaignId?: string; campaignName?: string; dialMethod?: string;
      autoDialLevel?: number; hopperLevel?: number; localCallTime?: string;
      campaignCid?: string; wrapupSeconds?: number; dialTimeout?: number;
      scheduledCallbacks?: boolean; voicemailExt?: string;
    };

    if (!campaignId || !campaignName || !dialMethod) {
      return res.status(400).json({ error: 'campaignId, campaignName, and dialMethod are required.' });
    }
    if (!CAMPAIGN_ID_PATTERN.test(campaignId)) {
      return res.status(400).json({ error: 'Campaign ID must be 2-8 characters (letters, numbers, underscore only).' });
    }
    if (!ALLOWED_DIAL_METHODS.includes(dialMethod)) {
      return res.status(400).json({ error: `dialMethod must be one of: ${ALLOWED_DIAL_METHODS.join(', ')}.` });
    }

    const existing = await query<{ cnt: number }>(
      'SELECT COUNT(*) AS cnt FROM vicidial_campaigns WHERE campaign_id = ?',
      [campaignId],
    );
    if (existing[0]?.cnt) {
      return res.status(409).json({ error: `Campaign ID "${campaignId}" already exists.` });
    }

    await writeQuery(
      `INSERT INTO vicidial_campaigns
         (campaign_id, campaign_name, active, dial_method, auto_dial_level, hopper_level, local_call_time,
          campaign_cid, wrapup_seconds, dial_timeout, scheduled_callbacks, voicemail_ext)
       VALUES (?, ?, 'Y', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        campaignId, campaignName, dialMethod, autoDialLevel ?? 0, hopperLevel ?? 1, localCallTime || '9am-9pm',
        campaignCid || '0000000000', wrapupSeconds ?? 0, dialTimeout ?? 60,
        scheduledCallbacks ? 'Y' : 'N', voicemailExt || '',
      ],
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/campaigns/:campaignId — edit settings or toggle active
campaignsRouter.patch('/:campaignId', async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const {
      campaignName, dialMethod, autoDialLevel, hopperLevel, localCallTime, active,
      campaignCid, wrapupSeconds, dialTimeout, scheduledCallbacks, voicemailExt,
    } = req.body as {
      campaignName?: string; dialMethod?: string; autoDialLevel?: number;
      hopperLevel?: number; localCallTime?: string; active?: boolean;
      campaignCid?: string; wrapupSeconds?: number; dialTimeout?: number;
      scheduledCallbacks?: boolean; voicemailExt?: string;
    };

    const existing = await query<{ cnt: number }>(
      'SELECT COUNT(*) AS cnt FROM vicidial_campaigns WHERE campaign_id = ?',
      [campaignId],
    );
    if (!existing[0]?.cnt) {
      return res.status(404).json({ error: `Campaign "${campaignId}" not found.` });
    }
    if (dialMethod && !ALLOWED_DIAL_METHODS.includes(dialMethod)) {
      return res.status(400).json({ error: `dialMethod must be one of: ${ALLOWED_DIAL_METHODS.join(', ')}.` });
    }

    const sets: string[] = [];
    const params: unknown[] = [];
    if (campaignName) { sets.push('campaign_name = ?'); params.push(campaignName); }
    if (dialMethod) { sets.push('dial_method = ?'); params.push(dialMethod); }
    if (autoDialLevel !== undefined) { sets.push('auto_dial_level = ?'); params.push(autoDialLevel); }
    if (hopperLevel !== undefined) { sets.push('hopper_level = ?'); params.push(hopperLevel); }
    if (localCallTime) { sets.push('local_call_time = ?'); params.push(localCallTime); }
    if (active !== undefined) { sets.push('active = ?'); params.push(active ? 'Y' : 'N'); }
    if (campaignCid !== undefined) { sets.push('campaign_cid = ?'); params.push(campaignCid); }
    if (wrapupSeconds !== undefined) { sets.push('wrapup_seconds = ?'); params.push(wrapupSeconds); }
    if (dialTimeout !== undefined) { sets.push('dial_timeout = ?'); params.push(dialTimeout); }
    if (scheduledCallbacks !== undefined) { sets.push('scheduled_callbacks = ?'); params.push(scheduledCallbacks ? 'Y' : 'N'); }
    if (voicemailExt !== undefined) { sets.push('voicemail_ext = ?'); params.push(voicemailExt); }

    if (!sets.length) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    params.push(campaignId);
    await writeQuery(`UPDATE vicidial_campaigns SET ${sets.join(', ')} WHERE campaign_id = ?`, params);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
