import { pool } from "../config/db";
import { CreateClassInput, UpdateClassInput } from "../validators/classes.schema";

export interface ClassRecord {
  id: number;
  name: string;
  grade_level: string;
  academic_year: string;
}

export async function createClass(input: CreateClassInput): Promise<ClassRecord> {
  const result = await pool.query<ClassRecord>(
    `INSERT INTO classes (name, grade_level, academic_year)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.name, input.gradeLevel, input.academicYear]
  );
  return result.rows[0];
}

export async function listClasses(): Promise<ClassRecord[]> {
  const result = await pool.query<ClassRecord>(
    `SELECT * FROM classes ORDER BY academic_year DESC, grade_level, name`
  );
  return result.rows;
}

export async function updateClass(
  id: number,
  input: UpdateClassInput
): Promise<ClassRecord | null> {
  const result = await pool.query<ClassRecord>(
    `UPDATE classes SET name = $1, grade_level = $2, academic_year = $3
     WHERE id = $4
     RETURNING *`,
    [input.name, input.gradeLevel, input.academicYear, id]
  );
  return result.rows[0] ?? null;
}

// Relies on ON DELETE CASCADE to also remove related class_subjects,
// enrollments, attendance, and grades rows for this class.
export async function deleteClass(id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM classes WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}
