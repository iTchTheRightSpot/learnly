import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router
} from 'express';
import { ILogger } from '@utils/log';
import { IProfileService } from '@services/profile/profile.service';
import { middleware } from '@middlewares/middleware';
import {
  PermissionEnum,
  RoleEnum,
  RolePayload,
  UpdateProfilePayload
} from '@models/profile.model';

export class ProfileHandler {
  constructor(
    private readonly router: Router,
    private readonly logger: ILogger,
    private readonly service: IProfileService
  ) {
    this.register();
  }

  private readonly register = () => {
    this.router.post(
      '/profile/staff',
      middleware.hasRoleAndPermissions(this.logger, {
        role: RoleEnum.DOCTOR,
        permissions: [PermissionEnum.WRITE]
      }),
      middleware.requestBody(this.logger, RolePayload),
      this.staff
    );

    this.router.patch(
      '/profile',
      middleware.hasRole(this.logger, RoleEnum.PATIENT),
      middleware.requestBody(this.logger, UpdateProfilePayload),
      this.update
    );
  };

  // creates a new staff & assigns new role(s) & permission(s)
  private readonly staff: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.service.staff(req.body as RolePayload);
      res.status(201).send({});
    } catch (e) {
      next(e);
    }
  };

  private readonly update: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.service.update(req.body as UpdateProfilePayload);
      res.status(204).send({});
    } catch (e) {
      next(e);
    }
  };
}
