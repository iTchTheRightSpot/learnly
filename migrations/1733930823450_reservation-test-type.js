/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable(
    'reservation_test_type',
    {
      junction_id: {
        primaryKey: true,
        type: 'BIGSERIAL',
        notNull: true,
        unique: true
      },
      reservation_id: { type: 'BIGINT', notNull: true },
      test_id: { type: 'BIGINT', notNull: true }
    },
    {
      ifNotExists: true
    }
  );

  pgm.addConstraint(
    'reservation_test_type',
    'FK_reservation_test_type_to_reservation_reservation_id',
    {
      foreignKeys: {
        columns: 'reservation_id',
        references: 'reservation(reservation_id)',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      }
    }
  );

  pgm.addConstraint(
    'reservation_test_type',
    'FK_reservation_test_type_to_test_type_test_id',
    {
      foreignKeys: {
        columns: 'test_id',
        references: 'test_type(test_id)',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      }
    }
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint(
    'reservation_test_type',
    'FK_reservation_test_type_to_reservation_reservation_id',
    {
      ifExists: true
    }
  );
  pgm.dropConstraint(
    'reservation_test_type',
    'FK_reservation_test_type_to_test_type_test_id',
    {
      ifExists: true
    }
  );
  pgm.dropTable('reservation_test_type', { ifExists: true });
};