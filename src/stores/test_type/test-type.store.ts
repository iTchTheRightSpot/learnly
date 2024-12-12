import { StaffTestTypeEntity, TestTypeEntity } from '@models/test_type.model';
import { ILogger } from '@utils/log';
import { IDatabaseClient } from '@stores/db-client';

export interface ITestTypeStore {
  saveTestType(obj: TestTypeEntity): Promise<TestTypeEntity>;
  saveStaffTestType(obj: StaffTestTypeEntity): Promise<StaffTestTypeEntity>;
  testTypesByStaffId(staffId: number): Promise<TestTypeEntity[]>;
  allTestTypes(): Promise<TestTypeEntity[]>;
}

export class TestTypeStore implements ITestTypeStore {
  constructor(
    private readonly logger: ILogger,
    private readonly db: IDatabaseClient
  ) {}

  saveStaffTestType(obj: StaffTestTypeEntity): Promise<StaffTestTypeEntity> {
    const q = `
      INSERT INTO staff_test_type (staff_id, test_id)
      VALUES ($1, $2)
      RETURNING junction_id, staff_id, test_id
    `;

    return new Promise<StaffTestTypeEntity>(async (resolve, reject) => {
      try {
        const result = await this.db.exec(q, obj.staff_id, obj.test_id);
        const row = result.rows[0] as StaffTestTypeEntity;
        row.junction_id = Number(row.junction_id);
        row.test_id = Number(row.test_id);
        row.staff_id = Number(row.staff_id);

        resolve(row);
        this.logger.log('new staff_test_type saved');
      } catch (e) {
        this.logger.error(`error saving to staff_test_type table ${e}`);
        reject(e);
      }
    });
  }

  saveTestType(obj: TestTypeEntity): Promise<TestTypeEntity> {
    const q = `
      INSERT INTO test_type (name, duration, clean_up_time)
      VALUES ($1, $2, $3)
      RETURNING test_id, name, duration, clean_up_time
    `;

    return new Promise<TestTypeEntity>(async (resolve, reject) => {
      try {
        const result = await this.db.exec(
          q,
          obj.name,
          obj.duration,
          obj.clean_up_time
        );

        const row = result.rows[0] as TestTypeEntity;
        row.test_id = Number(row.test_id);
        row.duration = Number(row.duration);
        row.clean_up_time = Number(row.clean_up_time);

        resolve(row);
        this.logger.log('new test_type saved');
      } catch (e) {
        this.logger.error(`error saving to test_type table ${e}`);
        reject(e);
      }
    });
  }

  testTypesByStaffId(staffId: number): Promise<TestTypeEntity[]> {
    const q = `
      SELECT t.* FROM staff s
      INNER JOIN staff_test_type st ON st.staff_id = s.staff_id
      INNER JOIN test_type t ON t.test_id = st.test_id
      WHERE s.staff_id = $1
    `;

    return new Promise<TestTypeEntity[]>(async (resolve, reject) => {
      try {
        const result = await this.db.exec(q, staffId);
        if (!result.rows) return resolve([]);

        const rows = result.rows as TestTypeEntity[];
        rows.forEach((row) => {
          row.test_id = Number(row.test_id);
          row.duration = Number(row.duration);
          row.clean_up_time = Number(row.clean_up_time);
        });

        resolve(rows);
      } catch (e) {
        this.logger.error(
          `error retrieving test_types for staff with id ${staffId} err: ${e}`
        );
        reject(e);
      }
    });
  }

  allTestTypes(): Promise<TestTypeEntity[]> {
    return new Promise<TestTypeEntity[]>(async (resolve, reject) => {
      try {
        const result = await this.db.exec('SELECT * FROM test_type');
        if (!result.rows) return resolve([]);

        const rows = result.rows as TestTypeEntity[];
        rows.forEach((row) => {
          row.test_id = Number(row.test_id);
          row.duration = Number(row.duration);
          row.clean_up_time = Number(row.clean_up_time);
        });

        resolve(rows);
      } catch (e) {
        this.logger.error(`error retrieving all test_types ${e}`);
        reject(e);
      }
    });
  }
}
