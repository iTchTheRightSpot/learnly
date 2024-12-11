import request from 'supertest';
import { env } from '@utils/env';
import { Pool } from 'pg';
import { Application } from 'express';
import { Adapters, initializeAdapters } from '@stores/adapters';
import { initializeServices } from '@services/services';
import { DevelopmentLogger } from '@utils/log';
import { createApp } from '@learnly/app';
import { poolInstance, truncate } from '@mock/pool';
import { DatabaseClient } from '@stores/db-client';
import { TransactionProvider } from '@stores/transaction';

describe('auth handler', () => {
  let app: Application;
  let pool: Pool;
  let adapters: Adapters;

  beforeAll(async () => {
    pool = poolInstance();
    const logger = new DevelopmentLogger();
    const db = new DatabaseClient(pool);
    const tx = new TransactionProvider(logger, pool);
    adapters = initializeAdapters(logger, db, tx);
    app = createApp(logger, initializeServices(logger, adapters));
  });

  afterEach(async () => await truncate(pool));

  afterAll(async () => await pool.end());

  describe('flow to register & login', () => {
    it('patient (success)', async () => {
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
        .post(`${env.ROUTE_PREFIX}authentication/login/patient`)
        .send({
          email: 'patient@email.com',
          password: 'paSsworD123#'
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(204);
    });

    it('(doctor) reject request. role and permissions have not been added', async () => {
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
        .expect(404)
        .expect({ message: 'invalid staff', status: 404 });
    });
  });
});
