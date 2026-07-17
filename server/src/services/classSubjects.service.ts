import { pool } from "../config/db";
import { CreateClassSubjectInput } from "../validators/classSubjects.schema";

export interface ClassSubjectRecord {
  id: number;
  class_id: number;
  subject_id: number;
  teacher_id: number;
}

// Shape returned to the frontend: includes readable names, not just ids
export interface ClassSubjectView {
  id: number;
  className: string;
  subjectName: string;
  teacherName: string;
}

export async function createClassSubject(
  input: CreateClassSubjectInput
): Promise<ClassSubjectRecord> {
  const result = await pool.query<ClassSubjectRecord>(
    `INSERT INTO class_subjects (class_id, subject_id, teacher_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.classId, input.subjectId, input.teacherId]
  );
  return result.rows[0];
}

export async function listClassSubjects(): Promise<ClassSubjectView[]> {
  const result = await pool.query<ClassSubjectView>(
    `SELECT
       cs.id,
       c.name AS "className",
       s.name AS "subjectName",
       u.full_name AS "teacherName"
     FROM class_subjects cs
     JOIN classes c ON c.id = cs.class_id
     JOIN subjects s ON s.id = cs.subject_id
     JOIN users u ON u.id = cs.teacher_id
     ORDER BY c.name, s.name`
  );
  return result.rows;
}

// Shape used by the teacher's "my classes" screen - includes the raw
// class/subject ids too, since the teacher needs to navigate into
// attendance/grades screens for a specific class+subject pair.
export interface TeacherClassView {
  id: number;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
}

export async function listClassSubjectsByTeacher(teacherId: number): Promise<TeacherClassView[]> {
  const result = await pool.query<TeacherClassView>(
    `SELECT
       cs.id,
       c.id AS "classId",
       c.name AS "className",
       s.id AS "subjectId",
       s.name AS "subjectName"
     FROM class_subjects cs
     JOIN classes c ON c.id = cs.class_id
     JOIN subjects s ON s.id = cs.subject_id
     WHERE cs.teacher_id = $1
     ORDER BY c.name, s.name`,
    [teacherId]
  );
  return result.rows;
}
