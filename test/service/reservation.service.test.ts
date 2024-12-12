import {
  IReservationService,
  ReservationService
} from '@services/reservation/reservation.service';
import { DevelopmentLogger } from '@utils/log';
import {
  ReservationEntity,
  ReservationPayload
} from '@models/reservation.model';
import { NotFoundException } from '@exceptions/not-found.exception';
import { StaffEntity } from '@models/staff.model';
import { PatientEntity } from '@models/patient.model';
import { BadRequestException } from '@exceptions/bad-request.exception';
import { TestTypeEntity } from '@models/test_type.model';

describe('reservation service', () => {
  let reservationService: IReservationService;
  let mockAdapters: any;
  const logger = new DevelopmentLogger();

  beforeEach(() => {
    mockAdapters = {
      staffStore: {
        staffByUUID: jest.fn()
      },
      profileStore: {
        countProfileByStaffIdAndPatientId: jest.fn()
      },
      patientStore: {
        patientByEmail: jest.fn()
      },
      testTypeStore: {
        testTypesByStaffId: jest.fn()
      },
      transaction: {
        runInTransaction: jest.fn()
      },
      reservationStore: {
        save: jest.fn(),
        saveReservationTestType: jest.fn()
      }
    };
    reservationService = new ReservationService(logger, mockAdapters);
  });

  describe('create reservation', () => {
    it('should reject. staff does not exist', async () => {
      // given
      const obj = new ReservationPayload();
      obj.staff_id = 'uuid';

      // when
      mockAdapters.staffStore.staffByUUID.mockResolvedValue(undefined);

      // method to test & assert
      await expect(reservationService.create(obj)).rejects.toThrow(
        NotFoundException
      );
      await expect(reservationService.create(obj)).rejects.toThrow(
        'invalid staff id'
      );
    });

    it('should reject. patient not found', async () => {
      // given
      const obj = new ReservationPayload();
      obj.staff_id = 'uuid';
      obj.email = 'email';

      // when
      mockAdapters.staffStore.staffByUUID.mockResolvedValue({} as StaffEntity);
      mockAdapters.patientStore.patientByEmail.mockResolvedValue(undefined);

      // method to test & assert
      await expect(reservationService.create(obj)).rejects.toThrow(
        NotFoundException
      );
      await expect(reservationService.create(obj)).rejects.toThrow(
        'invalid patient id'
      );
    });

    it('should reject. staff attempting to reserve a time for himself/herself', async () => {
      // given
      const obj = new ReservationPayload();
      obj.staff_id = 'uuid';
      obj.email = 'email';

      // when
      mockAdapters.staffStore.staffByUUID.mockResolvedValue({
        staff_id: 1
      } as StaffEntity);
      mockAdapters.patientStore.patientByEmail.mockResolvedValue({
        patient_id: 1
      } as PatientEntity);
      mockAdapters.profileStore.countProfileByStaffIdAndPatientId.mockResolvedValue(
        1
      );

      // method to test & assert
      await expect(reservationService.create(obj)).rejects.toThrow(
        BadRequestException
      );
      await expect(reservationService.create(obj)).rejects.toThrow(
        'cannot make a reservation for yourself'
      );
    });

    it('should reject. staff does not offer test type', async () => {
      // given
      const obj = new ReservationPayload();
      obj.staff_id = 'uuid';
      obj.email = 'email';
      obj.test_types = ['blood work', 'IV drip'];

      // when
      mockAdapters.staffStore.staffByUUID.mockResolvedValue({
        staff_id: 1
      } as StaffEntity);
      mockAdapters.patientStore.patientByEmail.mockResolvedValue({
        patient_id: 1
      } as PatientEntity);
      mockAdapters.profileStore.countProfileByStaffIdAndPatientId.mockResolvedValue(
        0
      );
      mockAdapters.testTypeStore.testTypesByStaffId.mockResolvedValue([
        { name: 'blood work' } as TestTypeEntity
      ]);

      // method to test & assert
      await expect(reservationService.create(obj)).rejects.toThrow(
        BadRequestException
      );
      await expect(reservationService.create(obj)).rejects.toThrow(
        'The following test types were not found for the selected staff: IV drip. Please check your input and try again'
      );
    });

    it('should reject. reservation in the past', async () => {
      const date = new Date(logger.date());
      date.setSeconds(date.getSeconds() - 48 * 60 * 60);

      // given
      const obj = new ReservationPayload();
      obj.staff_id = 'uuid';
      obj.email = 'email';
      obj.test_types = ['blood work'];
      obj.time = date.getTime();

      // when
      mockAdapters.staffStore.staffByUUID.mockResolvedValue({
        staff_id: 1
      } as StaffEntity);
      mockAdapters.patientStore.patientByEmail.mockResolvedValue({
        patient_id: 1
      } as PatientEntity);
      mockAdapters.profileStore.countProfileByStaffIdAndPatientId.mockResolvedValue(
        0
      );
      mockAdapters.testTypeStore.testTypesByStaffId.mockResolvedValue([
        { name: 'blood work' } as TestTypeEntity
      ]);

      // method to test & assert
      await expect(reservationService.create(obj)).rejects.toThrow(
        BadRequestException
      );
      await expect(reservationService.create(obj)).rejects.toThrow(
        'cannot make a reservation for a past day'
      );
    });

    it('should successfully create a reservation', async () => {
      const date = new Date(logger.date());
      date.setSeconds(date.getSeconds() + 48 * 60 * 60);

      // given
      const obj = new ReservationPayload();
      obj.staff_id = 'uuid';
      obj.email = 'email';
      obj.test_types = ['IV drip', 'blood work'];
      obj.time = date.getTime();

      // when
      mockAdapters.staffStore.staffByUUID.mockResolvedValue({
        staff_id: 1
      } as StaffEntity);
      mockAdapters.patientStore.patientByEmail.mockResolvedValue({
        patient_id: 1
      } as PatientEntity);
      mockAdapters.profileStore.countProfileByStaffIdAndPatientId.mockResolvedValue(
        0
      );
      mockAdapters.testTypeStore.testTypesByStaffId.mockResolvedValue([
        { name: 'IV drip', duration: 3600, clean_up_time: 30 * 60, test_id: 1 },
        {
          name: 'blood work',
          duration: 3600,
          clean_up_time: 30 * 60,
          test_id: 2
        }
      ] as TestTypeEntity[]);
      mockAdapters.transaction.runInTransaction.mockImplementation(
        async (callback: any) => await callback(mockAdapters)
      );
      mockAdapters.reservationStore.save.mockResolvedValue({
        reservation_id: 1
      } as ReservationEntity);

      // method to test
      await reservationService.create(obj);

      // assert
      expect(mockAdapters.reservationStore.save).toHaveBeenCalledTimes(1);
      expect(
        mockAdapters.reservationStore.saveReservationTestType
      ).toHaveBeenCalledTimes(2);
    });
  });
});
