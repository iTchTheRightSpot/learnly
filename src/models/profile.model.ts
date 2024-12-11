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
