import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength
} from 'class-validator';

export interface ProfileEntity {
  profile_id: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export enum RoleEnum {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR'
}

export interface RoleEntity {
  role_id: number;
  role: RoleEnum;
  profile_id: number;
}

export enum PermissionEnum {
  WRITE = 'WRITE',
  READ = 'READ'
}

export interface PermissionEntity {
  permission_id: number;
  permission: PermissionEnum;
  role_id: number;
}

export interface RolePermissionEntity {
  role: RoleEntity;
  permissions: PermissionEntity[];
}

export interface ProfileRolePermissionEntity {
  profile: ProfileEntity;
  role_perm: RolePermissionEntity[];
}

export class RolePayload {
  @IsDefined({ message: 'email cannot be missing' })
  @IsNotEmpty({ message: 'email cannot be empty' })
  @IsString({ message: 'email has to be a string' })
  @MaxLength(320, { message: 'email must be at most 320 characters' })
  @IsEmail()
  email: string;

  @IsDefined({ message: 'role cannot be missing' })
  @IsNotEmpty({ message: 'role cannot be empty' })
  @IsEnum(RoleEnum, { message: 'role must be a valid RoleEnum value' })
  role: RoleEnum;
}

export class UpdateProfilePayload {
  @IsDefined({ message: 'email cannot be missing' })
  @IsNotEmpty({ message: 'email cannot be empty' })
  @IsString({ message: 'email has to be a string' })
  @MaxLength(320, { message: 'email must be at most 320 characters' })
  @IsEmail()
  email: string;

  @IsDefined({ message: 'firstname cannot be missing' })
  @IsNotEmpty({ message: 'firstname cannot be empty' })
  @IsString({ message: 'firstname has to be a string' })
  @MaxLength(100, { message: 'firstname must be at most 100 characters' })
  firstname: string;

  @IsDefined({ message: 'lastname cannot be missing' })
  @IsNotEmpty({ message: 'lastname cannot be empty' })
  @IsString({ message: 'lastname has to be a string' })
  @MaxLength(100, { message: 'lastname must be at most 100 characters' })
  lastname: string;
}
