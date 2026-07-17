import { pool } from "../config/db";
import { CreateParentStudentInput } from "../validators/parentStudent.schema";

export async function createParentStudentLink(input: CreateParentStudentInput): Promise<void> {
  await pool.query(
    `INSERT INTO parent_student (parent_id, student_id, relationship)
     VALUES ($1, $2, $3)`,
    [input.parentId, input.studentId, input.relationship]
  );
}

export interface ParentStudentView {
  parentId: number;
  parentName: string;
  studentId: number;
  studentName: string;
  relationship: string;
}

export async function listParentStudentLinks(): Promise<ParentStudentView[]> {
  const result = await pool.query<ParentStudentView>(
    `SELECT
       ps.parent_id AS "parentId",
       pu.full_name AS "parentName",
       ps.student_id AS "studentId",
       su.full_name AS "studentName",
       ps.relationship
     FROM parent_student ps
     JOIN users pu ON pu.id = ps.parent_id
     JOIN users su ON su.id = ps.student_id
     ORDER BY pu.full_name, su.full_name`
  );
  return result.rows;
}
