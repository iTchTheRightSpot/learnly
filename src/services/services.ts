import { ILogger } from '@utils/log';
import { Adapters } from '@stores/adapters';
import { IAuthService, IJwtService } from './auth/auth.interface.service';
import { AuthService } from './auth/auth.service';
import { JwtService } from './auth/jwt.service';
import { PasswordService } from '@services/auth/password.service';

export interface ServicesRegistry {
  authService: IAuthService;
  jwtService: IJwtService;
}

export const initializeServices = (
  log: ILogger,
  ads: Adapters
): ServicesRegistry => {
  const jwt = new JwtService(log);
  return {
    authService: new AuthService(log, ads, jwt, new PasswordService(log)),
    jwtService: jwt
  };
};
