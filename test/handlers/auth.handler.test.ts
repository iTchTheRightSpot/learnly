import request from 'supertest';
import { env } from '@utils/env';
import { Pool, PoolClient } from 'pg';
import { Application } from 'express';
import { Adapters, initializeAdapters } from '@stores/adapters';
import { initializeServices } from '@services/services';
import { DevelopmentLogger } from '@utils/log';
import { createApp } from '@learnly/app';
import { poolInstance } from '@mock/pool';
import { MockLiveDatabaseClient } from '@mock/db-client';
import { MockLiveTransactionProvider } from '@mock/transaction';

describe('auth handler', () => {
  let app: Application;
  let pool: Pool;
  let client: PoolClient;
  let adapters: Adapters;
  const log = new DevelopmentLogger();

  beforeAll(async () => {
    pool = poolInstance();
    client = await pool.connect();
    const db = new MockLiveDatabaseClient(client);
    const tx = new MockLiveTransactionProvider(log, client);
    adapters = initializeAdapters(log, db, tx);
    app = createApp(log, initializeServices(log, adapters));
  });

  afterEach(async () => await client.query('ROLLBACK'));

  afterAll(async () => {
    client.release();
    await pool.end();
  });

  describe('flow to register & login', () => {
    it('patient', async () => {
      await request(app)
        .post(`${env.ROUTE_PREFIX}authentication/register`)
        .send({
          firstname: 'patient',
          lastname: 'lastname',
          email: 'patient@email.com',
          password: 'paSsworD123#'
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(201);

      await request(app)
        .post(`${env.ROUTE_PREFIX}authentication/login`)
        .send({
          email: 'patient@email.com',
          password: 'paSsworD123#'
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(204);
    });

    it('doctor', async () => {
      await request(app)
        .post(`${env.ROUTE_PREFIX}authentication/register`)
        .send({
          firstname: 'doctor',
          lastname: 'lastname',
          email: 'doctor@email.com',
          password: 'paSsworD123#'
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(201);

      await request(app)
        .post(`${env.ROUTE_PREFIX}authentication/login/staff`)
        .send({
          email: 'doctor@email.com',
          password: 'paSsworD123#'
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(204);
    });
  });
});
