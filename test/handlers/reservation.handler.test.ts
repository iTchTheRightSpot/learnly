import { Application } from 'express';
import { Pool, PoolClient } from 'pg';
import { Adapters, initializeAdapters } from '@stores/adapters';
import { poolInstance } from '@mock/pool';
import { DevelopmentLogger } from '@utils/log';
import { createApp } from '@learnly/app';
import { initializeServices, ServicesRegistry } from '@services/services';
import { twoDaysInSeconds } from '@utils/util';
import { JwtObject } from '@models/auth.model';
import {
  PermissionEnum,
  ProfileEntity,
  RoleEntity,
  RoleEnum
} from '@models/profile.model';
import request from 'supertest';
import { env } from '@utils/env';
import { v4 as uuid } from 'uuid';
import { StaffEntity } from '@models/staff.model';
import { PatientEntity } from '@models/patient.model';
import { StaffTestTypeEntity, TestTypeEntity } from '@models/test_type.model';
import { MockLiveDatabaseClient } from '@mock/db-client';
import { MockLiveTransactionProvider } from '@mock/transaction';

describe('reservation handler', () => {
  let app: Application;
  let pool: Pool;
  let client: PoolClient;
  let adapters: Adapters;
  let services: ServicesRegistry;
  const logger = new DevelopmentLogger();
  let patientProfile: ProfileEntity;
  let patient: PatientEntity;
  let staffProfile: ProfileEntity;
  let staff: StaffEntity;
  let type: TestTypeEntity;

  beforeAll(async () => {
    pool = poolInstance(logger);
    client = await pool.connect();
    const db = new MockLiveDatabaseClient(client);
    const tx = new MockLiveTransactionProvider(logger, client);
    adapters = initializeAdapters(logger, db, tx);
    services = initializeServices(logger, adapters);
    app = createApp(logger, services);
  });

  beforeEach(async () => {
    await client.query('BEGIN');

    // patient account
    patientProfile = await adapters.profileStore.saveProfile({
      firstname: uuid(),
      lastname: uuid(),
      email: `${uuid()}@email.com`,
      password: 'password'
    } as ProfileEntity);

    patient = await adapters.patientStore.save({
      profile_id: patientProfile.profile_id
    } as PatientEntity);

    await adapters.profileStore.saveRole({
      profile_id: patientProfile.profile_id,
      role: RoleEnum.PATIENT
    } as RoleEntity);

    // staff
    staffProfile = await adapters.profileStore.saveProfile({
      firstname: uuid(),
      lastname: uuid(),
      email: `${uuid()}@email.com`,
      password: 'password'
    } as ProfileEntity);

    await adapters.patientStore.save({
      profile_id: staffProfile.profile_id
    } as PatientEntity);

    await adapters.profileStore.saveRole({
      profile_id: staffProfile.profile_id,
      role: RoleEnum.DOCTOR
    } as RoleEntity);

    staff = await adapters.staffStore.save({
      profile_id: staffProfile.profile_id
    } as StaffEntity);

    // save test type & assign to a doctor
    type = await adapters.testTypeStore.saveTestType({
      name: 'blood work',
      duration: 3600,
      clean_up_time: 30 * 60
    } as TestTypeEntity);

    await adapters.testTypeStore.saveStaffTestType({
      staff_id: staff.staff_id,
      test_id: type.test_id
    } as StaffTestTypeEntity);
  });

  afterEach(async () => await client.query('ROLLBACK'));

  afterAll(async () => {
    client.release();
    await pool.end();
  });

  const tokenBuilder = async (obj: JwtObject) =>
    await services.jwtService.encode(obj, twoDaysInSeconds);

  it('reject reservation request. staff attempting to reserve their own time', async () => {
    // given
    const d = logger.date();
    d.setSeconds(d.getSeconds() + 3 * 60 * 60);
    const token = (
      await tokenBuilder({
        user_id: staff.uuid,
        access_controls: [
          {
            role: RoleEnum.DOCTOR,
            permissions: [PermissionEnum.READ, PermissionEnum.WRITE]
          }
        ]
      })
    ).token;

    await request(app)
      .post(`${env.ROUTE_PREFIX}reservation`)
      .send({
        staff_id: staff.uuid,
        name: staffProfile.firstname,
        email: staffProfile.email,
        test_types: [type.name],
        time: d.getTime()
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', [`${env.COOKIENAME}=${token}`])
      .expect(400)
      .expect({
        status: 400,
        message: 'cannot make a reservation for yourself'
      });
  });

  it('should create a reservation', async () => {
    // given
    const d = logger.date();
    d.setSeconds(d.getSeconds() + 3 * 60 * 60);

    // route to test
    const token = (
      await tokenBuilder({
        user_id: patient.uuid,
        access_controls: [
          {
            role: RoleEnum.PATIENT,
            permissions: [PermissionEnum.READ]
          }
        ]
      })
    ).token;

    await request(app)
      .post(`${env.ROUTE_PREFIX}reservation`)
      .send({
        staff_id: staff.uuid,
        name: patientProfile.firstname,
        email: patientProfile.email,
        test_types: [type.name],
        time: d.getTime()
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', [`${env.COOKIENAME}=${token}`])
      .expect(201);
  });
});
