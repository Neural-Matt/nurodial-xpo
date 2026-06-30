import { Router } from 'express';
import { query } from '../db.js';
import type { ApiDisposition } from '../types.js';

// Column names reflect documented VICIDial schema but are NOT verified
// against this specific install yet. Run `DESCRIBE vicidial_statuses;` on
// the real DB and adjust below if anything doesn't match.
interface StatusRow {
  status: string;
  status_name: string;
  selectable: 'Y' | 'N';
  human_answered: 'Y' | 'N';
  sale: 'Y' | 'N' | null;
  dnc: 'Y' | 'N' | null;
}

export const dispositionsRouter = Router();

dispositionsRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await query<StatusRow>(
      `SELECT status, status_name, selectable, human_answered, sale, dnc
       FROM vicidial_statuses
       ORDER BY status_name`,
    );
    const dispositions: ApiDisposition[] = rows.map((row) => ({
      statusCode: row.status,
      label: row.status_name,
      selectable: row.selectable === 'Y',
      humanAnswered: row.human_answered === 'Y',
      sale: row.sale === 'Y',
      dnc: row.dnc === 'Y',
    }));
    res.json(dispositions);
  } catch (err) {
    next(err);
  }
});
