import { NextFunction, Request, Response, Router } from 'express';
import { AuthHandler } from './auth/auth.handler';
import { ILogger } from '@utils/log';
import { ServicesRegistry } from '@services/services';
import { env } from '@utils/env';
import { UnauthorizedException } from '@exceptions/unauthorized.exception';
import { ProfileHandler } from '@handlers/profile/profile.handler';
import { ReservationHandler } from '@handlers/reservation/reservation.handler';
import { TestTypeHandler } from '@handlers/test_types/test_type.handler';

// holds all classes that expose endpoints
export const initializeHandlers = (
  router: Router,
  logger: ILogger,
  services: ServicesRegistry
) => {
  router.get('/welcome', welcome);
  return {
    authHandler: new AuthHandler(router, logger, services.authService),
    profileHandler: new ProfileHandler(router, logger, services.profileService),
    reservationHandler: new ReservationHandler(
      router,
      logger,
      services.reservationService
    ),
    typesHandler: new TestTypeHandler(router, logger, services.typesService)
  };
};

async function welcome(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  res.status(200).send({ message: 'welcome to LearnlyApp assessment' });
  next();
}
