import {
  JwtClaimsObject,
  JwtObject,
  JwtResponse,
  LoginPayload,
  RegisterAccountPayload
} from '@models/auth.model';

export interface IJwtService {
  encode(obj: JwtObject, expirationInSeconds: number): JwtResponse;
  decode(token: string): Promise<JwtClaimsObject>;
}

export interface IAuthService {
  register(obj: RegisterAccountPayload): Promise<void>;
  loginPatient(obj: LoginPayload): Promise<JwtResponse>;
  loginStaff(obj: LoginPayload): Promise<JwtResponse>;
}

export interface IPasswordService {
  encode(password: string): Promise<string>;
  verify(plainTextPassword: string, hashedPassword: string): Promise<boolean>;
}
