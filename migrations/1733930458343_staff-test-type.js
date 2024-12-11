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
    'staff_test_type',
    {
      junction_id: {
        primaryKey: true,
        type: 'BIGSERIAL',
        notNull: true,
        unique: true
      },
      staff_id: { type: 'BIGINT', notNull: true },
      test_id: { type: 'BIGINT', notNull: true }
    },
    {
      ifNotExists: true
    }
  );

  pgm.addConstraint(
    'staff_test_type',
    'FK_staff_test_type_to_test_type_test_id',
    {
      foreignKeys: {
        columns: 'test_id',
        references: 'test_type(test_id)',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      }
    }
  );

  pgm.addConstraint('staff_test_type', 'FK_staff_test_type_to_staff_staff_id', {
    foreignKeys: {
      columns: 'staff_id',
      references: 'staff(staff_id)',
      onDelete: 'RESTRICT',
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
  pgm.dropConstraint(
    'staff_test_type',
    'FK_staff_test_type_to_test_type_test_id',
    {
      ifExists: true
    }
  );
  pgm.dropConstraint(
    'staff_test_type',
    'FK_staff_test_type_to_staff_staff_id',
    {
      ifExists: true
    }
  );
  pgm.dropTable('staff_test_type', { ifExists: true });
};
