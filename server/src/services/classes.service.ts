import { pool } from "../config/db";
import { CreateClassInput, UpdateClassInput } from "../validators/classes.schema";

export interface ClassRecord {
  id: number;
  name: string;
  grade_level: string;
  academic_year_id: number;
  academic_year_label: string;
}

const SELECT_WITH_YEAR = `
  SELECT c.id, c.name, c.grade_level, c.academic_year_id, ay.label AS academic_year_label
  FROM classes c
  JOIN academic_years ay ON ay.id = c.academic_year_id
`;

export async function createClass(input: CreateClassInput): Promise<ClassRecord> {
  const inserted = await pool.query<{ id: number }>(
    `INSERT INTO classes (name, grade_level, academic_year_id)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [input.name, input.gradeLevel, input.academicYearId]
  );
  const result = await pool.query<ClassRecord>(
    `${SELECT_WITH_YEAR} WHERE c.id = $1`,
    [inserted.rows[0].id]
  );
  return result.rows[0];
}

export async function listClasses(): Promise<ClassRecord[]> {
  const result = await pool.query<ClassRecord>(
    `${SELECT_WITH_YEAR} ORDER BY ay.label DESC, c.grade_level, c.name`
  );
  return result.rows;
}

export async function updateClass(
  id: number,
  input: UpdateClassInput
): Promise<ClassRecord | null> {
  const updated = await pool.query(
    `UPDATE classes SET name = $1, grade_level = $2, academic_year_id = $3
     WHERE id = $4`,
    [input.name, input.gradeLevel, input.academicYearId, id]
  );
  if (updated.rowCount === 0) return null;

  const result = await pool.query<ClassRecord>(`${SELECT_WITH_YEAR} WHERE c.id = $1`, [id]);
  return result.rows[0] ?? null;
}

// Relies on ON DELETE CASCADE to also remove related class_subjects,
// enrollments, attendance, and grades rows for this class.
export async function deleteClass(id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM classes WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}
