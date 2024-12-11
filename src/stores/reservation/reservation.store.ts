import {
  ReservationEntity,
  ReservationTestTypeEntity
} from '@models/reservation.model';
import { ILogger } from '@utils/log';
import { IDatabaseClient } from '@stores/db-client';

export interface IReservationStore {
  save(obj: ReservationEntity): Promise<ReservationEntity>;
  saveReservationTestType(
    obj: ReservationTestTypeEntity
  ): Promise<ReservationTestTypeEntity>;
}

export class ReservationStore implements IReservationStore {
  constructor(
    private readonly logger: ILogger,
    private readonly db: IDatabaseClient
  ) {}

  saveReservationTestType(
    obj: ReservationTestTypeEntity
  ): Promise<ReservationTestTypeEntity> {
    const q = `
      INSERT INTO reservation_test_type (reservation_id, test_id)
      VALUES ($1, $2)
      RETURNING junction_id, reservation_id, test_id
    `;

    return new Promise<ReservationTestTypeEntity>(async (resolve, reject) => {
      try {
        const result = await this.db.exec(q, obj.reservation_id, obj.test_id);
        const row = result.rows[0] as ReservationTestTypeEntity;
        row.junction_id = Number(row.junction_id);
        row.test_id = Number(row.test_id);
        row.reservation_id = Number(row.reservation_id);

        resolve(row);
        this.logger.log('new reservation_test_type saved');
      } catch (e) {
        this.logger.error(`error saving to reservation_test_type table ${e}`);
        reject(e);
      }
    });
  }

  save(o: ReservationEntity): Promise<ReservationEntity> {
    const q = `
        INSERT INTO reservation (patient_id, staff_id, status, created_at, scheduled_for, expire_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING reservation_id, patient_id, staff_id, status, created_at, scheduled_for, expire_at
    `;

    return new Promise<ReservationEntity>(async (resolve, reject) => {
      try {
        const result = await this.db.exec(
          q,
          o.patient_id,
          o.staff_id,
          o.status,
          o.created_at,
          o.scheduled_for,
          o.expire_at
        );

        const row = result.rows[0] as ReservationEntity;
        row.reservation_id = Number(row.reservation_id);
        row.patient_id = Number(row.patient_id);
        row.staff_id = Number(row.staff_id);

        resolve(row);
        this.logger.log('new reservation saved');
      } catch (e) {
        this.logger.error(`failed to new reservation ${e}`);
        reject(e);
      }
    });
  }
}
