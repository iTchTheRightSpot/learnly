import express, { Application, Router } from 'express';
import { env } from '@utils/env';
import { ILogger } from '@utils/log';
import { ServicesRegistry } from '@services/services';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { expressjwt } from 'express-jwt';
import { initializeHandlers } from '@handlers/handlers';
import { middleware } from '@middlewares/middleware';

export const createApp = (logger: ILogger, services: ServicesRegistry) => {
  const app: Application = express();

  app.use(middleware.log(logger));
  app.use(
    cors({
      origin: [env.UI_URL],
      credentials: true
    })
  );
  app.use(express.json());
  app.use(bodyParser.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(
    expressjwt({
      secret: env.JWT_PUB_KEY,
      algorithms: ['RS256'],
      credentialsRequired: true,
      getToken: (req) => req.cookies[env.COOKIENAME]
    }).unless({
      path: [`${env.ROUTE_PREFIX}welcome`, new RegExp(`${env.ROUTE_PREFIX}authentication`)]
    })
  );
  app.use(middleware.refreshToken(logger, services.jwtService));
  app.set('trust proxy', 1);

  // routes
  const router = Router();
  initializeHandlers(router, logger, services);

  app.use(env.ROUTE_PREFIX, router);

  app.use(middleware.error(logger));

  return app;
};
