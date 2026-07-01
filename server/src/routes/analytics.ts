import { Router } from 'express';
import { query } from '../db.js';

type Role = 'Administrator' | 'Supervisor' | 'Agent';

function mapRole(userLevel: number): Role {
  if (userLevel >= 9) return 'Administrator';
  if (userLevel >= 5) return 'Supervisor';
  return 'Agent';
}

function toDayString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export const analyticsRouter = Router();

// GET /api/analytics — Supervisor/Administrator only. Aggregates real
// vicidial_log / vicidial_agent_log / vicidial_user_log data for the "Report
// List" dashboard (previously entirely mock). Numbers will look sparse until
// this install has real call volume.
analyticsRouter.get('/', async (req, res, next) => {
  try {
    const role = req.jwtUser!.role;
    if (role !== 'Supervisor' && role !== 'Administrator') {
      return res.status(403).json({ error: 'Only Supervisors and Administrators can view analytics.' });
    }

    const { startDate, endDate, campaignId } = req.query as Record<string, string | undefined>;
    const end = endDate || toDayString(new Date());
    const start = startDate || toDayString(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));
    const startTs = `${start} 00:00:00`;
    const endTs = `${end} 23:59:59`;

    const campaignFilter = campaignId ? 'AND vl.campaign_id = ?' : '';
    const campaignParam = campaignId ? [campaignId] : [];

    // --- KPIs -----------------------------------------------------------
    const kpiRows = await query<{
      total_calls: number;
      answered_calls: number;
      conversions: number;
      abandoned_calls: number;
      avg_handle_sec: number | null;
    }>(
      `SELECT
         COUNT(*) AS total_calls,
         SUM(CASE WHEN vs.human_answered = 'Y' THEN 1 ELSE 0 END) AS answered_calls,
         SUM(CASE WHEN vs.sale = 'Y' THEN 1 ELSE 0 END) AS conversions,
         SUM(CASE WHEN vl.term_reason = 'ABANDON' THEN 1 ELSE 0 END) AS abandoned_calls,
         AVG(vl.length_in_sec) AS avg_handle_sec
       FROM vicidial_log vl
       LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
       WHERE vl.call_date BETWEEN ? AND ? ${campaignFilter}`,
      [startTs, endTs, ...campaignParam],
    );
    // MySQL SUM() over an integer column returns DECIMAL, which mysql2
    // serializes as a string, not a number -- Number(...) everywhere a SUM()
    // result is read out below (confirmed live: talk_sec came back as "0").
    const k = kpiRows[0];
    const totalCalls = k?.total_calls ?? 0;
    const answeredCalls = Number(k?.answered_calls ?? 0);
    const conversions = Number(k?.conversions ?? 0);
    const abandonedCalls = Number(k?.abandoned_calls ?? 0);
    const avgHandleSec = Math.round(k?.avg_handle_sec ?? 0);

    // --- Daily trend, filled in for every day in range (no gaps) --------
    const trendRows = await query<{ d: string; total: number; answered: number; abandoned: number }>(
      `SELECT DATE(vl.call_date) AS d,
              COUNT(*) AS total,
              SUM(CASE WHEN vs.human_answered = 'Y' THEN 1 ELSE 0 END) AS answered,
              SUM(CASE WHEN vl.term_reason = 'ABANDON' THEN 1 ELSE 0 END) AS abandoned
       FROM vicidial_log vl
       LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
       WHERE vl.call_date BETWEEN ? AND ? ${campaignFilter}
       GROUP BY DATE(vl.call_date)`,
      [startTs, endTs, ...campaignParam],
    );
    const trendByDay = new Map(trendRows.map((r) => [r.d, r]));
    const dates: string[] = [];
    const totalSeries: number[] = [];
    const answeredSeries: number[] = [];
    const abandonedSeries: number[] = [];
    for (let d = new Date(`${start}T00:00:00Z`); toDayString(d) <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const key = toDayString(d);
      const row = trendByDay.get(key);
      dates.push(key);
      totalSeries.push(row?.total ?? 0);
      answeredSeries.push(Number(row?.answered ?? 0));
      abandonedSeries.push(Number(row?.abandoned ?? 0));
    }

    // --- Heatmap: day-of-week x 3-hour bucket ---------------------------
    // MySQL DAYOFWEEK: 1=Sun..7=Sat. UI wants rows Mon..Sun, so index = (dow+5)%7.
    const heatRows = await query<{ dow: number; bucket: number; cnt: number }>(
      `SELECT DAYOFWEEK(vl.call_date) AS dow, FLOOR(HOUR(vl.call_date) / 3) AS bucket, COUNT(*) AS cnt
       FROM vicidial_log vl
       WHERE vl.call_date BETWEEN ? AND ? ${campaignFilter}
       GROUP BY dow, bucket`,
      [startTs, endTs, ...campaignParam],
    );
    const heatmapData: number[][] = Array.from({ length: 7 }, () => Array(8).fill(0));
    for (const r of heatRows) {
      const dayIdx = (r.dow + 5) % 7;
      const bucketIdx = Math.min(Math.max(r.bucket, 0), 7);
      heatmapData[dayIdx][bucketIdx] += r.cnt;
    }

    // --- Top campaigns, with delta vs the immediately preceding period --
    const topRows = await query<{ campaign_id: string; campaign_name: string | null; calls: number }>(
      `SELECT vl.campaign_id, vc.campaign_name, COUNT(*) AS calls
       FROM vicidial_log vl
       LEFT JOIN vicidial_campaigns vc ON vl.campaign_id = vc.campaign_id
       WHERE vl.call_date BETWEEN ? AND ? ${campaignFilter}
       GROUP BY vl.campaign_id
       ORDER BY calls DESC
       LIMIT 5`,
      [startTs, endTs, ...campaignParam],
    );
    // Pure calendar arithmetic in UTC to derive an equal-length "immediately
    // preceding" window, then re-serialize as plain date strings -- matches
    // how call_date is already filtered elsewhere (plain string BETWEEN, no
    // timezone conversion attempted against the DB's own DATETIME values).
    const startMs = new Date(`${start}T00:00:00Z`).getTime();
    const endMs = new Date(`${end}T23:59:59Z`).getTime();
    const periodMs = endMs - startMs + 1000;
    const prevEndMs = startMs - 1000;
    const prevStartMs = prevEndMs - periodMs + 1000;
    const prevStartTs = new Date(prevStartMs).toISOString().slice(0, 19).replace('T', ' ');
    const prevEndTs = new Date(prevEndMs).toISOString().slice(0, 19).replace('T', ' ');
    const prevCountRows = topRows.length
      ? await query<{ campaign_id: string; calls: number }>(
          `SELECT campaign_id, COUNT(*) AS calls FROM vicidial_log
           WHERE call_date BETWEEN ? AND ? AND campaign_id IN (${topRows.map(() => '?').join(',')})
           GROUP BY campaign_id`,
          [prevStartTs, prevEndTs, ...topRows.map((r) => r.campaign_id)],
        )
      : [];
    const prevByCampaign = new Map(prevCountRows.map((r) => [r.campaign_id, r.calls]));
    const topCampaigns = topRows.map((r, i) => {
      const prev = prevByCampaign.get(r.campaign_id) ?? 0;
      const delta = prev === 0 ? (r.calls > 0 ? 'New' : '—') : `${prev < r.calls ? '+' : ''}${Math.round(((r.calls - prev) / prev) * 100)}%`;
      return {
        rank: i + 1,
        campaignId: r.campaign_id,
        campaignName: r.campaign_name ?? r.campaign_id,
        callsHandled: r.calls,
        delta,
      };
    });

    // --- Agent performance -----------------------------------------------
    const agentCampaignFilter = campaignId ? 'AND ca.campaign_id = ?' : '';
    const agentRows = await query<{
      user: string;
      full_name: string;
      user_level: number;
      user_group: string;
      active: 'Y' | 'N';
    }>(
      `SELECT DISTINCT vu.user, vu.full_name, vu.user_level, vu.user_group, vu.active
       FROM vicidial_users vu
       ${campaignId ? 'JOIN vicidial_campaign_agents ca ON ca.user = vu.user' : ''}
       WHERE vu.user NOT IN ('VDAD', 'VDCL') ${agentCampaignFilter}
       ORDER BY vu.full_name`,
      campaignParam,
    );

    const callStatsRows = await query<{ user: string; calls: number; conversions: number }>(
      `SELECT vl.user, COUNT(*) AS calls, SUM(CASE WHEN vs.sale = 'Y' THEN 1 ELSE 0 END) AS conversions
       FROM vicidial_log vl
       LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
       WHERE vl.call_date BETWEEN ? AND ? ${campaignFilter}
       GROUP BY vl.user`,
      [startTs, endTs, ...campaignParam],
    );
    const callStatsByUser = new Map(callStatsRows.map((r) => [r.user, r]));

    const agentLogFilter = campaignId ? 'AND campaign_id = ?' : '';
    const agentLogRows = await query<{ user: string; active_days: number; talk_sec: number }>(
      `SELECT user, COUNT(DISTINCT DATE(event_time)) AS active_days, SUM(talk_sec) AS talk_sec
       FROM vicidial_agent_log
       WHERE event_time BETWEEN ? AND ? ${agentLogFilter}
       GROUP BY user`,
      [startTs, endTs, ...campaignParam],
    );
    const agentLogByUser = new Map(agentLogRows.map((r) => [r.user, r]));

    const lastLoginRows = await query<{ user: string; last_login: string }>(
      `SELECT user, MAX(event_date) AS last_login FROM vicidial_user_log WHERE event = 'LOGIN' GROUP BY user`,
    );
    const lastLoginByUser = new Map(lastLoginRows.map((r) => [r.user, r.last_login]));

    const agentPerformance = agentRows
      .map((r) => {
        const calls = callStatsByUser.get(r.user);
        const log = agentLogByUser.get(r.user);
        return {
          user: r.user,
          fullName: r.full_name?.trim() || r.user,
          team: r.user_group || 'Default',
          role: mapRole(r.user_level),
          callsHandled: calls?.calls ?? 0,
          activeDays: log?.active_days ?? 0,
          talkTimeSec: Number(log?.talk_sec ?? 0),
          conversions: Number(calls?.conversions ?? 0),
          lastLogin: lastLoginByUser.get(r.user) ?? null,
          active: r.active === 'Y',
        };
      })
      .sort((a, b) => b.callsHandled - a.callsHandled);

    res.json({
      kpis: {
        totalCalls,
        answeredCalls,
        avgHandleSec,
        contactRatePct: totalCalls ? Math.round((answeredCalls / totalCalls) * 100) : 0,
        conversionRatePct: totalCalls ? Math.round((conversions / totalCalls) * 100) : 0,
        abandonedCalls,
      },
      trend: { dates, totalCalls: totalSeries, answeredCalls: answeredSeries, abandonedCalls: abandonedSeries },
      heatmap: { data: heatmapData },
      topCampaigns,
      agentPerformance,
    });
  } catch (err) {
    next(err);
  }
});
