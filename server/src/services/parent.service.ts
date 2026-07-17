import { pool } from "../config/db";

export interface ChildView {
  studentId: number;
  studentName: string;
  relationship: string;
}

export async function getMyChildren(parentId: number): Promise<ChildView[]> {
  const result = await pool.query<ChildView>(
    `SELECT
       ps.student_id AS "studentId",
       u.full_name AS "studentName",
       ps.relationship
     FROM parent_student ps
     JOIN users u ON u.id = ps.student_id
     WHERE ps.parent_id = $1
     ORDER BY u.full_name`,
    [parentId]
  );
  return result.rows;
}

// Confirms this parent is actually linked to this student, before
// letting them see any of that student's class/attendance/grades data.
export async function verifyParentOfStudent(
  parentId: number,
  studentId: number
): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1 FROM parent_student WHERE parent_id = $1 AND student_id = $2 LIMIT 1`,
    [parentId, studentId]
  );
  return (result.rowCount ?? 0) > 0;
}
