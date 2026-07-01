import mysql from 'mysql2/promise';
import { config } from './config.js';

// Read-only pool by design — this phase of the integration only ever SELECTs.
// Point DB_USER at a MySQL account with SELECT-only grants on the VICIDial
// (`asterisk`) schema; don't widen this to a writer account until the
// Non-Agent API / AMI write paths are actually built (see server/README.md).
export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  // Without this, mysql2 returns DATETIME/TIMESTAMP columns as JS Date
  // objects, which JSON.stringify renders as UTC-suffixed ISO strings —
  // silently shifting VICIdial's local wall-clock times by the server's
  // UTC offset. Every route interface already types these columns as
  // plain strings, so keep them as the raw 'YYYY-MM-DD HH:mm:ss' text.
  dateStrings: true,
});

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}
