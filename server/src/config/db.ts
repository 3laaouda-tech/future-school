import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// If DATABASE_URL is set (used by cloud providers like Neon or Supabase),
// connect with it directly and enable SSL, which those providers require.
// Otherwise fall back to the discrete host/port/user/... variables, which
// is simpler for local development and doesn't need SSL.
export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

export async function testConnection(): Promise<void> {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected:", result.rows[0].now);
  } catch (error) {
    console.error("PostgreSQL connection failed:", error);
    process.exit(1);
  }
}