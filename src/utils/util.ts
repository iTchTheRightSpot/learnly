import { Pool } from 'pg';
import { env } from '@utils/env';
import { ILogger } from '@utils/log';

export const twoDaysInSeconds = 172800;

export const dbPool = (logger: ILogger) =>
  new Pool({
    user: env.DB_CONFIG.user,
    password: env.DB_CONFIG.password,
    host: env.DB_CONFIG.host,
    port: env.DB_CONFIG.port,
    database: env.DB_CONFIG.database,
    min: 10,
    max: 25,
    log: (m) => logger.log(m),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  });
