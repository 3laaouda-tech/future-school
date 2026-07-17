import { pool } from "../config/db";
import { CreateSubjectInput, UpdateSubjectInput } from "../validators/subjects.schema";

export interface SubjectRecord {
  id: number;
  name: string;
}

export async function createSubject(input: CreateSubjectInput): Promise<SubjectRecord> {
  const result = await pool.query<SubjectRecord>(
    `INSERT INTO subjects (name) VALUES ($1) RETURNING *`,
    [input.name]
  );
  return result.rows[0];
}

export async function listSubjects(): Promise<SubjectRecord[]> {
  const result = await pool.query<SubjectRecord>(`SELECT * FROM subjects ORDER BY name`);
  return result.rows;
}

export async function updateSubject(
  id: number,
  input: UpdateSubjectInput
): Promise<SubjectRecord | null> {
  const result = await pool.query<SubjectRecord>(
    `UPDATE subjects SET name = $1 WHERE id = $2 RETURNING *`,
    [input.name, id]
  );
  return result.rows[0] ?? null;
}

// Relies on ON DELETE CASCADE to also remove related class_subjects
// and grades rows for this subject.
export async function deleteSubject(id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM subjects WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}
