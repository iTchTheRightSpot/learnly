import { ITransactionProvider } from './transaction';
import { ILogger } from '@utils/log';
import { IDatabaseClient } from './db-client';
import { IProfileStore } from './profile/profile.interface.store';
import { ProfileStore } from './profile/profile.store';
import { IPatientStore, PatientStore } from './patient/patient.store';
import { IStaffStore, StaffStore } from './staff/staff.store';
import { ITestTypeStore, TestTypeStore } from './test_type/test-type.store';
import {
  IReservationStore,
  ReservationStore
} from './reservation/reservation.store';

/**
 * Holds all classes that directly communicate with the database.
 * Provides access to specific data stores and optional transaction management.
 */
export interface Adapters {
  profileStore: IProfileStore;
  patientStore: IPatientStore;
  staffStore: IStaffStore;
  testTypeStore: ITestTypeStore;
  reservationStore: IReservationStore;
  transaction?: ITransactionProvider;
}

/**
 * Creates an instance of the {@link Adapters}.
 *
 * @param logger - A logging instance.
 * @param client - An instance of {@link IDatabaseClient} for interacting with db.
 * @param tx - An optional instance of {@link ITransactionProvider} for handling transactions.
 */
export const initializeAdapters = (
  logger: ILogger,
  client: IDatabaseClient,
  tx?: ITransactionProvider
): Adapters => ({
  profileStore: new ProfileStore(logger, client),
  patientStore: new PatientStore(logger, client),
  staffStore: new StaffStore(logger, client),
  testTypeStore: new TestTypeStore(logger, client),
  reservationStore: new ReservationStore(logger, client),
  transaction: tx
});
