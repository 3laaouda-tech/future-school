import { z } from "zod";

// Same values allowed in the users.role column in the database (CHECK constraint)
// Must stay in sync with schema.sql
export const userRoles = ["admin", "teacher", "student", "parent"] as const;
export type UserRole = (typeof userRoles)[number];

// ============================================
// Login - open to any already-registered user
// ============================================
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================
// Create a new user - used by Admin only
// ============================================
export const createUserSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name is too long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"), // 72 is bcrypt's max supported length
  role: z.enum(userRoles, {
    errorMap: () => ({ message: "Role must be one of: admin, teacher, student, parent" }),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// ============================================
// Update an existing user - Admin only
// Role is intentionally NOT editable here: changing a user's role
// after creation would conflict with their existing role-specific
// data (grades, attendance, enrollments...). The standard approach
// is to delete the account and create a new one with the right role.
// ============================================
export const updateUserSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name is too long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long")
    .optional(), // only provided when the admin wants to reset it
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
