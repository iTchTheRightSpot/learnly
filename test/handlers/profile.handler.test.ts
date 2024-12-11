import { Application } from 'express';
import { Pool } from 'pg';
import { Adapters, initializeAdapters } from '@stores/adapters';
import { poolInstance, truncate } from '@mock/pool';
import { DevelopmentLogger } from '@utils/log';
import { DatabaseClient } from '@stores/db-client';
import { TransactionProvider } from '@stores/transaction';
import { createApp } from '@learnly/app';
import { initializeServices, ServicesRegistry } from '@services/services';
import request from 'supertest';
import { env } from '@utils/env';
import { twoDaysInSeconds } from '@utils/util';
import { JwtObject } from '@models/auth.model';
import { PermissionEnum, RoleEnum } from '@models/profile.model';

describe('profile handler', () => {
  let app: Application;
  let pool: Pool;
  let adapters: Adapters;
  let services: ServicesRegistry;

  beforeAll(async () => {
    pool = poolInstance();
    const logger = new DevelopmentLogger();
    const db = new DatabaseClient(pool);
    const tx = new TransactionProvider(logger, pool);
    adapters = initializeAdapters(logger, db, tx);
    services = initializeServices(logger, adapters);
    app = createApp(logger, services);
  });

  const tokenBuilder = async (obj: JwtObject) =>
    await services.jwtService.createJwt(obj, twoDaysInSeconds);

  afterEach(async () => await truncate(pool));

  afterAll(async () => await pool.end());

  it('should reject request role in payload is not a DOCTOR', async () => {
    // given
    const email = 'doctor@email.com';
    const token = (
      await tokenBuilder({
        user_id: 'uuid',
        access_controls: [
          { role: RoleEnum.DOCTOR, permissions: [PermissionEnum.WRITE] }
        ]
      })
    ).token;

    // route to test
    await request(app)
      .post(`${env.ROUTE_PREFIX}profile/staff`)
      .send({ email: email, role: RoleEnum.PATIENT })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', [`${env.COOKIENAME}=${token}`])
      .expect(400)
      .expect({ message: 'role has to be a Doctor', status: 400 });
  });

  it('should reject request invalid email', async () => {
    // given
    const email = 'doctor@email.com';
    const token = (
      await tokenBuilder({
        user_id: 'uuid',
        access_controls: [
          { role: RoleEnum.DOCTOR, permissions: [PermissionEnum.WRITE] }
        ]
      })
    ).token;

    // route to test
    await request(app)
      .post(`${env.ROUTE_PREFIX}profile/staff`)
      .send({ email: email, role: RoleEnum.DOCTOR })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', [`${env.COOKIENAME}=${token}`])
      .expect(404)
      .expect({ message: `invalid account with email ${email}`, status: 404 });
  });

  it('should assign doctor role if not already assigned and reject if already assigned', async () => {
    // given
    const email = 'doctor@email.com';
    const token = (
      await tokenBuilder({
        user_id: 'uuid',
        access_controls: [
          { role: RoleEnum.DOCTOR, permissions: [PermissionEnum.WRITE] }
        ]
      })
    ).token;

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

    // route to test
    await request(app)
      .post(`${env.ROUTE_PREFIX}profile/staff`)
      .send({ email: email, role: RoleEnum.DOCTOR })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', [`${env.COOKIENAME}=${token}`])
      .expect(201);

    // route to test
    await request(app)
      .post(`${env.ROUTE_PREFIX}profile/staff`)
      .send({ email: email, role: RoleEnum.DOCTOR })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', [`${env.COOKIENAME}=${token}`])
      .expect(400)
      .expect({ message: `role already associated to ${email}`, status: 400 });
  });

  it('should update profile & reject request due to invalid email', async () => {
    // given
    const email = 'doctor@email.com';
    const token = (
      await tokenBuilder({
        user_id: 'uuid',
        access_controls: [
          { role: RoleEnum.PATIENT, permissions: [PermissionEnum.READ] },
          { role: RoleEnum.DOCTOR, permissions: [PermissionEnum.WRITE] }
        ]
      })
    ).token;

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

    // route to test
    await request(app)
      .patch(`${env.ROUTE_PREFIX}profile`)
      .send({ email: email, firstname: 'frank', lastname: 'white' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', [`${env.COOKIENAME}=${token}`])
      .expect(204);

    // route to test
    await request(app)
      .patch(`${env.ROUTE_PREFIX}profile`)
      .send({ email: 'franl@email.com', firstname: 'frank', lastname: 'white' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', [`${env.COOKIENAME}=${token}`])
      .expect(404)
      .expect({ status: 404, message: 'invalid email' });
  });
});
