import { IJwtService } from './auth.interface.service';
import { JwtClaimsObject, JwtObject, JwtResponse } from '@models/auth.model';
import { ILogger } from '@utils/log';
import * as jwt from 'jsonwebtoken';
import { env } from '@utils/env';
import { UnauthorizedException } from '@exceptions/unauthorized.exception';

export class JwtService implements IJwtService {
  constructor(private readonly logger: ILogger) {}

  createJwt(obj: JwtObject, expirationInSeconds: number): JwtResponse {
    const date = this.logger.date();
    const expireAt = new Date(date);
    expireAt.setSeconds(date.getSeconds() + expirationInSeconds);

    const claims: JwtClaimsObject = {
      obj: obj,
      iss: 'LearnlyApp Assessment',
      iat: Math.floor(date.getTime() / 1000),
      exp: Math.floor(expireAt.getTime() / 1000)
    };

    const token = jwt.sign(claims, env.JWT_PRIV_KEY, { algorithm: 'RS256' });

    return { token: token, exp: expireAt };
  }

  async validateJwt(token: string): Promise<JwtClaimsObject> {
    try {
      return (await jwt.verify(token, env.JWT_PUB_KEY)) as JwtClaimsObject;
    } catch (e) {
      this.logger.error(`${e}`);
      throw new UnauthorizedException();
    }
  }
}
