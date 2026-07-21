import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import { listUsers, updateUser, deleteUser, getUserById } from "../services/users.service";
import { updateUserSchema } from "../validators/auth.schema";

function toPublicUser(u: {
  id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: Date;
}) {
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    createdAt: u.created_at,
  };
}

// ============================================
// GET /api/users - Admin only
// ============================================
export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await listUsers();
  res.json({ users: users.map(toPublicUser) });
});

// ============================================
// GET /api/users/me - any authenticated user, their own profile
// ============================================
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", 401);

  const user = await getUserById(req.user.id);
  if (!user) throw new AppError("User not found", 404);
  res.json({ user: toPublicUser(user) });
});

// ============================================
// PUT /api/users/me - any authenticated user, updates their own profile
// (role is never editable here, same as the admin-only PUT /:id)
// ============================================
export const putMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", 401);

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  try {
    const updated = await updateUser(req.user.id, parsed.data);
    if (!updated) throw new AppError("User not found", 404);
    res.json({ user: toPublicUser(updated) });
  } catch (error: any) {
    if (error.code === "23505") {
      throw new AppError("This email is already in use", 409);
    }
    throw error;
  }
});

// ============================================
// PUT /api/users/:id - Admin only
// ============================================
export const putUser = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError("Invalid user id", 400);

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  try {
    const updated = await updateUser(id, parsed.data);
    if (!updated) throw new AppError("User not found", 404);
    res.json({ user: toPublicUser(updated) });
  } catch (error: any) {
    if (error.code === "23505") {
      throw new AppError("This email is already in use", 409);
    }
    throw error;
  }
});

// ============================================
// DELETE /api/users/:id - Admin only
// ============================================
export const deleteUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError("Invalid user id", 400);

  if (req.user?.id === id) {
    throw new AppError("You can't delete your own account", 400);
  }

  const deleted = await deleteUser(id);
  if (!deleted) throw new AppError("User not found", 404);
  res.json({ success: true });
});
