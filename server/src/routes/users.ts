import { Router } from 'express';
import { query } from '../db.js';
import type { ApiUser } from '../types.js';

type Role = 'Administrator' | 'Supervisor' | 'Agent';

function mapRole(userLevel: number): Role {
  if (userLevel >= 9) return 'Administrator';
  if (userLevel >= 5) return 'Supervisor';
  return 'Agent';
}

interface UserRow {
  user_id: number;
  user: string;
  full_name: string;
  user_level: number;
  user_group: string;
  active: 'Y' | 'N';
}

export const usersRouter = Router();

usersRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await query<UserRow>(
      `SELECT user_id, user, full_name, user_level, user_group, active
       FROM vicidial_users
       WHERE user NOT IN ('VDAD', 'VDCL')
       ORDER BY full_name`,
    );
    const users: ApiUser[] = rows.map((row) => ({
      id: row.user_id,
      username: row.user,
      fullName: row.full_name?.trim() || row.user,
      userLevel: row.user_level,
      role: mapRole(row.user_level),
      userGroup: row.user_group || 'Default',
      status: row.active === 'Y' ? 'Active' : 'Inactive',
    }));
    res.json(users);
  } catch (err) {
    next(err);
  }
});
