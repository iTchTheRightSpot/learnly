import { Request, Response, Router } from 'express';
import { AuthHandler } from './auth/auth.handler';
import { ILogger } from '@utils/log';
import { ServicesRegistry } from '@services/services';

// holds all classes that expose endpoints
export const initializeHandlers = (
  router: Router,
  logger: ILogger,
  services: ServicesRegistry
) => {
  router.get('/', welcome);
  return {
    authHandler: new AuthHandler(router, logger, services.authService)
  };
};

async function welcome(_req: Request, res: Response): Promise<void> {
  res.status(200).send({ message: 'welcome to LearnlyApp Edtech assessment' });
}
