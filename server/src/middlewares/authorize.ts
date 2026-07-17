import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";
import { UserRole } from "../validators/auth.schema";

// Must run AFTER `authenticate`, since it relies on req.user being set.
// Usage: router.post("/users", authenticate, authorize("admin"), createUserController);
export function authorize(requiredRole: UserRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      // this means authorize was used without authenticate running first
      throw new AppError("Not authenticated", 401);
    }

    if (req.user.role !== requiredRole) {
      throw new AppError("You don't have permission to perform this action", 403);
    }

    next();
  };
}
