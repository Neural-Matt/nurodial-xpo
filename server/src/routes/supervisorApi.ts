import { Router } from 'express';
import { query } from '../db.js';
import { ami } from '../ami.js';

// ChanSpy() options: 'u' targets the chanprefix arg as an exact channel name
// / uniqueid instead of a prefix match (see `asterisk -rx 'core show
// application ChanSpy'`), 'q' suppresses the "beginning to spy" beep tone.
const MODE_OPTIONS: Record<'monitor' | 'whisper' | 'barge', string> = {
  monitor: 'qu',   // listen only
  whisper: 'qwu',  // spy can talk to the agent; customer can't hear the spy
  barge: 'qBu',    // full three-way -- everyone hears everyone
};

interface PhoneRow {
  extension: string;
  protocol: string;
}

interface LiveAgentRow {
  channel: string;
  status: string;
}

export const supervisorApiRouter = Router();

// POST /api/supervisor/monitor — ring the requesting supervisor's own phone
// and ChanSpy onto a live agent's call. Supervisor/Administrator only.
supervisorApiRouter.post('/monitor', async (req, res, next) => {
  try {
    const role = req.jwtUser!.role;
    if (role !== 'Supervisor' && role !== 'Administrator') {
      return res.status(403).json({ error: 'Only Supervisors and Administrators can monitor calls.' });
    }

    const { agentUser, mode, extension } = req.body as {
      agentUser?: string;
      mode?: string;
      extension?: string;
    };
    if (!agentUser || !extension) {
      return res.status(400).json({ error: 'agentUser and extension are required.' });
    }
    if (mode !== 'monitor' && mode !== 'whisper' && mode !== 'barge') {
      return res.status(400).json({ error: 'mode must be monitor, whisper, or barge.' });
    }

    const agentRows = await query<LiveAgentRow>(
      'SELECT channel, status FROM vicidial_live_agents WHERE user = ? LIMIT 1',
      [agentUser],
    );
    if (!agentRows.length) {
      return res.status(404).json({ error: 'Agent is not logged in to VICIdial.' });
    }
    const agent = agentRows[0];
    if (agent.status !== 'INCALL' || !agent.channel) {
      return res.status(409).json({ error: 'Agent is not currently on a call.' });
    }

    const phoneRows = await query<PhoneRow>(
      `SELECT extension, protocol FROM phones WHERE extension = ? AND active = 'Y' LIMIT 1`,
      [extension],
    );
    if (!phoneRows.length) {
      return res.status(400).json({ error: `Phone extension "${extension}" is not active.` });
    }
    const phone = phoneRows[0];

    await ami.ensureConnected();
    const actionId = `nurodial-spy-${Date.now()}`;
    const queuedAck = await ami.sendAction({
      Action: 'Originate',
      ActionID: actionId,
      Channel: `${phone.protocol}/${phone.extension}`,
      Application: 'ChanSpy',
      Data: `${agent.channel},${MODE_OPTIONS[mode]}`,
      CallerID: `NuroDial Monitor <${agentUser}>`,
      Async: 'true',
    });
    if (queuedAck.Response !== 'Success') {
      return res.status(502).json({ error: `Originate rejected: ${queuedAck.Message ?? 'unknown error'}` });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
