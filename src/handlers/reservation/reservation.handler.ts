import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router
} from 'express';
import { ILogger } from '@utils/log';
import { IReservationService } from '@services/reservation/reservation.service';
import { ReservationPayload } from '@models/reservation.model';
import { middleware } from '@middlewares/middleware';

export class ReservationHandler {
  constructor(
    private readonly router: Router,
    private readonly logger: ILogger,
    private readonly service: IReservationService
  ) {
    this.register();
  }

  private readonly register = () => {
    this.router.post(
      '/reservation',
      middleware.validatePayload(this.logger, ReservationPayload),
      this.create
    );
  };

  private readonly create: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.service.create(req.body as ReservationPayload);
      res.status(201).send({});
    } catch (e) {
      next(e);
    }
  };
}
