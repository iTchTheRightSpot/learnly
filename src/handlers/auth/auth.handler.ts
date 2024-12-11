import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router
} from 'express';
import { ILogger } from '@utils/log';
import { IAuthService } from '@services/auth/auth.interface.service';
import { middleware } from '@middlewares/middleware';
import {
  JwtResponse,
  LoginPayload,
  RegisterAccountPayload
} from '@models/auth.model';
import { env } from '@utils/env';

export class AuthHandler {
  constructor(
    private readonly router: Router,
    private readonly logger: ILogger,
    private readonly service: IAuthService
  ) {
    this.register();
  }

  private readonly register = () => {
    this.router.post(
      '/authentication/register',
      middleware.requestBody(this.logger, RegisterAccountPayload),
      this.create
    );
    this.router.post(
      '/authentication/login/:type',
      middleware.requestBody(this.logger, LoginPayload),
      this.login
    );
  };

  private readonly create: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.service.register(req.body as RegisterAccountPayload);
      res.status(201).send({});
    } catch (e) {
      next(e);
    }
  };

  private readonly login: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let obj: JwtResponse;

    try {
      if (req.params.type === 'staff') {
        obj = await this.service.loginStaff(req.body as LoginPayload);
      } else {
        obj = await this.service.loginPatient(req.body as LoginPayload);
      }

      res
        .status(204)
        .cookie(env.COOKIENAME, obj.token, {
          maxAge: obj.exp.getTime() - this.logger.date().getTime(),
          expires: obj.exp,
          httpOnly: true,
          secure: env.COOKIESECURE,
          sameSite: env.COOKIE_SAMESITE as 'lax' | 'strict' | 'none'
        })
        .send({});
    } catch (e) {
      next(e);
    }
  };
}
