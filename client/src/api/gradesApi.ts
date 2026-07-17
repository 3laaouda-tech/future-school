import { apiFetch } from "./client";
import type { GradeView } from "../types/grades";

interface SubmitGradePayload {
  studentId: number;
  term: string;
  assessmentType: string;
  score: number;
  maxScore: number;
}

export function getGradesRequest(
  classId: number,
  subjectId: number,
  token: string
): Promise<{ grades: GradeView[] }> {
  return apiFetch<{ grades: GradeView[] }>(
    `/teacher/classes/${classId}/subjects/${subjectId}/grades`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function submitGradeRequest(
  classId: number,
  subjectId: number,
  payload: SubmitGradePayload,
  token: string
): Promise<{ grade: unknown }> {
  return apiFetch<{ grade: unknown }>(
    `/teacher/classes/${classId}/subjects/${subjectId}/grades`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }
  );
}
