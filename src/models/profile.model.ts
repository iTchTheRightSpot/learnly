export interface ProfileEntity {
  profile_id: string;
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
  role_id: string;
  role: RoleEnum;
  profile_id: string;
}

export enum PermissionEnum {
  CREATE = 'CREATE',
  READ = 'READ'
}

export interface PermissionEntity {
  permission_id: string;
  permission: PermissionEnum;
  role_id: string;
}

export interface ProfileRolePermissionEntity {
  profile: ProfileEntity;
  roles: RoleEntity[];
  permissions: PermissionEntity[];
}

export interface PatientEntity {
  patient_id: string;
  uuid: string;
  profile_id: string | null;
}

export interface StaffEntity {
  staff_id: string;
  uuid: string;
  profile_id: string | null;
}
