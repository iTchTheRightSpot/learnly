import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router
} from 'express';
import { ILogger } from '@utils/log';
import { ITypesService } from '@services/test_type/test-type.service';

export class TestTypeHandler {
  constructor(
    private readonly router: Router,
    private readonly logger: ILogger,
    private readonly service: ITypesService
  ) {
    this.register();
  }

  private readonly register = () => {
    this.router.get('/test-type', this.types);
  };

  private readonly types: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const arr = await this.service.types();
      res.setHeader('Content-Type', 'application/json').status(200).send(arr);
    } catch (e) {
      next(e);
    }
  };
}
