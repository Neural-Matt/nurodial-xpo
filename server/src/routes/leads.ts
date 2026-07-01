import { Router } from 'express';
import { query } from '../db.js';
import { writeQuery } from '../writeDb.js';
import { normalizeZambianPhone } from '../phoneNormalize.js';
import type { ApiLead } from '../types.js';

// vicidial_list has no campaign_id column — campaign is linked via
// vicidial_lists (list_id → campaign_id). We LEFT JOIN to carry that
// through so the frontend can group/filter leads by campaign.
const SELECT_COLUMNS = `
  vl.lead_id, vl.list_id, COALESCE(vls.campaign_id, '') AS campaign_id,
  vl.phone_number, vl.phone_code, vl.first_name, vl.last_name,
  vl.email, vl.state, vl.city, vl.address1,
  vl.vendor_lead_code, vl.source_id, vl.status,
  vl.called_count, vl.last_local_call_time`;

const ROW_LIMIT = 200;

export const leadsRouter = Router();

leadsRouter.get('/', async (req, res, next) => {
  try {
    const campaignId = typeof req.query.campaignId === 'string' ? req.query.campaignId : undefined;
    const sql = campaignId
      ? `SELECT ${SELECT_COLUMNS}
         FROM vicidial_list vl
         LEFT JOIN vicidial_lists vls ON vl.list_id = vls.list_id
         WHERE vls.campaign_id = ?
         ORDER BY vl.modify_date DESC LIMIT ${ROW_LIMIT}`
      : `SELECT ${SELECT_COLUMNS}
         FROM vicidial_list vl
         LEFT JOIN vicidial_lists vls ON vl.list_id = vls.list_id
         ORDER BY vl.modify_date DESC LIMIT ${ROW_LIMIT}`;

    interface LeadRow {
      lead_id: number;
      list_id: string;
      campaign_id: string;
      phone_number: string;
      phone_code: string;
      first_name: string;
      last_name: string;
      email: string;
      state: string;
      city: string;
      address1: string;
      vendor_lead_code: string;
      source_id: string;
      status: string;
      called_count: number;
      last_local_call_time: string | null;
    }

    const rows = await query<LeadRow>(sql, campaignId ? [campaignId] : []);
    const leads: ApiLead[] = rows.map((row) => ({
      leadId: String(row.lead_id),
      listId: String(row.list_id),
      campaignId: row.campaign_id,
      phoneNumber: row.phone_number,
      phoneCode: row.phone_code,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email || '',
      province: row.state || '',
      city: row.city || '',
      address: row.address1 || '',
      vendorLeadCode: row.vendor_lead_code || '',
      sourceId: row.source_id || '',
      status: row.status,
      calledCount: row.called_count,
      lastCallTime: row.last_local_call_time ?? '',
    }));
    res.json(leads);
  } catch (err) {
    next(err);
  }
});

interface ImportRow {
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  city?: string;
  province?: string;
  address?: string;
  vendorLeadCode?: string;
  sourceId?: string;
}

// POST /api/leads/import — bulk-create leads under an existing list.
// Every phone number is run through normalizeZambianPhone() regardless of
// the format it arrives in (bare 9-digit, leading-0 local, +260/260/00260
// prefixed, or messy double-prefixed) so `phone_number` always ends up as
// just the local 9-digit number with `phone_code='260'` carried separately
// -- matching VICIdial's own international-dialing convention (see
// AST_VDauto_dial.pl's dial-string builder). Rows that don't resolve to a
// valid Zambian number are reported back, not silently guessed at or
// dropped without explanation.
leadsRouter.post('/import', async (req, res, next) => {
  try {
    const { listId, rows } = req.body as { listId?: string; rows?: ImportRow[] };

    if (!listId || !Array.isArray(rows) || !rows.length) {
      return res.status(400).json({ error: 'listId and a non-empty rows array are required.' });
    }
    if (rows.length > 5000) {
      return res.status(400).json({ error: 'Import is limited to 5,000 rows per request.' });
    }

    const listRows = await query<{ list_id: string }>(
      'SELECT list_id FROM vicidial_lists WHERE list_id = ? LIMIT 1',
      [listId],
    );
    if (!listRows.length) {
      return res.status(400).json({ error: `List "${listId}" does not exist.` });
    }

    let imported = 0;
    const failed: { row: number; phoneNumber: string; reason: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rawPhone = row.phoneNumber ?? '';
      const normalized = normalizeZambianPhone(rawPhone);
      if (!normalized) {
        failed.push({ row: i + 1, phoneNumber: rawPhone, reason: 'Not a recognizable Zambian phone number.' });
        continue;
      }

      await writeQuery(
        `INSERT INTO vicidial_list
           (list_id, entry_list_id, status, phone_code, phone_number, first_name, last_name,
            email, city, state, address1, vendor_lead_code, source_id)
         VALUES (?, ?, 'NEW', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          listId, listId, normalized.phoneCode, normalized.phoneNumber,
          row.firstName ?? '', row.lastName ?? '', row.email ?? '', row.city ?? '',
          row.province ?? '', row.address ?? '', row.vendorLeadCode ?? '', row.sourceId ?? '',
        ],
      );
      imported++;
    }

    res.status(201).json({ imported, failed });
  } catch (err) {
    next(err);
  }
});
