import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";
import { UserRole } from "../validators/auth.schema";

// Shape of the data we encode inside the JWT when a user logs in
interface JwtPayload {
  id: number;
  role: UserRole;
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("No token provided", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // this is a server misconfiguration, not the client's fault
      throw new AppError("Server auth configuration is missing", 500);
    }

    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    // covers expired tokens, invalid signatures, malformed tokens, etc.
    throw new AppError("Invalid or expired token", 401);
  }
}
