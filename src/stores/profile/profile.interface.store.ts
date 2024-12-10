import {
  PatientEntity,
  PermissionEntity,
  ProfileEntity,
  ProfileRolePermissionEntity,
  RoleEntity
} from '@models/profile.model';

export interface IProfileStore {
  profileRolesAndPermissionByEmail(
    email: string
  ): Promise<ProfileRolePermissionEntity | undefined>;
  saveProfile(obj: ProfileEntity): Promise<ProfileEntity>;
  saveRole(obj: RoleEntity): Promise<RoleEntity>;
  savePermission(obj: PermissionEntity): Promise<PermissionEntity>;
  patientByProfile(profile_id: string): Promise<PatientEntity>;
}
