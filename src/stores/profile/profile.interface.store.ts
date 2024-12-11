import {
  PermissionEntity,
  ProfileEntity,
  ProfileRolePermissionEntity,
  RoleEntity,
  UpdateProfilePayload
} from '@models/profile.model';

export interface IProfileStore {
  profileRolesAndPermissionByEmail(
    email: string
  ): Promise<ProfileRolePermissionEntity | undefined>;
  saveProfile(obj: ProfileEntity): Promise<ProfileEntity>;
  saveRole(obj: RoleEntity): Promise<RoleEntity>;
  savePermission(obj: PermissionEntity): Promise<PermissionEntity>;
  updateProfileByEmail(body: UpdateProfilePayload): Promise<void>;
}
