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
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
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
