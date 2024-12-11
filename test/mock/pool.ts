import { Pool } from 'pg';
import { env } from '@utils/env';

let pool: Pool | undefined = undefined;

export const poolInstance = () => {
  if (!pool) {
    try {
      pool = new Pool({
        user: env.DB_CONFIG.user,
        password: env.DB_CONFIG.password,
        host: env.DB_CONFIG.host,
        port: env.DB_CONFIG.port,
        database: env.DB_CONFIG.database,
        max: 25,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      });
    } catch (e) {
      console.error(`failed to initialize db connection ${e}`);
      process.exit(1);
    }
  }
  return pool;
};

export const truncate = async (p: Pool) =>
  await p.query('TRUNCATE profile, role, permission, patient, staff CASCADE');
