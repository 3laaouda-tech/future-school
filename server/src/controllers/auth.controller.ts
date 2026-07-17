import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import { loginSchema, createUserSchema } from "../validators/auth.schema";
import { findUserByEmail, verifyPassword, createUser, UserRecord } from "../services/auth.service";

// Strips password_hash before sending a user back in a response
function toPublicUser(user: UserRecord) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
  };
}

function generateToken(user: UserRecord): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("Server auth configuration is missing", 500);
  }
  const expiresIn = (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"];
  return jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn });
}

// ============================================
// POST /api/auth/login - open to everyone
// ============================================
export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  const { email, password } = parsed.data;
  const user = await findUserByEmail(email);

  // same generic message whether the email or the password is wrong -
  // this avoids revealing which one was incorrect to an attacker
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(user);
  res.json({ token, user: toPublicUser(user) });
});

// ============================================
// POST /api/auth/register - Admin only
// (route itself is protected by authenticate + authorize("admin"))
// ============================================
export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  try {
    const user = await createUser(parsed.data);
    res.status(201).json({ user: toPublicUser(user) });
  } catch (error: any) {
    // Postgres unique_violation error code
    if (error.code === "23505") {
      throw new AppError("This email is already registered", 409);
    }
    throw error;
  }
});
