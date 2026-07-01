import { Router } from 'express';
import { query } from '../db.js';
import { writeQuery } from '../writeDb.js';
import type { ApiList } from '../types.js';

interface ListRow {
  list_id: string;
  list_name: string;
  campaign_id: string | null;
  active: 'Y' | 'N';
  list_description: string | null;
  lead_count: number;
}

const LIST_ID_PATTERN = /^[0-9]{1,14}$/;

export const listsRouter = Router();

// GET /api/lists?campaignId= — optionally scoped to one campaign
listsRouter.get('/', async (req, res, next) => {
  try {
    const { campaignId } = req.query as { campaignId?: string };
    const rows = await query<ListRow>(
      `SELECT vls.list_id, vls.list_name, vls.campaign_id, vls.active, vls.list_description,
              (SELECT COUNT(*) FROM vicidial_list vl WHERE vl.list_id = vls.list_id) AS lead_count
       FROM vicidial_lists vls
       ${campaignId ? 'WHERE vls.campaign_id = ?' : ''}
       ORDER BY vls.list_id`,
      campaignId ? [campaignId] : [],
    );
    const lists: ApiList[] = rows.map((r) => ({
      listId: String(r.list_id),
      listName: r.list_name ?? '',
      campaignId: r.campaign_id ?? '',
      active: r.active === 'Y',
      listDescription: r.list_description ?? '',
      leadCount: r.lead_count,
    }));
    res.json(lists);
  } catch (err) {
    next(err);
  }
});

// POST /api/lists — create a new lead list under a campaign
listsRouter.post('/', async (req, res, next) => {
  try {
    const { listId, listName, campaignId, listDescription } = req.body as {
      listId?: string; listName?: string; campaignId?: string; listDescription?: string;
    };

    if (!listId || !listName || !campaignId) {
      return res.status(400).json({ error: 'listId, listName, and campaignId are required.' });
    }
    if (!LIST_ID_PATTERN.test(listId)) {
      return res.status(400).json({ error: 'List ID must be a positive whole number.' });
    }

    const existingList = await query<{ cnt: number }>(
      'SELECT COUNT(*) AS cnt FROM vicidial_lists WHERE list_id = ?',
      [listId],
    );
    if (existingList[0]?.cnt) {
      return res.status(409).json({ error: `List ID "${listId}" already exists.` });
    }

    const existingCampaign = await query<{ cnt: number }>(
      'SELECT COUNT(*) AS cnt FROM vicidial_campaigns WHERE campaign_id = ?',
      [campaignId],
    );
    if (!existingCampaign[0]?.cnt) {
      return res.status(400).json({ error: `Campaign "${campaignId}" does not exist.` });
    }

    await writeQuery(
      `INSERT INTO vicidial_lists (list_id, list_name, campaign_id, active, list_description)
       VALUES (?, ?, ?, 'Y', ?)`,
      [listId, listName, campaignId, listDescription || ''],
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/lists/:listId — rename, reassign campaign, or toggle active
listsRouter.patch('/:listId', async (req, res, next) => {
  try {
    const { listId } = req.params;
    const { listName, campaignId, active, listDescription } = req.body as {
      listName?: string; campaignId?: string; active?: boolean; listDescription?: string;
    };

    const existing = await query<{ cnt: number }>(
      'SELECT COUNT(*) AS cnt FROM vicidial_lists WHERE list_id = ?',
      [listId],
    );
    if (!existing[0]?.cnt) {
      return res.status(404).json({ error: `List "${listId}" not found.` });
    }

    if (campaignId) {
      const existingCampaign = await query<{ cnt: number }>(
        'SELECT COUNT(*) AS cnt FROM vicidial_campaigns WHERE campaign_id = ?',
        [campaignId],
      );
      if (!existingCampaign[0]?.cnt) {
        return res.status(400).json({ error: `Campaign "${campaignId}" does not exist.` });
      }
    }

    const sets: string[] = [];
    const params: unknown[] = [];
    if (listName) { sets.push('list_name = ?'); params.push(listName); }
    if (campaignId) { sets.push('campaign_id = ?'); params.push(campaignId); }
    if (active !== undefined) { sets.push('active = ?'); params.push(active ? 'Y' : 'N'); }
    if (listDescription !== undefined) { sets.push('list_description = ?'); params.push(listDescription); }

    if (!sets.length) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    params.push(listId);
    await writeQuery(`UPDATE vicidial_lists SET ${sets.join(', ')} WHERE list_id = ?`, params);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
