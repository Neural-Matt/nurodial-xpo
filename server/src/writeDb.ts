import mysql, { type ResultSetHeader } from 'mysql2/promise';

// Separate write pool — nurodial_agent has narrowly scoped write grants
// (external_* columns on vicidial_live_agents; INSERT/UPDATE on
// vicidial_callbacks). Shared by any route that needs to write.
export const writePool = mysql.createPool({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_AGENT_USER ?? 'nurodial_agent',
  password: process.env.DB_AGENT_PASS ?? '',
  database: process.env.DB_NAME ?? 'asterisk',
  waitForConnections: true,
  connectionLimit: 10,
});

export async function writeQuery(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const [result] = await writePool.query<ResultSetHeader>(sql, params);
  return result;
}
