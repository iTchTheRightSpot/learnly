import { Pool, PoolClient } from 'pg';
import { poolInstance } from '@mock/pool';
import { DevelopmentLogger } from '@utils/log';
import { MockLiveDatabaseClient } from '@mock/db-client';
import { ProfileEntity } from '@models/profile.model';
import { IProfileStore } from '@stores/profile/profile.interface.store';
import { ProfileStore } from '@stores/profile/profile.store';
import { v4 as uuid } from 'uuid';
import { IStaffStore, StaffStore } from '@stores/staff/staff.store';
import { StaffEntity } from '@models/staff.model';

describe('patient store', () => {
  let pool: Pool;
  let client: PoolClient;
  let store: IStaffStore;
  let profileStore: IProfileStore;
  let profile: ProfileEntity;

  beforeAll(async () => {
    const logger = new DevelopmentLogger();
    pool = poolInstance(logger);
    client = await pool.connect();
    const db = new MockLiveDatabaseClient(client);
    store = new StaffStore(logger, db);
    profileStore = new ProfileStore(logger, db);
  });

  beforeEach(async () => {
    await client.query('BEGIN');
    profile = await profileStore.saveProfile({
      firstname: 'firstname',
      lastname: 'lastname',
      email: 'staff@email.com',
      password: 'password'
    } as ProfileEntity);
  });

  afterEach(async () => await client.query('ROLLBACK'));

  afterAll(async () => {
    client.release();
    await pool.end();
  });

  it('should save staff & retrieve by profile_id', async () => {
    // given
    const id = uuid();

    // method to test
    const staff = await store.save({
      uuid: id,
      profile_id: profile.profile_id
    } as StaffEntity);

    // assert
    expect(staff.staff_id).toBeGreaterThan(0);
    expect(staff.uuid).toEqual(id);
    expect(staff.profile_id).toEqual(profile.profile_id);

    // method to test
    const find = await store.staffByProfileId(staff.profile_id!!);

    // assert
    expect(find).toEqual(staff);
  });
});
