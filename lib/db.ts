import mysql, { Pool, PoolOptions, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: Pool | undefined;
}

const accessConfig: PoolOptions = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'market_biru',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
};

// Singleton pool to avoid multiple pool instances in Next.js hot reload
export const pool: Pool = global.__mysqlPool || mysql.createPool(accessConfig);

if (process.env.NODE_ENV !== 'production') {
  global.__mysqlPool = pool;
}

/**
 * Execute a SELECT query and return typed rows
 */
export async function queryRows<T extends RowDataPacket>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  try {
    const [results] = await pool.execute<T[]>(sql, params as any);
    return results;
  } catch (error: any) {
    console.error('MySQL Query Error:', error.message, '\nSQL:', sql);
    throw error;
  }
}

/**
 * Execute an INSERT / UPDATE / DELETE query and return result header
 */
export async function queryExec(
  sql: string,
  params?: any[]
): Promise<ResultSetHeader> {
  try {
    const [results] = await pool.execute<ResultSetHeader>(sql, params as any);
    return results;
  } catch (error: any) {
    console.error('MySQL Exec Error:', error.message, '\nSQL:', sql);
    throw error;
  }
}

/**
 * Query helper with generic return type support
 */
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T> {
  try {
    const [results] = await (pool as any).execute(sql, params as any);
    return results as T;
  } catch (error: any) {
    console.error('MySQL Query Error:', error.message, '\nSQL:', sql);
    throw error;
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { connected: true, message: 'Database MySQL Laragon terhubung dengan sukses!' };
  } catch (error: any) {
    return {
      connected: false,
      message: `Gagal terhubung ke MySQL Laragon: ${error.message}. Pastikan MySQL di Laragon sudah Start dan database '${process.env.DB_NAME || 'market_biru'}' sudah dibuat.`,
    };
  }
}
