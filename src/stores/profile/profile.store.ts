import { IProfileStore } from './profile.interface.store';
import {
  PatientEntity,
  PermissionEntity,
  ProfileEntity,
  ProfileRolePermissionEntity,
  RoleEntity
} from '@models/profile.model';
import { ILogger } from '@utils/log';
import { IDatabaseClient } from '@stores/db-client';

export class ProfileStore implements IProfileStore {
  constructor(
    private readonly logger: ILogger,
    private readonly db: IDatabaseClient
  ) {}

  profileRolesAndPermissionByEmail(
    email: string
  ): Promise<ProfileRolePermissionEntity | undefined> {
    return Promise.resolve(undefined);
  }

  savePermission(obj: PermissionEntity): Promise<PermissionEntity> {
    return Promise.resolve({} as PermissionEntity);
  }

  saveProfile(obj: ProfileEntity): Promise<ProfileEntity> {
    return Promise.resolve({} as ProfileEntity);
  }

  saveRole(obj: RoleEntity): Promise<RoleEntity> {
    return Promise.resolve({} as RoleEntity);
  }

  patientByProfile(profile_id: string): Promise<PatientEntity> {
    return Promise.resolve({} as PatientEntity);
  }
}
