import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { requireAuth } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { campaignsRouter } from './routes/campaigns.js';
import { leadsRouter } from './routes/leads.js';
import { dispositionsRouter } from './routes/dispositions.js';
import { usersRouter } from './routes/users.js';
import { liveAgentsRouter } from './routes/liveAgents.js';
import { agentStatsRouter } from './routes/agentStats.js';
import { dashboardStatsRouter } from './routes/dashboardStats.js';
import { agentApiRouter } from './routes/agentApi.js';
import { callbacksRouter } from './routes/callbacks.js';
import { callLogRouter } from './routes/callLog.js';
import { listsRouter } from './routes/lists.js';
import { dncRouter } from './routes/dnc.js';
import { supervisorApiRouter } from './routes/supervisorApi.js';
import { analyticsRouter } from './routes/analytics.js';

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
app.use('/api/live-agents', liveAgentsRouter);
app.use('/api/agent-stats', agentStatsRouter);
app.use('/api/dashboard-stats', dashboardStatsRouter);
app.use('/api/agent', agentApiRouter);
app.use('/api/callbacks', callbacksRouter);
app.use('/api/call-log', callLogRouter);
app.use('/api/lists', listsRouter);
app.use('/api/dnc', dncRouter);
app.use('/api/supervisor', supervisorApiRouter);
app.use('/api/analytics', analyticsRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
});
