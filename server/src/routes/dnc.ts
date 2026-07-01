import { Router } from 'express';
import { query } from '../db.js';
import { writeQuery } from '../writeDb.js';

// VICIdial has no separate "blacklist" table in this install -- the only
// real hit for "blacklist" in its source is an unrelated system-level IP
// access setting (system_settings.system_ip_blacklist). DNC (this table +
// vicidial_campaign_dnc) is what actually blocks phone numbers, so it
// covers "blacklisting a number" in the sense any contact center admin means.
const PHONE_PATTERN = /^[0-9]{7,18}$/;

export const dncRouter = Router();

// GET /api/dnc?search= — global DNC list (blocks the number across every campaign)
dncRouter.get('/', async (req, res, next) => {
  try {
    const { search } = req.query as { search?: string };
    const rows = await query<{ phone_number: string }>(
      `SELECT phone_number FROM vicidial_dnc ${search ? 'WHERE phone_number LIKE ?' : ''} ORDER BY phone_number LIMIT 500`,
      search ? [`%${search}%`] : [],
    );
    res.json(rows.map((r) => r.phone_number));
  } catch (err) {
    next(err);
  }
});

// POST /api/dnc — add a number to the global DNC list
dncRouter.post('/', async (req, res, next) => {
  try {
    const { phoneNumber } = req.body as { phoneNumber?: string };
    if (!phoneNumber || !PHONE_PATTERN.test(phoneNumber)) {
      return res.status(400).json({ error: 'A valid phone number (7-18 digits) is required.' });
    }
    const existing = await query<{ cnt: number }>(
      'SELECT COUNT(*) AS cnt FROM vicidial_dnc WHERE phone_number = ?',
      [phoneNumber],
    );
    if (existing[0]?.cnt) {
      return res.status(409).json({ error: `${phoneNumber} is already on the DNC list.` });
    }
    await writeQuery('INSERT INTO vicidial_dnc (phone_number) VALUES (?)', [phoneNumber]);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/dnc/:phoneNumber — remove a number from the global DNC list
dncRouter.delete('/:phoneNumber', async (req, res, next) => {
  try {
    await writeQuery('DELETE FROM vicidial_dnc WHERE phone_number = ?', [req.params.phoneNumber]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/dnc/campaign/:campaignId — DNC list scoped to one campaign
dncRouter.get('/campaign/:campaignId', async (req, res, next) => {
  try {
    const rows = await query<{ phone_number: string }>(
      'SELECT phone_number FROM vicidial_campaign_dnc WHERE campaign_id = ? ORDER BY phone_number LIMIT 500',
      [req.params.campaignId],
    );
    res.json(rows.map((r) => r.phone_number));
  } catch (err) {
    next(err);
  }
});

// POST /api/dnc/campaign — add a number to one campaign's DNC list
dncRouter.post('/campaign', async (req, res, next) => {
  try {
    const { phoneNumber, campaignId } = req.body as { phoneNumber?: string; campaignId?: string };
    if (!phoneNumber || !PHONE_PATTERN.test(phoneNumber) || !campaignId) {
      return res.status(400).json({ error: 'A valid phoneNumber and campaignId are required.' });
    }

    const existingCampaign = await query<{ cnt: number }>(
      'SELECT COUNT(*) AS cnt FROM vicidial_campaigns WHERE campaign_id = ?',
      [campaignId],
    );
    if (!existingCampaign[0]?.cnt) {
      return res.status(400).json({ error: `Campaign "${campaignId}" does not exist.` });
    }

    const existing = await query<{ cnt: number }>(
      'SELECT COUNT(*) AS cnt FROM vicidial_campaign_dnc WHERE phone_number = ? AND campaign_id = ?',
      [phoneNumber, campaignId],
    );
    if (existing[0]?.cnt) {
      return res.status(409).json({ error: `${phoneNumber} is already on ${campaignId}'s DNC list.` });
    }

    await writeQuery(
      'INSERT INTO vicidial_campaign_dnc (phone_number, campaign_id) VALUES (?, ?)',
      [phoneNumber, campaignId],
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/dnc/campaign/:campaignId/:phoneNumber
dncRouter.delete('/campaign/:campaignId/:phoneNumber', async (req, res, next) => {
  try {
    await writeQuery(
      'DELETE FROM vicidial_campaign_dnc WHERE campaign_id = ? AND phone_number = ?',
      [req.params.campaignId, req.params.phoneNumber],
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
