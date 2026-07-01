import { Router } from 'express';
import { query } from '../db.js';
import { writeQuery } from '../writeDb.js';

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

interface PhoneRow {
  extension: string;
  protocol: string;
  server_ip: string;
  phone_ring_timeout: number;
  on_hook_agent: 'Y' | 'N';
}

export const agentApiRouter = Router();

// GET /api/agent/phones — active phone extensions the agent can log in on
agentApiRouter.get('/phones', async (_req, res, next) => {
  try {
    // EXTERNAL-protocol rows (e.g. 'callin') are system extensions, not
    // agent-usable phones — exclude them from the login picker.
    const rows = await query<PhoneRow>(
      `SELECT extension, protocol, server_ip, phone_ring_timeout, on_hook_agent
       FROM phones WHERE active = 'Y' AND protocol != 'EXTERNAL' ORDER BY extension`,
    );
    res.json(rows.map((r) => ({ extension: r.extension, protocol: r.protocol })));
  } catch (err) {
    next(err);
  }
});

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

// POST /api/agent/login-session — create the agent's vicidial_live_agents row,
// replicating VICIdial's own MANUAL-dial login path (agc/vicidial.php). Scoped
// to MANUAL-dial campaigns only: those skip VICIdial's conference-room
// reservation and login-time Originate entirely, so conf_exten is left ''
// and no vicidial_manager job is queued — matching what VICIdial itself does
// for this campaign type.
agentApiRouter.post('/login-session', async (req, res, next) => {
  try {
    const username = req.jwtUser!.sub;
    const { campaignId, extension } = req.body as { campaignId?: string; extension?: string };

    if (!campaignId || !extension) {
      return res.status(400).json({ error: 'campaignId and extension are required.' });
    }

    const campaignRows = await query<{ dial_method: string }>(
      `SELECT dial_method FROM vicidial_campaigns WHERE campaign_id = ? AND active = 'Y' LIMIT 1`,
      [campaignId],
    );
    if (!campaignRows.length) {
      return res.status(400).json({ error: `Campaign "${campaignId}" is not active.` });
    }
    if (campaignRows[0].dial_method !== 'MANUAL') {
      return res.status(400).json({
        error: 'Agent login is only supported for MANUAL dial campaigns right now.',
      });
    }

    const phoneRows = await query<PhoneRow>(
      `SELECT extension, protocol, server_ip, phone_ring_timeout, on_hook_agent
       FROM phones WHERE extension = ? AND active = 'Y' LIMIT 1`,
      [extension],
    );
    if (!phoneRows.length) {
      return res.status(400).json({ error: `Phone extension "${extension}" is not active.` });
    }
    const phone = phoneRows[0];

    const userRows = await query<{ user_level: number }>(
      `SELECT user_level FROM vicidial_users WHERE user = ? AND active = 'Y' LIMIT 1`,
      [username],
    );
    if (!userRows.length) {
      return res.status(404).json({ error: 'User not found or inactive.' });
    }
    const userLevel = userRows[0].user_level;

    const campaignAgentRows = await query<{
      campaign_weight: number;
      calls_today: number;
      campaign_grade: number;
    }>(
      `SELECT campaign_weight, calls_today, campaign_grade FROM vicidial_campaign_agents
       WHERE user = ? AND campaign_id = ? LIMIT 1`,
      [username, campaignId],
    );

    let campaignWeight = 0;
    let callsToday = 0;
    let campaignGrade = 1;
    if (campaignAgentRows.length) {
      ({ campaign_weight: campaignWeight, calls_today: callsToday, campaign_grade: campaignGrade } = campaignAgentRows[0]);
    } else {
      await writeQuery(
        `INSERT INTO vicidial_campaign_agents (user, campaign_id, campaign_rank, campaign_weight, calls_today, campaign_grade)
         VALUES (?, ?, 0, 0, 0, 1)`,
        [username, campaignId],
      );
    }

    const sipUser = `${phone.protocol}/${phone.extension}`;
    const randomId = Math.floor(Math.random() * 90000000) + 10000000;

    // Other VICIdial scripts assume exactly one vicidial_live_agents row per
    // user; clear any stale row (e.g. from a crashed session) before inserting.
    await writeQuery('DELETE FROM vicidial_live_agents WHERE user = ?', [username]);

    await writeQuery(
      `INSERT INTO vicidial_live_agents
         (user, server_ip, conf_exten, extension, status, lead_id, campaign_id, uniqueid, callerid, channel,
          random_id, last_call_time, last_update_time, last_call_finish, user_level, campaign_weight, calls_today,
          last_state_change, outbound_autodial, manager_ingroup_set, on_hook_ring_time, on_hook_agent, campaign_grade,
          last_inbound_call_time_filtered, last_inbound_call_finish_filtered)
       VALUES (?, ?, '', ?, 'PAUSED', '', ?, '', '', '', ?, NOW(), NOW(), NOW(), ?, ?, ?, NOW(), 'N', 'N', ?, ?, ?, NOW(), NOW())`,
      [
        username, phone.server_ip, sipUser, campaignId, randomId,
        userLevel, campaignWeight, callsToday, phone.phone_ring_timeout, phone.on_hook_agent, campaignGrade,
      ],
    );

    res.status(201).json({ ok: true });
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
