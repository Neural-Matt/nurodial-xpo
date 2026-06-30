import { Router } from 'express';
import mysql from 'mysql2/promise';
import { query } from '../db.js';

// Separate write pool — nurodial_agent has UPDATE on external_* columns of vicidial_live_agents
const writePool = mysql.createPool({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_AGENT_USER ?? 'nurodial_agent',
  password: process.env.DB_AGENT_PASS ?? '',
  database: process.env.DB_NAME ?? 'asterisk',
  waitForConnections: true,
  connectionLimit: 5,
});

async function writeQuery(sql: string, params: unknown[] = []): Promise<void> {
  await writePool.query(sql, params);
}

export interface AgentStatusRow {
  status: 'READY' | 'INCALL' | 'PAUSED' | 'QUEUE' | 'CLOSER' | 'MQUEUE';
  campaign_id: string;
  extension: string;
  callerid: string;
  calls_today: number;
  lead_id: number;
  status_duration_sec: number;
  phone_number: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  city: string | null;
  province: string | null;
  address: string | null;
  lead_status: string | null;
  called_count: number | null;
  list_id: string | null;
  vendor_lead_code: string | null;
  source_id: string | null;
}

export const agentApiRouter = Router();

// GET /api/agent/me — return agent's current live state + lead info
agentApiRouter.get('/me', async (req, res, next) => {
  try {
    const username = req.jwtUser!.sub;
    const rows = await query<AgentStatusRow>(
      `SELECT
         la.status,
         la.campaign_id,
         la.extension,
         la.callerid,
         la.calls_today,
         la.lead_id,
         TIMESTAMPDIFF(SECOND, la.last_state_change, NOW()) AS status_duration_sec,
         vl.phone_number,
         vl.first_name,
         vl.last_name,
         vl.email,
         vl.city,
         vl.state        AS province,
         vl.address1     AS address,
         vl.status       AS lead_status,
         vl.called_count,
         vl.list_id,
         vl.vendor_lead_code,
         vl.source_id
       FROM vicidial_live_agents la
       LEFT JOIN vicidial_list vl ON la.lead_id = vl.lead_id AND la.lead_id > 0
       WHERE la.user = ?`,
      [username],
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Agent is not logged in to VICIdial.' });
    }

    const r = rows[0];
    const hasLead = r.lead_id > 0 && r.phone_number != null;

    res.json({
      status: r.status,
      campaignId: r.campaign_id ?? '',
      extension: r.extension ?? '',
      callerId: r.callerid ?? '',
      callsToday: r.calls_today ?? 0,
      statusDurationSec: r.status_duration_sec ?? 0,
      leadId: r.lead_id > 0 ? String(r.lead_id) : null,
      lead: hasLead
        ? {
            leadId: String(r.lead_id),
            listId: String(r.list_id ?? ''),
            phoneNumber: r.phone_number ?? '',
            firstName: r.first_name ?? '',
            lastName: r.last_name ?? '',
            email: r.email ?? '',
            city: r.city ?? '',
            province: r.province ?? '',
            address: r.address ?? '',
            status: r.lead_status ?? '',
            calledCount: r.called_count ?? 0,
            vendorLeadCode: r.vendor_lead_code ?? '',
            sourceId: r.source_id ?? '',
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/agent/action — write external_* flags directly to vicidial_live_agents
// VICIdial's Asterisk scripts poll these columns to control the live call channel.
agentApiRouter.post('/action', async (req, res, next) => {
  try {
    const username = req.jwtUser!.sub;
    const { function: fn, value } = req.body as { function: string; value?: string };

    if (!fn) {
      return res.status(400).json({ error: 'function is required.' });
    }

    // Verify agent is logged into VICIdial
    const agentRows = await query<{ cnt: number }>(
      'SELECT COUNT(*) AS cnt FROM vicidial_live_agents WHERE user = ?',
      [username],
    );
    if (!agentRows[0]?.cnt) {
      return res.status(404).json({ error: 'Agent is not logged in to VICIdial.' });
    }

    const epoch = Math.floor(Date.now() / 1000);

    switch (fn) {
      case 'external_pause': {
        // value must be 'PAUSE' or 'RESUME'
        if (value !== 'PAUSE' && value !== 'RESUME') {
          return res.status(400).json({ error: 'external_pause value must be PAUSE or RESUME.' });
        }
        await writeQuery(
          "UPDATE vicidial_live_agents SET external_pause = ? WHERE user = ?",
          [`${value}!${epoch}`, username],
        );
        break;
      }
      case 'external_hangup': {
        await writeQuery(
          "UPDATE vicidial_live_agents SET external_hangup = '1' WHERE user = ?",
          [username],
        );
        break;
      }
      case 'external_status': {
        if (!value) {
          return res.status(400).json({ error: 'external_status requires a value (disposition code).' });
        }
        await writeQuery(
          "UPDATE vicidial_live_agents SET external_status = ? WHERE user = ?",
          [value, username],
        );
        break;
      }
      case 'external_dial': {
        // value = phone number; stored in external_dial for VICIdial's manual dial processing
        if (!value) {
          return res.status(400).json({ error: 'external_dial requires a phone number value.' });
        }
        const phoneDigits = value.replace(/\D/g, '');
        await writeQuery(
          "UPDATE vicidial_live_agents SET external_dial = ? WHERE user = ?",
          [phoneDigits, username],
        );
        break;
      }
      case 'logout': {
        await writeQuery(
          "UPDATE vicidial_live_agents SET external_pause = 'LOGOUT' WHERE user = ?",
          [username],
        );
        break;
      }
      default:
        return res.status(400).json({ error: `Unknown function: ${fn}` });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
