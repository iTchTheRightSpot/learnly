import { ILogger } from '@utils/log';
import { Adapters } from '@stores/adapters';
import { IAuthService, IJwtService } from './auth/auth.interface.service';
import { AuthService } from './auth/auth.service';
import { JwtService } from './auth/jwt.service';
import { PasswordService } from '@services/auth/password.service';
import { IProfileService, ProfileService } from './profile/profile.service';
import {
  IReservationService,
  ReservationService
} from './reservation/reservation.service';

// holds all class that perform some business logic
export interface ServicesRegistry {
  profileService: IProfileService;
  authService: IAuthService;
  jwtService: IJwtService;
  reservationService: IReservationService;
}

// initializes all classes that perform business logic
export const initializeServices = (
  logger: ILogger,
  ads: Adapters
): ServicesRegistry => {
  const jwt = new JwtService(logger);
  const ps = new PasswordService(logger);
  return {
    authService: new AuthService(logger, ads, jwt, ps),
    profileService: new ProfileService(logger, ads),
    jwtService: jwt,
    reservationService: new ReservationService(logger, ads)
  };
};
