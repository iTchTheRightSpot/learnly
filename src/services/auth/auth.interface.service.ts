import {
  JwtClaimsObject,
  JwtObject,
  JwtResponse,
  LoginPayload,
  RegisterAccountPayload
} from '@models/auth.model';

export interface IJwtService {
  createJwt(obj: JwtObject, expirationInSeconds: number): Promise<JwtResponse>;
  validateJwt(token: string): Promise<JwtClaimsObject>;
}

export interface IAuthService {
  register(obj: RegisterAccountPayload): Promise<JwtResponse>;
  loginPatient(obj: LoginPayload): Promise<JwtResponse>;
  loginStaff(obj: LoginPayload): Promise<JwtResponse>;
}
