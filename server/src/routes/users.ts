import { Router } from 'express';
import { query } from '../db.js';
import { writeQuery } from '../writeDb.js';
import type { ApiUser } from '../types.js';

type Role = 'Administrator' | 'Supervisor' | 'Agent';

function mapRole(userLevel: number): Role {
  if (userLevel >= 9) return 'Administrator';
  if (userLevel >= 5) return 'Supervisor';
  return 'Agent';
}

const ROLE_TO_LEVEL: Record<Role, number> = {
  Administrator: 9,
  Supervisor: 5,
  Agent: 1,
};

const USERNAME_PATTERN = /^[A-Za-z0-9_]{2,20}$/;

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

// GET /api/users/groups — real vicidial_user_groups for the create/edit form
usersRouter.get('/groups', async (_req, res, next) => {
  try {
    const rows = await query<{ user_group: string; group_name: string }>(
      'SELECT user_group, group_name FROM vicidial_user_groups ORDER BY group_name',
    );
    res.json(rows.map((r) => ({ userGroup: r.user_group, groupName: r.group_name })));
  } catch (err) {
    next(err);
  }
});

// POST /api/users — create a VICIdial user. Supervisors may only create
// Agent/Supervisor accounts; only Administrators can create Administrators.
usersRouter.post('/', async (req, res, next) => {
  try {
    const callerRole = req.jwtUser!.role;
    const { username, password, fullName, role, userGroup } = req.body as {
      username?: string; password?: string; fullName?: string; role?: Role; userGroup?: string;
    };

    if (!username || !password || !fullName || !role) {
      return res.status(400).json({ error: 'username, password, fullName, and role are required.' });
    }
    if (!USERNAME_PATTERN.test(username)) {
      return res.status(400).json({ error: 'Username must be 2-20 characters (letters, numbers, underscore only).' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (!(role in ROLE_TO_LEVEL)) {
      return res.status(400).json({ error: 'role must be Administrator, Supervisor, or Agent.' });
    }
    if (role === 'Administrator' && callerRole !== 'Administrator') {
      return res.status(403).json({ error: 'Only Administrators can create Administrator accounts.' });
    }

    const existing = await query<{ cnt: number }>(
      'SELECT COUNT(*) AS cnt FROM vicidial_users WHERE user = ?',
      [username],
    );
    if (existing[0]?.cnt) {
      return res.status(409).json({ error: `Username "${username}" already exists.` });
    }

    await writeQuery(
      `INSERT INTO vicidial_users (user, pass, full_name, user_level, user_group, active)
       VALUES (?, ?, ?, ?, ?, 'Y')`,
      [username, password, fullName, ROLE_TO_LEVEL[role], userGroup || 'ADMIN'],
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id — edit an existing user. Supervisors may only edit
// Agent/Supervisor accounts and cannot promote anyone to Administrator.
// Nobody can deactivate or downgrade their own account (avoids self-lockout).
usersRouter.patch('/:id', async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }

    const callerRole = req.jwtUser!.role;
    const callerUsername = req.jwtUser!.sub;
    const { fullName, role, userGroup, active, password } = req.body as {
      fullName?: string; role?: Role; userGroup?: string; active?: boolean; password?: string;
    };

    const targetRows = await query<{ user: string; user_level: number }>(
      'SELECT user, user_level FROM vicidial_users WHERE user_id = ? LIMIT 1',
      [userId],
    );
    if (!targetRows.length) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const target = targetRows[0];
    const isSelf = target.user === callerUsername;
    const targetIsAdmin = target.user_level >= 9;

    if ((targetIsAdmin || role === 'Administrator') && callerRole !== 'Administrator') {
      return res.status(403).json({ error: 'Only Administrators can manage Administrator accounts.' });
    }
    if (isSelf && active === false) {
      return res.status(400).json({ error: 'You cannot deactivate your own account.' });
    }
    if (isSelf && role && ROLE_TO_LEVEL[role] < target.user_level) {
      return res.status(400).json({ error: 'You cannot downgrade your own role.' });
    }
    if (password && password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const sets: string[] = [];
    const params: unknown[] = [];
    if (fullName) { sets.push('full_name = ?'); params.push(fullName); }
    if (role) { sets.push('user_level = ?'); params.push(ROLE_TO_LEVEL[role]); }
    if (userGroup) { sets.push('user_group = ?'); params.push(userGroup); }
    if (active !== undefined) { sets.push('active = ?'); params.push(active ? 'Y' : 'N'); }
    if (password) { sets.push('pass = ?'); params.push(password); }

    if (!sets.length) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    params.push(userId);
    await writeQuery(`UPDATE vicidial_users SET ${sets.join(', ')} WHERE user_id = ?`, params);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
