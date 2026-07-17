import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Pool manages a set of pre-opened connections to the database
// instead of opening a new connection for every query - much better for performance
export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Helper to confirm the connection works when the server starts
export async function testConnection(): Promise<void> {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected:", result.rows[0].now);
  } catch (error) {
    console.error("PostgreSQL connection failed:", error);
    process.exit(1);
  }
}
