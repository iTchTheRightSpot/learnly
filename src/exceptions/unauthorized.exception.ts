import { HttpException } from './http.exception';

export class UnauthorizedException extends HttpException {
  constructor(message?: string) {
    const m =
      message || 'full authentication is required to access this resource';
    super(m, 401);
  }
}
