import { PatientEntity } from '@models/patient.model';
import { ILogger } from '@utils/log';
import { IDatabaseClient } from '@stores/db-client';
import { v4 as uuid } from 'uuid';

export interface IPatientStore {
  patientByProfileId(profileId: number): Promise<PatientEntity | undefined>;
  save(p: PatientEntity): Promise<PatientEntity>;
}

export class PatientStore implements IPatientStore {
  constructor(
    private readonly logger: ILogger,
    private readonly db: IDatabaseClient
  ) {}

  patientByProfileId(profileId: number): Promise<PatientEntity | undefined> {
    return new Promise<PatientEntity | undefined>(async (resolve, reject) => {
      try {
        const result = await this.db.exec(
          'SELECT * FROM patient WHERE profile_id = $1',
          profileId
        );
        const row = result.rows[0];

        if (row === undefined || row === null) {
          this.logger.error(`no patient with profile_id ${profileId}`);
          resolve(undefined);
          return;
        }

        const res = row as PatientEntity;
        row.patient_id = Number(row.patient_id);
        if (row.profile_id !== null) row.profile_id = Number(row.profile_id);

        resolve(res);
      } catch (e) {
        this.logger.error(`invalid patient with profile_id ${profileId}`);
        reject(e);
      }
    });
  }

  save(p: PatientEntity): Promise<PatientEntity> {
    const q = `
        INSERT INTO patient (uuid, profile_id)
        VALUES ($1, $2)
        RETURNING patient_id, uuid, profile_id
    `;

    return new Promise<PatientEntity>(async (resolve, reject) => {
      try {
        const result = await this.db.exec(
          q,
          p.uuid || uuid(),
          p.profile_id || null
        );

        const row = result.rows[0] as PatientEntity;
        row.patient_id = Number(row.patient_id);
        if (row.profile_id !== null) row.profile_id = Number(row.profile_id);

        resolve(row);
        this.logger.log('new patient saved');
      } catch (e) {
        this.logger.error(`error saving to patient table ${e}`);
        reject(e);
      }
    });
  }
}
