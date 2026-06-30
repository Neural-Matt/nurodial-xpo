import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization required.' });
    return;
  }
  try {
    jwt.verify(header.slice(7), config.jwt.secret);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
