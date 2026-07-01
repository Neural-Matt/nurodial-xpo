import mysql, { type ResultSetHeader } from 'mysql2/promise';
import { config } from './config.js';

// Separate write pool — nurodial_agent has narrowly scoped write grants
// (see project memory for the exact grant list, which has grown table by
// table as features were added). Shared by any route that needs to write.
// Sourced from the shared config object (not process.env directly) so
// credentials are required, not silently defaulted to an empty password.
export const writePool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.dbAgent.user,
  password: config.dbAgent.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function writeQuery(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const [result] = await writePool.query<ResultSetHeader>(sql, params);
  return result;
}
