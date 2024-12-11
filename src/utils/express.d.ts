import { JwtClaimsObject } from '@models/auth.model';

declare global {
  namespace Express {
    interface Request {
      jwtClaim?: JwtClaimsObject;
    }
  }
}
