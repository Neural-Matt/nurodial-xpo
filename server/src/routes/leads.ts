import { Router } from 'express';
import { query } from '../db.js';
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
