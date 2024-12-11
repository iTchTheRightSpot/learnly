import { Pool } from 'pg';
import { dbPool } from '@utils/util';
import { ILogger } from '@utils/log';

let pool: Pool | undefined = undefined;

export const poolInstance = (logger: ILogger) => {
  if (!pool) {
    pool = dbPool(logger);
  }
  return pool;
};

export const truncate = async (p: Pool) =>
  await p.query(
    'TRUNCATE permission, role, profile, reservation_test_type, reservation, staff_test_type, test_type, staff, patient CASCADE'
  );
