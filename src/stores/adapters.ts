import { ITransactionProvider } from './transaction';
import { ILogger } from '@utils/log';
import { IDatabaseClient } from './db-client';
import { IProfileStore } from './profile/profile.interface.store';
import { ProfileStore } from './profile/profile.store';

/**
 * Holds all classes that directly communicate with the database.
 * Provides access to specific data stores and optional transaction management.
 */
export interface Adapters {
  profileStore: IProfileStore;
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
  transaction: tx
});
