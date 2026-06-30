import { Router } from 'express';
import { query } from '../db.js';
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
}

export const campaignsRouter = Router();

campaignsRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await query<CampaignRow>(
      `SELECT campaign_id, campaign_name, active, dial_method, auto_dial_level, hopper_level, local_call_time
       FROM vicidial_campaigns
       ORDER BY campaign_name`,
    );
    const campaigns: ApiCampaign[] = rows.map((row) => ({
      campaignId: row.campaign_id,
      campaignName: row.campaign_name,
      active: row.active === 'Y',
      dialMethod: row.dial_method,
      autoDialLevel: row.auto_dial_level ?? 0,
      hopperLevel: row.hopper_level ?? 0,
      localCallTime: row.local_call_time ?? '',
      // Best-effort derivation — VICIDial doesn't store a "Blended" flag on
      // this table; a campaign with both an inbound group and outbound
      // dialing would need a join against vicidial_inbound_groups to detect.
      type: row.dial_method === 'INBOUND_MAN' ? 'Inbound' : 'Outbound',
      status: row.active === 'Y' ? 'Active' : 'Paused',
    }));
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
});
