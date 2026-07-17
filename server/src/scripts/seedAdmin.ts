import dotenv from "dotenv";
dotenv.config();

import { pool } from "../config/db";
import { createUser, findUserByEmail } from "../services/auth.service";

// Reads the admin's details from .env if provided, otherwise falls back
// to sensible defaults. Change these values in .env before running.
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@school.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || "System Admin";

async function seedAdmin(): Promise<void> {
  const existing = await findUserByEmail(ADMIN_EMAIL);
  if (existing) {
    console.log(`An account with email ${ADMIN_EMAIL} already exists. Skipping.`);
    return;
  }

  const admin = await createUser({
    fullName: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
  });

  console.log("Admin account created successfully:");
  console.log(`  email: ${admin.email}`);
  console.log(`  password: ${ADMIN_PASSWORD} (change it after first login)`);
}

seedAdmin()
  .catch((error) => {
    console.error("Failed to seed admin:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    pool.end();
  });
