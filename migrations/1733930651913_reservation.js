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
  pgm.sql('CREATE EXTENSION IF NOT EXISTS btree_gist;');

  pgm.createType('reservationenum', ['CONFIRMED', 'CANCELLED']);

  pgm.createTable(
    'reservation',
    {
      reservation_id: {
        primaryKey: true,
        type: 'BIGSERIAL',
        notNull: true,
        unique: true
      },
      status: { type: 'reservationenum', notNull: true, default: 'CONFIRMED' },
      created_at: { type: 'TIMESTAMP', notNull: true, unique: false },
      scheduled_for: { type: 'TIMESTAMP', notNull: true, unique: false },
      expire_at: { type: 'TIMESTAMP', notNull: true, unique: false },
      staff_id: { type: 'BIGINT', notNull: true },
      patient_id: { type: 'BIGINT', notNull: true }
    },
    {
      ifNotExists: true
    }
  );

  pgm.addConstraint('reservation', 'FK_reservation_to_staff_staff_id', {
    foreignKeys: {
      columns: 'staff_id',
      references: 'staff(staff_id)',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    }
  });

  pgm.addConstraint('reservation', 'FK_reservation_to_patient_patient_id', {
    foreignKeys: {
      columns: 'patient_id',
      references: 'patient(patient_id)',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    }
  });

  pgm.sql(`
    ALTER TABLE reservation
        ADD CONSTRAINT EX_reservation_overlap_constraint
          EXCLUDE USING gist (
              staff_id WITH =,
              tsrange(scheduled_for, expire_at) WITH &&,
              (CASE WHEN status = 'CONFIRMED' THEN TRUE END) WITH =
          )
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint('reservation', 'EX_reservation_overlap_constraint', {
    ifExists: true
  });

  pgm.dropConstraint('reservation', 'FK_reservation_to_staff_staff_id', {
    ifExists: true
  });
  pgm.dropConstraint('reservation', 'FK_reservation_to_patient_patient_id', {
    ifExists: true
  });
  pgm.dropTable('reservation', { ifExists: true });
  pgm.dropType('reservationenum', { ifExists: true });
  pgm.sql('DROP EXTENSION IF EXISTS btree_gist;');
};
