import { NextFunction, Request, Response, Router } from 'express';
import { AuthHandler } from './auth/auth.handler';
import { ILogger } from '@utils/log';
import { ServicesRegistry } from '@services/services';
import { env } from '@utils/env';
import { UnauthorizedException } from '@exceptions/unauthorized.exception';
import { ProfileHandler } from '@handlers/profile/profile.handler';
import { ReservationHandler } from '@handlers/reservation/reservation.handler';

// holds all classes that expose endpoints
export const initializeHandlers = (
  router: Router,
  logger: ILogger,
  services: ServicesRegistry
) => {
  router.get('/', welcome);
  router.post('/logout', logout);
  return {
    authHandler: new AuthHandler(router, logger, services.authService),
    profileHandler: new ProfileHandler(router, logger, services.profileService),
    reservationHandler: new ReservationHandler(
      router,
      logger,
      services.reservationService
    )
  };
};

async function welcome(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  res.status(200).send({ message: 'welcome to Assessment' });
  next();
}

async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const c = req.cookies[env.COOKIENAME];
  if (!c) {
    const clz = new UnauthorizedException();
    res.status(clz.status).send({ message: clz.message, status: clz.status });
    return;
  }

  res
    .cookie(env.COOKIENAME, '', {
      maxAge: 0,
      expires: new Date(Date.now() - 24 * 60 * 60)
    })
    .status(204)
    .send({});
  next();
}
