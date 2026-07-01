import 'dotenv/config';

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  // Comma-separated list — supports serving the app from more than one
  // origin at once (e.g. the plain dev server alongside the HTTPS reverse
  // proxy during a gradual cutover).
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map((o) => o.trim()),
  db: {
    host: requireEnv('DB_HOST'),
    port: Number(process.env.DB_PORT ?? 3306),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASS'),
    database: process.env.DB_NAME ?? 'asterisk',
  },
  dbAgent: {
    // Separate write pool credentials — narrowly scoped grants, see
    // server/src/writeDb.ts and project memory for the exact grant list.
    user: requireEnv('DB_AGENT_USER'),
    password: requireEnv('DB_AGENT_PASS'),
  },
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  },
};
