import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { requireAuth } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { campaignsRouter } from './routes/campaigns.js';
import { leadsRouter } from './routes/leads.js';
import { dispositionsRouter } from './routes/dispositions.js';
import { usersRouter } from './routes/users.js';

export const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Auth routes are public
app.use('/api/auth', authRouter);

// All other /api/* routes require a valid JWT
app.use('/api', requireAuth);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/dispositions', dispositionsRouter);
app.use('/api/users', usersRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
});
