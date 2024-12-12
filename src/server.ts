import { env } from '@utils/env';
import { createApp } from './app';
import { DevelopmentLogger, ProductionLogger } from '@utils/log';
import { DatabaseClient } from '@stores/db-client';
import { TransactionProvider } from '@stores/transaction';
import { initializeAdapters } from '@stores/adapters';
import { initializeServices } from '@services/services';
import { dbPool } from '@utils/util';

const init = () => {
  const logger = env.COOKIESECURE
    ? new ProductionLogger(env.LOGGER, 'UTC')
    : new DevelopmentLogger('UTC');
  const pool = dbPool(logger);
  const db = new DatabaseClient(pool);
  const tx = new TransactionProvider(logger, pool);
  const adapters = initializeAdapters(logger, db, tx);
  const services = initializeServices(logger, adapters);

  return createApp(logger, services);
};

init().listen(env.PORT, () => console.log(`api listening on port ${env.PORT}`));
