import { Application } from 'express';
import { Pool, PoolClient } from 'pg';
import { DevelopmentLogger } from '@utils/log';
import { poolInstance } from '@mock/pool';
import { Adapters, initializeAdapters } from '@stores/adapters';
import { initializeServices, ServicesRegistry } from '@services/services';
import { createApp } from '@learnly/app';
import { JwtObject } from '@models/auth.model';
import { twoDaysInSeconds } from '@utils/util';
import { env } from '@utils/env';
import request from 'supertest';
import { v4 as uuid } from 'uuid';
import { RoleEnum } from '@models/profile.model';
import { TestTypeEntity } from '@models/test_type.model';
import { MockLiveDatabaseClient } from '@mock/db-client';
import { MockLiveTransactionProvider } from '@mock/transaction';

describe('test type handler', () => {
  let app: Application;
  let pool: Pool;
  let client: PoolClient;
  let adapters: Adapters;
  let services: ServicesRegistry;

  beforeAll(async () => {
    const logger = new DevelopmentLogger();
    pool = poolInstance(logger);
    client = await pool.connect();
    const db = new MockLiveDatabaseClient(client);
    const tx = new MockLiveTransactionProvider(logger, client);
    adapters = initializeAdapters(logger, db, tx);
    services = initializeServices(logger, adapters);
    app = createApp(logger, services);
  });

  beforeEach(async () => await client.query('BEGIN'));

  afterEach(async () => await client.query('ROLLBACK'));

  afterAll(async () => {
    client.release();
    await pool.end();
  });

  const tokenBuilder = async (obj: JwtObject) =>
    await services.jwtService.encode(obj, twoDaysInSeconds);

  it('should return all test types', async () => {
    // given
    const token = (
      await tokenBuilder({
        user_id: 'uuid',
        access_controls: [{ role: RoleEnum.PATIENT, permissions: [] }]
      })
    ).token;

    await adapters.testTypeStore.saveTestType({
      name: 'blood work',
      duration: 3600,
      clean_up_time: 30 * 60
    } as TestTypeEntity);

    await adapters.testTypeStore.saveTestType({
      name: 'IV drip',
      duration: 3600,
      clean_up_time: 30 * 60
    } as TestTypeEntity);

    // route to test
    const res = await request(app)
      .get(`${env.ROUTE_PREFIX}test-type`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', [`${env.COOKIENAME}=${token}`]);

    expect(res.status).toEqual(200);
    const body = res.body as { type: string }[];
    expect(body.length).toBeGreaterThan(2);
  });
});
