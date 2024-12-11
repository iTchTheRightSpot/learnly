import {
  ReservationEntity,
  ReservationPayload,
  ReservationStatus,
  ReservationTestTypeEntity
} from '@models/reservation.model';
import { ILogger } from '@utils/log';
import { Adapters } from '@stores/adapters';
import { NotFoundException } from '@exceptions/not-found.exception';
import { TestTypeEntity } from '@models/test_type.model';
import { BadRequestException } from '@exceptions/bad-request.exception';
import moment from 'moment-timezone';
import { TransactionIsolationLevel } from '@stores/transaction';

export interface IReservationService {
  create(obj: ReservationPayload): Promise<void>;
}

export class ReservationService implements IReservationService {
  constructor(
    private readonly logger: ILogger,
    private readonly adapters: Adapters
  ) {}

  private readonly validateStaffTestTypes = async (
    requestedTypes: string[],
    staffId: number
  ) => {
    const types = await this.adapters.testTypeStore.testTypesByStaffId(staffId);

    const matchedTypes = requestedTypes
      .map((r) => r.toLowerCase().trim())
      .map((name) => types.find((s) => s.name.toLowerCase().trim() === name))
      .filter((service): service is TestTypeEntity => !!service);

    if (matchedTypes.length !== requestedTypes.length) {
      const unmatchedServices = requestedTypes.filter(
        (r) =>
          !types.some(
            (s) => s.name.toLowerCase().trim() === r.toLowerCase().trim()
          )
      );

      throw new BadRequestException(
        `The following test types were not found for the selected staff: ${unmatchedServices.join(
          ', '
        )}. Please check your input and try again`
      );
    }

    return matchedTypes;
  };

  async create(obj: ReservationPayload): Promise<void> {
    const staff = await this.adapters.staffStore.staffByUUID(
      obj.staff_id.trim()
    );
    if (!staff) throw new NotFoundException('invalid staff id');

    const patient = await this.adapters.patientStore.patientByEmail(
      obj.email.trim()
    );
    if (!patient) throw new NotFoundException('invalid patient id');

    const count =
      await this.adapters.profileStore.countProfileByStaffIdAndPatientId(
        staff.staff_id,
        patient.patient_id
      );
    if (count > 1)
      throw new BadRequestException('cannot make a reservation for yourself');

    const types = await this.validateStaffTestTypes(
      obj.test_types,
      staff.staff_id
    );

    const start = moment.unix(obj.time / 1000).tz(this.logger.timezone());

    if (start.toDate() < this.logger.date())
      throw new BadRequestException('cannot make a reservation for a past day');

    return await this.adapters.transaction!.runInTransaction(
      async (adapters) => {
        const totalDuration = types.reduce(
          (sum, s) => sum + (s.duration + s.clean_up_time),
          0
        );

        const reservation = await adapters.reservationStore.save({
          patient_id: patient.patient_id,
          staff_id: staff.staff_id,
          status: ReservationStatus.CONFIRMED,
          created_at: this.logger.date(),
          scheduled_for: start.toDate(),
          expire_at: start.clone().add(totalDuration, 'seconds').toDate()
        } as ReservationEntity);

        for (let i = 0; i < types.length; i++) {
          await adapters.reservationStore.saveReservationTestType({
            reservation_id: reservation.reservation_id,
            test_id: types[i].test_id
          } as ReservationTestTypeEntity);
        }
      },
      TransactionIsolationLevel.SERIALIZABLE
    );
  }
}
