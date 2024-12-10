import { HttpException } from './http.exception';

export class AccessDeniedException extends HttpException {
  constructor(message?: string) {
    const m = message || 'access denied';
    super(m, 403);
  }
}
