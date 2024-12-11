import {
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

export enum ReservationStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export interface ReservationEntity {
  reservation_id: number;
  patient_id: number;
  staff_id: number;
  status: ReservationStatus;
  created_at: Date;
  scheduled_for: Date;
  expire_at: Date;
}

export interface ReservationTestTypeEntity {
  reservation_id: number;
  junction_id: number;
  test_id: number;
}

export class ReservationPayload {
  @IsDefined({ message: 'staff_id has to be defined' })
  @IsNotEmpty({ message: 'staff_id cannot be empty' })
  @IsString({ message: 'staff_id has to be a string' })
  @MinLength(36, { message: 'staff_id must be at min 36 characters' })
  @MaxLength(37, { message: 'staff_id must be at most 37 characters' })
  staff_id: string;

  @IsDefined({ message: 'name has to be defined' })
  @IsNotEmpty({ message: 'name cannot be empty' })
  @IsString({ message: 'name has to be a string' })
  @MaxLength(100, { message: 'name must be at most 100 characters' })
  name: string;

  @IsDefined({ message: 'email has to be defined' })
  @IsNotEmpty({ message: 'email cannot be empty' })
  @IsString({ message: 'email has to be a string' })
  @MaxLength(320, { message: 'email must be at most 320 characters' })
  email: string;

  @IsDefined({ message: 'please select 1 or more test_types' })
  @IsNotEmpty({ message: 'please select 1 or more test_types' })
  test_types: string[];

  @IsDefined({ message: 'please select an appointment date & time' })
  time: number;
}
