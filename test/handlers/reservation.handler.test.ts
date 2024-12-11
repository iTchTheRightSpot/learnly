import { Application } from 'express';
import { Pool } from 'pg';
import { Adapters, initializeAdapters } from '@stores/adapters';
import { poolInstance, truncate } from '@mock/pool';
import { DevelopmentLogger } from '@utils/log';
import { DatabaseClient } from '@stores/db-client';
import { TransactionProvider } from '@stores/transaction';
import { createApp } from '@learnly/app';
import { initializeServices, ServicesRegistry } from '@services/services';
import { twoDaysInSeconds } from '@utils/util';
import { JwtObject } from '@models/auth.model';
import { PermissionEnum, RoleEnum } from '@models/profile.model';
import request from 'supertest';
import { env } from '@utils/env';
import { v4 as uuid } from 'uuid';

describe('reservation handler', () => {
  let app: Application;
  let pool: Pool;
  let adapters: Adapters;
  let services: ServicesRegistry;

  beforeAll(async () => {
    const logger = new DevelopmentLogger();
    pool = poolInstance(logger);
    const db = new DatabaseClient(pool);
    const tx = new TransactionProvider(logger, pool);
    adapters = initializeAdapters(logger, db, tx);
    services = initializeServices(logger, adapters);
    app = createApp(logger, services);
  });

  const tokenBuilder = async (obj: JwtObject) =>
    await services.jwtService.encode(obj, twoDaysInSeconds);

  afterEach(async () => await truncate(pool));

  afterAll(async () => await pool.end());

  // TODO
  describe('flow to create a reservation', () => {
    it('reject request. staff trying to make a reservation for himself/herself', async () => {
      // given
      const email = `${uuid()}@email.com`;
      const token = (
        await tokenBuilder({
          user_id: 'uuid',
          access_controls: [
            { role: RoleEnum.PATIENT, permissions: [PermissionEnum.READ] }
          ]
        })
      ).token;

      // user create an account
      await request(app)
        .post(`${env.ROUTE_PREFIX}authentication/register`)
        .send({
          firstname: 'doctor',
          lastname: 'lastname',
          email: email,
          password: 'paSsworD123#'
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(201);
    });
  });
});
