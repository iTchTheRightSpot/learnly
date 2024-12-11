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
    'test_type',
    {
      test_id: {
        primaryKey: true,
        type: 'BIGSERIAL',
        notNull: true,
        unique: true
      },
      name: { type: 'varchar(50)', notNull: true, unique: true },
      duration: { type: 'integer', notNull: true },
      clean_up_time: { type: 'integer', notNull: true }
    },
    {
      ifNotExists: true
    }
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('test_type', { ifExists: true });
};
