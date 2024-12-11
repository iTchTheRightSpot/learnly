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
  pgm.createType('roleenum', ['PATIENT', 'DOCTOR']);

  pgm.createTable(
    'role',
    {
      role_id: {
        primaryKey: true,
        type: 'BIGSERIAL',
        notNull: true,
        unique: true
      },
      role: {
        type: 'roleenum',
        notNull: true,
        default: 'PATIENT'
      },
      profile_id: { type: 'BIGINT', notNull: true }
    },
    { ifNotExists: true }
  );

  pgm.addConstraint('role', 'FK_role_to_profile_profile_id', {
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
  pgm.dropConstraint('role', 'FK_role_to_profile_profile_id', {
    ifExists: true
  });
  pgm.dropTable('role', { ifExists: true });
  pgm.dropType('roleenum', { ifExists: true });
};
