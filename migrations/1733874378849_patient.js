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
    'patient',
    {
      patient_id: {
        primaryKey: true,
        type: 'BIGSERIAL',
        notNull: true,
        unique: true
      },
      uuid: {
        type: 'UUID',
        notNull: true,
        unique: true,
        default: pgm.func('gen_random_uuid()')
      },
      profile_id: { type: 'BIGINT', notNull: true }
    },
    { ifNotExists: true }
  );

  pgm.addConstraint('patient', 'FK_patient_to_profile_profile_id', {
    foreignKeys: {
      columns: 'profile_id',
      references: 'profile(profile_id)',
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT'
    }
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint('patient', 'FK_patient_to_profile_profile_id', {
    ifExists: true
  });
  pgm.dropTable('patient', { ifExists: true });
};
