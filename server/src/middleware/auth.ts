import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface JwtUser {
  sub: string;
  displayName: string;
  role: 'Administrator' | 'Supervisor' | 'Agent';
}

declare global {
  namespace Express {
    interface Request {
      jwtUser?: JwtUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization required.' });
    return;
  }
  try {
    req.jwtUser = jwt.verify(header.slice(7), config.jwt.secret) as JwtUser;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
