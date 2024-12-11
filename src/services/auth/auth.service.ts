import {
  IAuthService,
  IJwtService,
  IPasswordService
} from './auth.interface.service';
import { ILogger } from '@utils/log';
import { Adapters } from '@stores/adapters';
import {
  JwtObject,
  JwtResponse,
  LoginPayload,
  RegisterAccountPayload,
  RolePermission
} from '@models/auth.model';
import { NotFoundException } from '@exceptions/not-found.exception';
import { twoDaysInSeconds } from '@utils/util';
import { UnauthorizedException } from '@exceptions/unauthorized.exception';
import { InsertionException } from '@exceptions/insertion.exception';
import {
  PermissionEntity,
  PermissionEnum,
  ProfileEntity,
  ProfileRolePermissionEntity,
  RoleEntity,
  RoleEnum
} from '@models/profile.model';
import { PatientEntity } from '@models/patient.model';

export class AuthService implements IAuthService {
  constructor(
    private readonly logger: ILogger,
    private readonly adapters: Adapters,
    private readonly jwtService: IJwtService,
    private readonly passwordService: IPasswordService
  ) {}

  async register(obj: RegisterAccountPayload): Promise<void> {
    const password = await this.passwordService.encode(obj.password);

    try {
      await this.adapters.transaction!.runInTransaction(async (adapters) => {
        const profile = await adapters.profileStore.saveProfile({
          firstname: obj.firstname,
          lastname: obj.lastname,
          email: obj.email.trim(),
          password: password
        } as ProfileEntity);

        await adapters.patientStore.save({
          profile_id: profile.profile_id
        } as PatientEntity);

        const role = await adapters.profileStore.saveRole({
          role: RoleEnum.PATIENT,
          profile_id: profile.profile_id
        } as RoleEntity);

        await adapters.profileStore.savePermission({
          permission: PermissionEnum.READ,
          role_id: role.role_id
        } as PermissionEntity);
      });
    } catch (e) {
      this.logger.error(`${e}`);
      throw new InsertionException('error registering account');
    }
  }

  private async login(dto: LoginPayload): Promise<ProfileRolePermissionEntity> {
    const obj =
      await this.adapters.profileStore.profileRolesAndPermissionByEmail(
        dto.email.trim()
      );

    if (!obj) {
      this.logger.error(`${dto.email.trim()} not found`);
      throw new NotFoundException('no account found.');
    }

    try {
      const bool = await this.passwordService.verify(
        dto.password,
        obj.profile.password
      );
      if (!bool) {
        return Promise.reject(
          new UnauthorizedException('invalid email or password')
        );
      }
    } catch (err) {
      this.logger.error(`${err}`);
      throw new UnauthorizedException('invalid email or password');
    }

    return obj;
  }

  async loginPatient(dto: LoginPayload): Promise<JwtResponse> {
    const obj = await this.login(dto);

    const patient = await this.adapters.patientStore.patientByProfileId(
      obj.profile.profile_id
    );

    if (!patient) throw new NotFoundException('invalid patient');

    const jwtObj = {
      user_id: patient.uuid,
      access_controls: obj.role_perm.map(
        (rp) =>
          ({
            role: rp.role.role,
            permissions: rp.permissions.map((p) => p.permission)
          }) as RolePermission
      )
    } as JwtObject;

    return this.jwtService.createJwt(jwtObj, twoDaysInSeconds);
  }

  async loginStaff(dto: LoginPayload): Promise<JwtResponse> {
    const obj = await this.login(dto);

    const staff = await this.adapters.staffStore.staffByProfileId(
      obj.profile.profile_id
    );

    if (!staff) throw new NotFoundException('invalid staff');

    const jwtObj = {
      user_id: staff.uuid,
      access_controls: obj.role_perm.map(
        (rp) =>
          ({
            role: rp.role.role,
            permissions: rp.permissions.map((p) => p.permission)
          }) as RolePermission
      )
    } as JwtObject;

    return this.jwtService.createJwt(jwtObj, twoDaysInSeconds);
  }
}
