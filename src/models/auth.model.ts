import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength
} from 'class-validator';
import { PermissionEnum, RoleEnum } from '@models/profile.model';

export interface RolePermission {
  role: RoleEnum;
  permissions: PermissionEnum[];
}

export interface JwtObject {
  user_id: string;
  access_controls: RolePermission[];
}

export interface JwtClaimsObject {
  obj: JwtObject;
  iss: string;
  iat: number;
  exp: number;
}

export interface JwtResponse {
  token: string;
  exp: Date;
}

export class RegisterAccountPayload {
  @IsDefined({ message: 'firstname is missing' })
  @IsNotEmpty({ message: 'firstname cannot be empty' })
  @IsString({ message: 'firstname has to be a string' })
  @MaxLength(255, { message: 'firstname must be at most 255 characters' })
  firstname: string;

  @IsDefined({ message: 'lastname is missing' })
  @IsNotEmpty({ message: 'lastname cannot be empty' })
  @IsString({ message: 'lastname has to be a string' })
  @MaxLength(255, { message: 'lastname must be at most 255 characters' })
  lastname: string;

  @IsDefined({ message: 'email is missing' })
  @IsNotEmpty({ message: 'email cannot be empty' })
  @IsString({ message: 'email has to be a string' })
  @MaxLength(255, { message: 'email must be at most 255 characters' })
  @IsEmail()
  email: string;

  @IsDefined({ message: 'password is missing' })
  @IsNotEmpty({ message: 'password cannot be empty' })
  @IsString({ message: 'password has to be a string' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    {
      message:
        'password needs a minimum of eight characters, at least one uppercase letter, one lowercase letter, one number and one special character'
    }
  )
  password: string;
}

export class LoginPayload {
  @IsDefined({ message: 'email is missing' })
  @IsNotEmpty({ message: 'email cannot be empty' })
  @IsEmail()
  email: string;

  @IsDefined({ message: 'password is missing' })
  @IsNotEmpty({ message: 'password cannot be empty' })
  @IsString({ message: 'password has to be a string' })
  password: string;
}
