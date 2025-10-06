import { AuthPayload } from '../auth/auth.guard';
declare global {
  namespace Express {
    export interface Request {
      payload?: AuthPayload;
    }
  }
}
