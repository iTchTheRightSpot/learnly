import {
  IReservationStore,
  ReservationStore
} from '@stores/reservation/reservation.store';
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
import {
  ReservationEntity,
  ReservationStatus,
  ReservationTestTypeEntity
} from '@models/reservation.model';
import { IPatientStore, PatientStore } from '@stores/patient/patient.store';
import { PatientEntity } from '@models/patient.model';

describe(`${ReservationStore.name} test`, () => {
  let pool: Pool;
  const logger = new DevelopmentLogger();
  let client: PoolClient;
  let reservationStore: IReservationStore;
  let testTypeStore: ITestTypeStore;
  let patientStore: IPatientStore;
  let patient: PatientEntity;
  let staffStore: IStaffStore;
  let staff: StaffEntity;
  let testType: TestTypeEntity;

  beforeAll(async () => {
    pool = poolInstance();
    client = await pool.connect();
    const db = new MockLiveDatabaseClient(client);
    reservationStore = new ReservationStore(logger, db);
    testTypeStore = new TestTypeStore(logger, db);
    patientStore = new PatientStore(logger, db);
    staffStore = new StaffStore(logger, db);
  });

  beforeEach(async () => {
    await client.query('BEGIN');

    patient = await patientStore.save({} as PatientEntity);
    staff = await staffStore.save({} as StaffEntity);
    testType = await testTypeStore.saveTestType({
      name: 'blood test',
      duration: 3600,
      clean_up_time: 30 * 60
    } as TestTypeEntity);
    await testTypeStore.saveStaffTestType({
      staff_id: staff.staff_id,
      test_id: testType.test_id
    } as StaffTestTypeEntity);
  });

  afterEach(async () => await client.query('ROLLBACK'));

  afterAll(async () => {
    client.release();
    await pool.end();
  });

  it('should save Reservation & ReservationTestType', async () => {
    // given
    const given = {
      patient_id: patient.patient_id,
      staff_id: staff.staff_id,
      status: ReservationStatus.CONFIRMED,
      created_at: logger.date(),
      scheduled_for: logger.date(),
      expire_at: logger.date()
    } as ReservationEntity;

    // method to test
    const reservation = await reservationStore.save(given);

    // assert
    expect(reservation.reservation_id).toBeGreaterThan(0);
    expect(reservation.status).toEqual(given.status);
    expect(reservation.patient_id).toEqual(given.patient_id);
    expect(reservation.staff_id).toEqual(given.staff_id);

    // given
    const rt = {
      test_id: testType.test_id,
      reservation_id: reservation.reservation_id
    } as ReservationTestTypeEntity;

    // method to test
    const save = await reservationStore.saveReservationTestType(rt);

    // assert
    expect(save.junction_id).toBeGreaterThan(0);
    expect(save.reservation_id).toEqual(reservation.reservation_id);
    expect(save.test_id).toEqual(rt.test_id);
  });
});
