import { IPasswordService } from './auth.interface.service';
import { ILogger } from '@utils/log';
import * as argon2 from 'argon2';
import { UnauthorizedException } from '@exceptions/unauthorized.exception';
import { ServerException } from '@exceptions/server.exception';

export class PasswordService implements IPasswordService {
  constructor(private readonly logger: ILogger) {}

  async encode(password: string): Promise<string> {
    try {
      return await argon2.hash(password);
    } catch (e) {
      this.logger.error(`${e}`);
      throw new ServerException('error hashing password. please try again');
    }
  }

  async verify(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      if (!(await argon2.verify(hashedPassword, plainTextPassword))) {
        this.logger.error('plain text password does not match hashed password');
        return Promise.reject(new UnauthorizedException('invalid password'));
      }
      return Promise.resolve(true);
    } catch (e) {
      this.logger.error(`${e}`);
      throw new UnauthorizedException('invalid password');
    }
  }
}
