import { StaffEntity } from '@models/staff.model';
import { ILogger } from '@utils/log';
import { IDatabaseClient } from '@stores/db-client';
import { v4 as uuid } from 'uuid';

export interface IStaffStore {
  staffByProfileId(profileId: number): Promise<StaffEntity | undefined>;
  save(p: StaffEntity): Promise<StaffEntity>;
}

export class StaffStore implements IStaffStore {
  constructor(
    private readonly logger: ILogger,
    private readonly db: IDatabaseClient
  ) {}

  save(p: StaffEntity): Promise<StaffEntity> {
    const q = `
        INSERT INTO staff (uuid, profile_id)
        VALUES ($1, $2)
        RETURNING staff_id, uuid, profile_id
    `;

    return new Promise<StaffEntity>(async (resolve, reject) => {
      try {
        const result = await this.db.exec(
          q,
          p.uuid || uuid(),
          p.profile_id || null
        );

        const row = result.rows[0] as StaffEntity;
        row.staff_id = Number(row.staff_id);
        if (row.profile_id !== null) row.profile_id = Number(row.profile_id);

        resolve(row);
        this.logger.log('new staff saved');
      } catch (e) {
        this.logger.error(`error saving to staff table ${e}`);
        reject(e);
      }
    });
  }

  staffByProfileId(profileId: number): Promise<StaffEntity | undefined> {
    return new Promise<StaffEntity | undefined>(async (resolve, reject) => {
      try {
        const result = await this.db.exec(
          'SELECT * FROM staff WHERE profile_id = $1',
          profileId
        );
        const row = result.rows[0];

        if (row === undefined || row === null) {
          this.logger.error(`no staff with profile_id ${profileId}`);
          resolve(undefined);
          return;
        }

        const res = row as StaffEntity;
        row.staff_id = Number(row.staff_id);
        if (row.profile_id !== null) row.profile_id = Number(row.profile_id);

        resolve(res);
      } catch (e) {
        this.logger.error(`invalid staff with profile_id ${profileId}`);
        reject(e);
      }
    });
  }
}
