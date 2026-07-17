import bcrypt from "bcrypt";
import { pool } from "../config/db";
import { CreateUserInput } from "../validators/auth.schema";

const SALT_ROUNDS = 10;

// Shape of a row from the users table (what we get back from the database)
export interface UserRecord {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: "admin" | "teacher" | "student" | "parent";
  created_at: Date;
}

// ============================================
// Find a user by email - used during login
// Returns null if no user has this email
// ============================================
export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const result = await pool.query<UserRecord>(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] ?? null;
}

// ============================================
// Compare a plain-text password against a bcrypt hash
// ============================================
export async function verifyPassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

// ============================================
// Create a new user (used by Admin only).
// Inserts into the shared `users` table, then into the role-specific
// table (teachers / students / parents), wrapped in a transaction so
// both inserts succeed together or not at all.
// ============================================
export async function createUser(input: CreateUserInput): Promise<UserRecord> {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userResult = await client.query<UserRecord>(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.fullName, input.email, passwordHash, input.role]
    );
    const user = userResult.rows[0];

    // Add the matching row in the role-specific table.
    // Extra fields (specialization, date_of_birth, phone...) can be
    // filled in later through a dedicated "update profile" endpoint.
    if (input.role === "teacher") {
      await client.query("INSERT INTO teachers (user_id) VALUES ($1)", [user.id]);
    } else if (input.role === "student") {
      await client.query("INSERT INTO students (user_id) VALUES ($1)", [user.id]);
    } else if (input.role === "parent") {
      await client.query("INSERT INTO parents (user_id) VALUES ($1)", [user.id]);
    }
    // no extra table needed for "admin"

    await client.query("COMMIT");
    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
