import { IJwtService } from './auth.interface.service';
import { JwtClaimsObject, JwtObject, JwtResponse } from '@models/auth.model';
import { ILogger } from '@utils/log';

export class JwtService implements IJwtService {
  constructor(private readonly logger: ILogger) {}

  createJwt(obj: JwtObject, expirationInSeconds: number): Promise<JwtResponse> {
    return Promise.resolve({} as JwtResponse);
  }

  validateJwt(token: string): Promise<JwtClaimsObject> {
    return Promise.resolve({} as JwtClaimsObject);
  }
}
