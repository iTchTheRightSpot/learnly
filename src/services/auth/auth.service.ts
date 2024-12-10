import { IAuthService, IJwtService } from './auth.interface.service';
import { ILogger } from '@utils/log';
import { Adapters } from '@stores/adapters';
import {
  JwtObject,
  JwtResponse,
  LoginPayload,
  RegisterAccountPayload
} from '@models/auth.model';
import { NotFoundException } from '@exceptions/not-found.exception';
import * as argon2 from 'argon2';
import { twoDaysInSeconds } from '@utils/util';
import { UnauthorizedException } from '@exceptions/unauthorized.exception';

export class AuthService implements IAuthService {
  constructor(
    private readonly logger: ILogger,
    private readonly adapters: Adapters,
    private readonly service: IJwtService
  ) {}

  async register(obj: RegisterAccountPayload): Promise<JwtResponse> {
    return Promise.resolve({} as JwtResponse);
  }

  async loginPatient(dto: LoginPayload): Promise<JwtResponse> {
    // 1. find patient
    const obj =
      await this.adapters.profileStore.profileRolesAndPermissionByEmail(
        dto.email.trim()
      );

    if (!obj) {
      this.logger.error(`${dto.email.trim()} not found`);
      throw new NotFoundException(`invalid email or password`);
    }

    // 3. validate password equals
    try {
      if (!(await argon2.verify(obj.profile.password, dto.password))) {
        this.logger.error(
          `${dto.email.trim()} trying to login with password that does not match`
        );
        return Promise.reject(
          new UnauthorizedException('invalid email or password')
        );
      }
    } catch (err) {
      this.logger.error(`${err}`);
      throw new UnauthorizedException('invalid email or password');
    }

    const patient = await this.adapters.profileStore.patientByProfile(
      obj.profile.profile_id
    );

    const jwtObj = {
      user_id: patient.uuid,
      access_controls: []
    } as JwtObject;

    return this.service.createJwt(jwtObj, twoDaysInSeconds);
  }

  async loginStaff(obj: LoginPayload): Promise<JwtResponse> {
    return Promise.resolve({} as JwtResponse);
  }
}
