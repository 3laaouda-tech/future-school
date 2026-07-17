import bcrypt from "bcrypt";
import { pool } from "../config/db";
import { UserRecord } from "./auth.service";
import { UpdateUserInput } from "../validators/auth.schema";

// Returns all users, newest first. No password_hash - callers only
// ever need the public fields.
export async function listUsers(): Promise<Omit<UserRecord, "password_hash">[]> {
  const result = await pool.query<Omit<UserRecord, "password_hash">>(
    `SELECT id, full_name, email, role, created_at
     FROM users
     ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function updateUser(
  id: number,
  input: UpdateUserInput
): Promise<Omit<UserRecord, "password_hash"> | null> {
  if (input.password) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    const result = await pool.query<Omit<UserRecord, "password_hash">>(
      `UPDATE users SET full_name = $1, email = $2, password_hash = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, full_name, email, role, created_at`,
      [input.fullName, input.email, passwordHash, id]
    );
    return result.rows[0] ?? null;
  }

  const result = await pool.query<Omit<UserRecord, "password_hash">>(
    `UPDATE users SET full_name = $1, email = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING id, full_name, email, role, created_at`,
    [input.fullName, input.email, id]
  );
  return result.rows[0] ?? null;
}

// Relies on ON DELETE CASCADE (set up in schema.sql) to also remove
// this user's role-specific row, enrollments, attendance, grades,
// and parent-student links automatically.
export async function deleteUser(id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}
