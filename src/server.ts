import { env } from '@utils/env';
import { createApp } from './app';
import { Pool } from 'pg';
import { DevelopmentLogger, ProductionLogger } from '@utils/log';
import { DatabaseClient } from '@stores/db-client';
import { TransactionProvider } from '@stores/transaction';
import { initializeAdapters } from '@stores/adapters';
import { initializeServices } from '@services/services';

const init = () => {
  const pool = new Pool({
    user: env.DB_CONFIG.user,
    password: env.DB_CONFIG.password,
    host: env.DB_CONFIG.host,
    port: env.DB_CONFIG.port,
    database: env.DB_CONFIG.database,
    max: 25,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  });

  const logger = env.COOKIESECURE
    ? new ProductionLogger(env.LOGGER, 'UTC')
    : new DevelopmentLogger('UTC');
  const db = new DatabaseClient(pool);
  const tx = new TransactionProvider(logger, pool);
  const adapters = initializeAdapters(logger, db, tx);
  const services = initializeServices(logger, adapters);

  return createApp(logger, services);
};

init().listen(env.PORT, () => console.log(`api listening on port ${env.PORT}`));
