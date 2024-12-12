import { ReservationStore } from '@stores/reservation/reservation.store';
import { Pool, PoolClient } from 'pg';
import { poolInstance } from '@mock/pool';
import { DevelopmentLogger } from '@utils/log';
import { MockLiveDatabaseClient } from '@mock/db-client';
import {
  ITestTypeStore,
  TestTypeStore
} from '@stores/test_type/test-type.store';
import { IStaffStore, StaffStore } from '@stores/staff/staff.store';
import { StaffEntity } from '@models/staff.model';
import { StaffTestTypeEntity, TestTypeEntity } from '@models/test_type.model';

describe(`${ReservationStore.name} test`, () => {
  let pool: Pool;
  let client: PoolClient;
  let testTypeStore: ITestTypeStore;
  let staffStore: IStaffStore;
  let staff: StaffEntity;

  beforeAll(async () => {
    const logger = new DevelopmentLogger();
    pool = poolInstance(logger);
    client = await pool.connect();
    const db = new MockLiveDatabaseClient(client);
    testTypeStore = new TestTypeStore(logger, db);
    staffStore = new StaffStore(logger, db);
  });

  beforeEach(async () => {
    await client.query('BEGIN');
    staff = await staffStore.save({} as StaffEntity);
  });

  afterEach(async () => await client.query('ROLLBACK'));

  afterAll(async () => {
    client.release();
    await pool.end();
  });

  it('should save TestTypeEntity & StaffTestTypeEntity & retrieve TestTypes by staffId & retrieve all TestTypes ', async () => {
    // given
    const given = {
      name: 'blood test',
      duration: 3600,
      clean_up_time: 30 * 60
    } as TestTypeEntity;

    // method to test
    await testTypeStore.saveTestType({
      name: 'IV drip',
      duration: 3600,
      clean_up_time: 30 * 60
    } as TestTypeEntity);
    const type = await testTypeStore.saveTestType(given);

    // assert
    expect(type.test_id).toBeGreaterThan(0);
    expect(type.name).toEqual(given.name);
    expect(type.duration).toEqual(given.duration);
    expect(type.clean_up_time).toEqual(given.clean_up_time);

    // given
    const st = {
      staff_id: staff.staff_id,
      test_id: type.test_id
    } as StaffTestTypeEntity;

    // method to test
    const save = await testTypeStore.saveStaffTestType(st);

    // assert
    expect(save.junction_id).toBeGreaterThan(0);

    // method to test & assert
    const staffTestTypes = await testTypeStore.testTypesByStaffId(
      staff.staff_id
    );
    expect(staffTestTypes.length).toEqual(1);
    expect(staffTestTypes[0]).toEqual(type);

    // method to test and assert
    const types = await testTypeStore.allTestTypes();
    expect(types.length).toEqual(2);
  });
});
