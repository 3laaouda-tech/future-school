import { UserRole } from "../validators/auth.schema";

// The shape of the data we attach to req.user once the JWT is verified
export interface AuthenticatedUser {
  id: number;
  role: UserRole;
}

// Augments Express's built-in Request type globally, so every file
// in the project can safely read req.user without extra casting
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
