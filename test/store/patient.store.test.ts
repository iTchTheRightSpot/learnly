import { Pool, PoolClient } from 'pg';
import { poolInstance } from '@mock/pool';
import { DevelopmentLogger } from '@utils/log';
import { MockLiveDatabaseClient } from '@mock/db-client';
import { IPatientStore, PatientStore } from '@stores/patient/patient.store';
import { PatientEntity } from '@models/patient.model';
import { ProfileEntity } from '@models/profile.model';
import { IProfileStore } from '@stores/profile/profile.interface.store';
import { ProfileStore } from '@stores/profile/profile.store';
import { v4 as uuid } from 'uuid';

describe('patient store', () => {
  let pool: Pool;
  let client: PoolClient;
  let store: IPatientStore;
  let profileStore: IProfileStore;
  let profile: ProfileEntity;

  beforeAll(async () => {
    pool = poolInstance();
    client = await pool.connect();
    const logger = new DevelopmentLogger();
    const db = new MockLiveDatabaseClient(client);
    store = new PatientStore(logger, db);
    profileStore = new ProfileStore(logger, db);
  });

  beforeEach(async () => {
    await client.query('BEGIN');
    profile = await profileStore.saveProfile({
      firstname: 'firstname',
      lastname: 'lastname',
      email: 'assessment@email.com',
      password: 'password'
    } as ProfileEntity);
  });

  afterEach(async () => await client.query('ROLLBACK'));

  afterAll(async () => {
    client.release();
    await pool.end();
  });

  it('should save patient & retrieve by profile_id', async () => {
    const id = uuid();
    // method to test
    const patient = await store.save({
      uuid: id,
      profile_id: profile.profile_id
    } as PatientEntity);

    // assert
    expect(patient.patient_id).toBeGreaterThan(0);
    expect(patient.uuid).toEqual(id);
    expect(patient.profile_id).toEqual(profile.profile_id);

    // method to test
    const find = await store.patientByProfileId(patient.profile_id!!);

    // assert
    expect(find).toEqual(patient);
  });
});
