import { Router } from 'express';
import { query } from '../db.js';
import { writeQuery } from '../writeDb.js';
import { ami } from '../ami.js';
import { normalizeZambianPhone } from '../phoneNormalize.js';

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
  ext_context: string;
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
// replicating VICIdial's own login path (agc/vicidial.php) for both MANUAL
// and predictive-dial campaigns:
// - MANUAL skips VICIdial's conference-room reservation and login-time
//   Originate entirely (conf_exten stays '', outbound_autodial 'N') — matches
//   what VICIdial itself does for this campaign type.
// - Non-MANUAL (RATIO/ADAPT_*/etc.) reserves a room from `vicidial_conferences`
//   (a fixed pool of 249 pre-provisioned MeetMe rooms on this install), rings
//   the agent's own phone into it via AMI (Context/Exten matching the real
//   `Meetme(${EXTEN},F)` dialplan confirmed in extensions.conf), and sets
//   `outbound_autodial='Y'` -- the exact flag VICIdial's own predictive dialer
//   daemon (AST_VDauto_dial.pl, confirmed running) reads to treat this agent
//   as eligible to receive auto-dialed calls into that room.
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
    const isManual = campaignRows[0].dial_method === 'MANUAL';

    const phoneRows = await query<PhoneRow>(
      `SELECT extension, protocol, server_ip, phone_ring_timeout, on_hook_agent, ext_context
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

    let confExten = '';
    let outboundAutodial: 'Y' | 'N' = 'N';

    if (!isManual) {
      // Reserve a free room the same way agc/vicidial.php does: atomically
      // claim one row where extension is empty, then look up its conf_exten.
      const reserveResult = await writeQuery(
        `UPDATE vicidial_conferences SET extension = ?, leave_3way = '0'
         WHERE server_ip = ? AND (extension = '' OR extension IS NULL) LIMIT 1`,
        [sipUser, phone.server_ip],
      );
      if (reserveResult.affectedRows === 0) {
        return res.status(503).json({ error: 'No available conference room on this server right now.' });
      }
      const confRows = await query<{ conf_exten: string }>(
        `SELECT conf_exten FROM vicidial_conferences WHERE server_ip = ? AND extension = ? LIMIT 1`,
        [phone.server_ip, sipUser],
      );
      confExten = confRows[0]?.conf_exten ?? '';
      outboundAutodial = 'Y';

      // Mirror VICIdial's own stale-session cleanup for this user before
      // reusing the room: leads left mid-call go back to the hopper as ERI,
      // and any leftover hopper rows for this user are cleared.
      await writeQuery(
        `UPDATE vicidial_list SET status = 'ERI', user = '' WHERE status IN ('QUEUE','INCALL') AND user = ?`,
        [username],
      );
      await writeQuery(
        `DELETE FROM vicidial_hopper WHERE status IN ('QUEUE','INCALL','DONE') AND user = ?`,
        [username],
      );
    }

    // Other VICIdial scripts assume exactly one vicidial_live_agents row per
    // user; clear any stale row (e.g. from a crashed session) before inserting.
    await writeQuery('DELETE FROM vicidial_live_agents WHERE user = ?', [username]);

    await writeQuery(
      `INSERT INTO vicidial_live_agents
         (user, server_ip, conf_exten, extension, status, lead_id, campaign_id, uniqueid, callerid, channel,
          random_id, last_call_time, last_update_time, last_call_finish, user_level, campaign_weight, calls_today,
          last_state_change, outbound_autodial, manager_ingroup_set, on_hook_ring_time, on_hook_agent, campaign_grade,
          last_inbound_call_time_filtered, last_inbound_call_finish_filtered)
       VALUES (?, ?, ?, ?, 'PAUSED', '', ?, '', '', '', ?, NOW(), NOW(), NOW(), ?, ?, ?, NOW(), ?, 'N', ?, ?, ?, NOW(), NOW())`,
      [
        username, phone.server_ip, confExten, sipUser, campaignId, randomId,
        userLevel, campaignWeight, callsToday, outboundAutodial, phone.phone_ring_timeout, phone.on_hook_agent, campaignGrade,
      ],
    );

    if (!isManual && confExten) {
      // Fire-and-forget, matching VICIdial's own login: it queues this same
      // Originate via vicidial_manager without waiting for or storing the
      // resulting channel. Logout looks up the live channel fresh via
      // `live_sip_channels` instead of tracking it here (see logout below).
      await ami.ensureConnected();
      ami.sendAction({
        Action: 'Originate',
        Channel: sipUser,
        Context: phone.ext_context,
        Exten: confExten,
        Priority: '1',
        CallerID: `NuroDial <${username}>`,
        Async: 'true',
      }).catch((err) => {
        console.error(`Login conference-join Originate failed for ${username}:`, err);
      });
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

interface LiveAgentRow {
  extension: string;
  channel: string;
  lead_id: number;
  campaign_id: string;
  status: string;
  conf_exten: string;
  server_ip: string;
}

// POST /api/agent/action — real-time call control via AMI + direct VICIdial
// table writes. The external_* columns are NOT used here (see server/README
// notes / project memory): nothing in VICIdial's backend actually consumes
// them outside its own native agent screen's AJAX polling, so writing them
// alone has no telephony effect. This route drives Asterisk directly.
agentApiRouter.post('/action', async (req, res, next) => {
  try {
    const username = req.jwtUser!.sub;
    const { function: fn, value } = req.body as { function: string; value?: string };

    if (!fn) {
      return res.status(400).json({ error: 'function is required.' });
    }

    const agentRows = await query<LiveAgentRow>(
      'SELECT extension, channel, lead_id, campaign_id, status, conf_exten, server_ip FROM vicidial_live_agents WHERE user = ?',
      [username],
    );
    if (!agentRows.length) {
      return res.status(404).json({ error: 'Agent is not logged in to VICIdial.' });
    }
    const agent = agentRows[0];

    switch (fn) {
      case 'external_pause': {
        // value must be 'PAUSE' or 'RESUME'
        if (value !== 'PAUSE' && value !== 'RESUME') {
          return res.status(400).json({ error: 'external_pause value must be PAUSE or RESUME.' });
        }
        await writeQuery(
          "UPDATE vicidial_live_agents SET status = ?, last_state_change = NOW() WHERE user = ?",
          [value === 'RESUME' ? 'READY' : 'PAUSED', username],
        );
        break;
      }
      case 'external_hangup': {
        if (agent.channel) {
          await ami.ensureConnected();
          await ami.sendAction({ Action: 'Hangup', Channel: agent.channel }).catch(() => {});
        }
        await writeQuery(
          "UPDATE vicidial_live_agents SET status = 'PAUSED', channel = '', last_state_change = NOW() WHERE user = ?",
          [username],
        );
        break;
      }
      case 'external_status': {
        // Disposition: hang up if still connected, log the call, update the
        // lead, then return the agent to PAUSED (matches VICIdial's own
        // convention of requiring an explicit resume after wrapup).
        if (!value) {
          return res.status(400).json({ error: 'external_status requires a value (disposition code).' });
        }

        if (agent.channel) {
          await ami.ensureConnected();
          await ami.sendAction({ Action: 'Hangup', Channel: agent.channel }).catch(() => {});
        }

        if (agent.lead_id > 0) {
          const leadRows = await query<{ list_id: string; phone_number: string }>(
            'SELECT list_id, phone_number FROM vicidial_list WHERE lead_id = ? LIMIT 1',
            [agent.lead_id],
          );
          const lead = leadRows[0];

          await writeQuery(
            "UPDATE vicidial_list SET status = ?, called_count = called_count + 1, last_local_call_time = NOW() WHERE lead_id = ?",
            [value, agent.lead_id],
          );

          const uniqueId = `${Date.now()}.${Math.floor(Math.random() * 1000)}`;
          await writeQuery(
            `INSERT INTO vicidial_log
               (uniqueid, lead_id, list_id, campaign_id, call_date, length_in_sec, status, phone_number, user, term_reason)
             VALUES (?, ?, ?, ?, NOW(), TIMESTAMPDIFF(SECOND, (SELECT last_call_time FROM vicidial_live_agents WHERE user = ?), NOW()), ?, ?, ?, 'AGENT')`,
            [uniqueId, agent.lead_id, lead?.list_id ?? '0', agent.campaign_id, username, value, lead?.phone_number ?? '', username],
          );
        }

        await writeQuery(
          "UPDATE vicidial_live_agents SET status = 'PAUSED', lead_id = 0, channel = '', calls_today = calls_today + 1, last_state_change = NOW() WHERE user = ?",
          [username],
        );
        break;
      }
      case 'external_dial': {
        if (!value) {
          return res.status(400).json({ error: 'external_dial requires a phone number value.' });
        }
        if (agent.status === 'INCALL') {
          return res.status(409).json({ error: 'Agent is already in a call.' });
        }
        const { vendor_id: vendorId } = req.body as { vendor_id?: string };
        const leadId = vendorId && /^[0-9]+$/.test(vendorId) ? Number(vendorId) : 0;

        // Build the actual dial string as phone_code + phone_number, matching
        // VICIdial's own convention (see AST_VDauto_dial.pl's dial-string
        // builder) rather than dialing whatever raw digits the client sent --
        // for a selected lead, the lead's own DB row is authoritative (it's
        // already been through normalizeZambianPhone() at import time), not
        // whatever phoneCode the frontend happened to attach to the request.
        let dialString: string;
        if (leadId > 0) {
          const leadRows = await query<{ phone_code: string | null; phone_number: string }>(
            'SELECT phone_code, phone_number FROM vicidial_list WHERE lead_id = ? LIMIT 1',
            [leadId],
          );
          const lead = leadRows[0];
          dialString = `${lead?.phone_code ?? ''}${lead?.phone_number ?? value.replace(/\D/g, '')}`;
        } else {
          // Ad-hoc manual dial of a typed number (no lead attached). Try
          // Zambian normalization first; fall back to the raw digits
          // unchanged for anything that doesn't resolve (e.g. dialing a
          // short internal test extension like 8307, which isn't and
          // shouldn't be treated as a malformed phone number).
          const normalized = normalizeZambianPhone(value);
          dialString = normalized ? `${normalized.phoneCode}${normalized.phoneNumber}` : value.replace(/\D/g, '');
        }

        await ami.ensureConnected();
        const actionId = `nurodial-dial-${Date.now()}`;
        const queuedAck = await ami.sendAction({
          Action: 'Originate',
          ActionID: actionId,
          Channel: agent.extension,
          Exten: dialString,
          // NOTE: 'default' context has no real outbound trunk configured yet
          // (see project memory -- MTN SIP trunk pending). This correctly
          // rings the agent's own phone; connecting to a real external
          // number will only work once a trunk exists.
          Context: 'default',
          Priority: '1',
          CallerID: `NuroDial <${dialString}>`,
          Async: 'true',
        });
        if (queuedAck.Response !== 'Success') {
          return res.status(502).json({ error: `Originate rejected: ${queuedAck.Message ?? 'unknown error'}` });
        }

        await writeQuery(
          "UPDATE vicidial_live_agents SET status = 'INCALL', lead_id = ?, callerid = ?, comments = 'MANUAL', last_call_time = NOW(), last_state_change = NOW() WHERE user = ?",
          [leadId, dialString, username],
        );

        // Don't block the HTTP response on how the call turns out — the
        // frontend already polls /api/agent/me every 5s and will pick up
        // the real state once we learn it below.
        res.json({ ok: true });
        ami.waitForEvent('OriginateResponse', (p) => p.ActionID === actionId, 30000)
          .then(async (event) => {
            if (event.Response === 'Success' && event.Channel) {
              await writeQuery(
                "UPDATE vicidial_live_agents SET channel = ?, uniqueid = ? WHERE user = ?",
                [event.Channel, event.Uniqueid ?? '', username],
              );
            } else {
              // No answer / busy / failed -- release the agent back to READY.
              await writeQuery(
                "UPDATE vicidial_live_agents SET status = 'READY', lead_id = 0, channel = '', last_state_change = NOW() WHERE user = ?",
                [username],
              );
            }
          })
          .catch(async () => {
            await writeQuery(
              "UPDATE vicidial_live_agents SET status = 'READY', lead_id = 0, channel = '', last_state_change = NOW() WHERE user = ?",
              [username],
            ).catch(() => {});
          });
        return;
      }
      case 'logout': {
        if (agent.channel) {
          await ami.ensureConnected();
          await ami.sendAction({ Action: 'Hangup', Channel: agent.channel }).catch(() => {});
        }

        if (agent.conf_exten) {
          // Non-MANUAL session: release the reserved conference room, then
          // hang up the agent's own phone leg. Matches VICIdial's own
          // userLOGout handler (vdc_db_query.php) -- it doesn't track the
          // login-time Originate's channel either, it looks up whatever's
          // currently live for this extension via `live_sip_channels` (kept
          // current by AST_update_AMI2.pl, confirmed running) and hangs that up.
          await writeQuery(
            `UPDATE vicidial_conferences SET extension = '' WHERE server_ip = ? AND conf_exten = ?`,
            [agent.server_ip, agent.conf_exten],
          );
          const liveChannelRows = await query<{ channel: string }>(
            `SELECT channel FROM live_sip_channels WHERE server_ip = ? AND channel LIKE ? ORDER BY channel DESC LIMIT 1`,
            [agent.server_ip, `${agent.extension}%`],
          );
          if (liveChannelRows.length) {
            await ami.ensureConnected();
            await ami.sendAction({ Action: 'Hangup', Channel: liveChannelRows[0].channel }).catch(() => {});
          }
        }

        await writeQuery('DELETE FROM vicidial_live_agents WHERE user = ?', [username]);
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
