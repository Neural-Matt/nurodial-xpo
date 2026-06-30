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
});

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}
