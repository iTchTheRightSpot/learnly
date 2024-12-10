import {
  CookieOptions,
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

  private readonly cookieResponse = (
    logger: ILogger,
    res: Response,
    status: number,
    obj: any
  ) => {
    const options: CookieOptions = {
      maxAge: obj.exp.getTime() - logger.date().getTime(),
      expires: obj.exp,
      httpOnly: true,
      secure: env.COOKIESECURE,
      sameSite: env.COOKIE_SAMESITE as 'lax' | 'strict' | 'none'
    };

    res.status(status).cookie(env.COOKIENAME, obj.jwt, options);
  };

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
      const obj = await this.service.register(
        req.body as RegisterAccountPayload
      );
      res.setHeader('Content-Type', 'application/json');
      this.cookieResponse(this.logger, res, 201, obj);
      res.send({});
    } catch (e) {
      next(e);
    }
  };

  private readonly login: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const type = req.path['type'];
    let obj: JwtResponse;

    try {
      if (type === 'staff') {
        obj = await this.service.loginStaff(req.body as LoginPayload);
      } else {
        obj = await this.service.loginPatient(req.body as LoginPayload);
      }
      this.cookieResponse(this.logger, res, 204, obj);
      res.send({});
    } catch (e) {
      next(e);
    }
  };
}
