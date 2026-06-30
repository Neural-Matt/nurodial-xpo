import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { config } from '../config.js';

type Role = 'Administrator' | 'Supervisor' | 'Agent';

interface VicidialUser {
  user: string;
  full_name: string;
  user_level: number;
}

function mapRole(userLevel: number): Role {
  if (userLevel >= 9) return 'Administrator';
  if (userLevel >= 5) return 'Supervisor';
  return 'Agent';
}

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required.' });
      return;
    }

    const rows = await query<VicidialUser>(
      `SELECT user, full_name, user_level FROM vicidial_users
       WHERE user = ? AND pass = ? AND active = 'Y' LIMIT 1`,
      [username, password],
    );

    if (rows.length === 0) {
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }

    const vUser = rows[0];
    const role = mapRole(vUser.user_level);
    const displayName = vUser.full_name?.trim() || vUser.user;

    const token = jwt.sign(
      { sub: vUser.user, displayName, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] },
    );

    res.json({
      token,
      user: { id: vUser.user, username: vUser.user, displayName, role },
    });
  } catch (err) {
    next(err);
  }
});
