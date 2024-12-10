import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { ILogger } from '@utils/log';
import { HttpException } from '@exceptions/http.exception';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { UnauthorizedError } from 'express-jwt';

export const middleware = {
  log: (log: ILogger) => logger(log),
  error: (log: ILogger) => error(log),
  requestBody: <T extends object>(log: ILogger, type: ClassConstructor<T>) =>
    requestBody(log, type)
};

// ref docs https://expressjs.com/en/resources/middleware/morgan.html
const logger = (log: ILogger) => {
  return morgan(
    (token: any, req: Request, res: Response) => {
      const clientIp =
        req.headers['cf-connecting-ip'] ||
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        '';

      return JSON.stringify({
        method: token.method(req, res),
        url: token.method(req, res),
        status: Number.parseFloat(token.status(req, res)),
        content_length: token.res(req, res, 'content-length'),
        response_time: Number.parseFloat(token['response-time'](req, res)),
        IP: clientIp
      });
    },
    {
      stream: { write: (message: string) => log.log(message.trim()) }
    }
  );
};

const error = (logger: ILogger): express.ErrorRequestHandler => {
  return async (
    err: Error,
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (err instanceof HttpException) {
      const status = err.status;
      const message = err.message;
      logger.error(err.stack);
      res.status(status).send({ message: message, status: status });
    } else if (err instanceof UnauthorizedError) {
      logger.error(err.stack);
      res.status(401).send({ message: err.message, status: 401 });
    } else {
      logger.error(err.stack);
      res.status(500).send({ message: 'something went wrong', status: 500 });
    }
    next();
  };
};

const requestBody = <T extends object>(
  log: ILogger,
  type: ClassConstructor<T>
): express.RequestHandler => {
  return (req, res, next) => {
    validate(plainToInstance(type, req.body))
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          const message = errors[0].constraints
            ? Object.values(errors[0].constraints)[0]
            : 'validation failed';

          log.error(`${requestBody.name} request error ${message}`);

          res.status(400).send({ status: 400, message: message });
        } else next();
      })
      .catch((err) => {
        log.error(`${requestBody.name} catch block ${JSON.stringify(err)}`);
        res
          .status(400)
          .send({ status: 400, message: 'catch validation failed' });
      });
  };
};
