import { ILogger } from '@utils/log';
import { Adapters } from '@stores/adapters';
import {
  PermissionEntity,
  PermissionEnum,
  RoleEntity,
  RoleEnum,
  RolePayload,
  UpdateProfilePayload
} from '@models/profile.model';
import { NotFoundException } from '@exceptions/not-found.exception';
import { BadRequestException } from '@exceptions/bad-request.exception';
import { StaffEntity } from '@models/staff.model';
import { InsertionException } from '@exceptions/insertion.exception';

export interface IProfileService {
  staff(body: RolePayload): Promise<void>;
  update(body: UpdateProfilePayload): Promise<void>;
}

export class ProfileService implements IProfileService {
  constructor(
    private readonly logger: ILogger,
    private readonly adapter: Adapters
  ) {}

  /**
   * Assigns the role of {@link RoleEnum.DOCTOR} to a profile if not
   * already associated. Ensures necessary permissions are assigned
   * and {@link StaffEntity} is created.
   *
   * @param body - The payload containing the role and email of the profile.
   * @throws BadRequestException - If the role is not {@link RoleEnum.DOCTOR}
   * or is already associated with the email.
   * @throws NotFoundException - If the email does not correspond to a
   * valid account.
   * @throws InsertionException - If an exception occurs completing the method.
   */
  async staff(body: RolePayload): Promise<void> {
    if (body.role !== RoleEnum.DOCTOR)
      throw new BadRequestException('role has to be a Doctor');

    const obj =
      await this.adapter.profileStore.profileRolesAndPermissionByEmail(
        body.email.trim()
      );

    if (!obj)
      throw new NotFoundException(`invalid account with email ${body.email}`);

    if (obj.role_perm.some((rp) => rp.role.role === body.role))
      throw new BadRequestException(`role already associated to ${body.email}`);

    try {
      await this.adapter.transaction!.runInTransaction(async (adapters) => {
        let staff = await adapters.staffStore.staffByProfileId(
          obj.profile.profile_id!!
        );

        if (!staff)
          await adapters.staffStore.save({
            profile_id: obj.profile.profile_id
          } as StaffEntity);

        const role = await adapters.profileStore.saveRole({
          profile_id: obj.profile.profile_id,
          role: RoleEnum.DOCTOR
        } as RoleEntity);

        await adapters.profileStore.savePermission({
          role_id: role.role_id,
          permission: PermissionEnum.WRITE
        } as PermissionEntity);

        await adapters.profileStore.savePermission({
          role_id: role.role_id,
          permission: PermissionEnum.WRITE
        } as PermissionEntity);
      });
      this.logger.log('new staff created');
    } catch (e) {
      this.logger.error(e);
      throw new InsertionException(
        'error saving staff or updating user to staff'
      );
    }
  }

  async update(body: UpdateProfilePayload): Promise<void> {
    try {
      await this.adapter.profileStore.updateProfileByEmail(body);
      this.logger.log('updated profile');
    } catch (e) {
      this.logger.error(e);
      if (e === 'invalid email') throw new NotFoundException('invalid email');
      throw new InsertionException('error updating profile');
    }
  }
}
