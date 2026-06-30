import { Router } from 'express';
import { query } from '../db.js';
import type { ApiLead } from '../types.js';

// Column names reflect documented VICIDial schema but are NOT verified
// against this specific install yet. Run `DESCRIBE vicidial_list;` on the
// real DB and adjust below if anything doesn't match.
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

const SELECT_COLUMNS = `lead_id, list_id, campaign_id, phone_number, phone_code, first_name, last_name,
  email, state, city, address1, vendor_lead_code, source_id, status, called_count, last_local_call_time`;

// Capped at 200 rows — this endpoint is for populating the agent's "Up
// Next" queue, not bulk export. Raise this (with pagination) if a real
// reporting/export use case comes up later.
const ROW_LIMIT = 200;

export const leadsRouter = Router();

leadsRouter.get('/', async (req, res, next) => {
  try {
    const campaignId = typeof req.query.campaignId === 'string' ? req.query.campaignId : undefined;
    const sql = campaignId
      ? `SELECT ${SELECT_COLUMNS} FROM vicidial_list WHERE campaign_id = ? ORDER BY modify_date DESC LIMIT ${ROW_LIMIT}`
      : `SELECT ${SELECT_COLUMNS} FROM vicidial_list ORDER BY modify_date DESC LIMIT ${ROW_LIMIT}`;
    const rows = await query<LeadRow>(sql, campaignId ? [campaignId] : []);
    const leads: ApiLead[] = rows.map((row) => ({
      leadId: String(row.lead_id),
      listId: row.list_id,
      campaignId: row.campaign_id,
      phoneNumber: row.phone_number,
      phoneCode: row.phone_code,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      province: row.state,
      city: row.city,
      address: row.address1,
      vendorLeadCode: row.vendor_lead_code,
      sourceId: row.source_id,
      status: row.status,
      calledCount: row.called_count,
      lastCallTime: row.last_local_call_time ?? '',
    }));
    res.json(leads);
  } catch (err) {
    next(err);
  }
});
