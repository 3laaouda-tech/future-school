import { pool } from "../config/db";
import { CreateAcademicYearInput } from "../validators/academicYears.schema";

export interface AcademicYearRecord {
  id: number;
  label: string;
  is_current: boolean;
}

export async function createAcademicYear(
  input: CreateAcademicYearInput
): Promise<AcademicYearRecord> {
  const result = await pool.query<AcademicYearRecord>(
    `INSERT INTO academic_years (label) VALUES ($1) RETURNING *`,
    [input.label]
  );
  return result.rows[0];
}

export async function listAcademicYears(): Promise<AcademicYearRecord[]> {
  const result = await pool.query<AcademicYearRecord>(
    `SELECT * FROM academic_years ORDER BY label DESC`
  );
  return result.rows;
}

// Marks one academic year as "current" and unmarks every other one,
// wrapped in a transaction so there's never a moment with zero or
// more than one current year.
export async function setCurrentAcademicYear(id: number): Promise<AcademicYearRecord | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`UPDATE academic_years SET is_current = FALSE`);
    const result = await client.query<AcademicYearRecord>(
      `UPDATE academic_years SET is_current = TRUE WHERE id = $1 RETURNING *`,
      [id]
    );
    await client.query("COMMIT");
    return result.rows[0] ?? null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Blocked by ON DELETE RESTRICT if any class or enrollment still uses
// this academic year - the caller gets a clear foreign key error.
export async function deleteAcademicYear(id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM academic_years WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}
