import { apiFetch } from "./client";
import type { ClassSubjectView } from "../types/classSubjects";

interface CreateClassSubjectPayload {
  classId: number;
  subjectId: number;
  teacherId: number;
}

export function getClassSubjectsRequest(
  token: string
): Promise<{ classSubjects: ClassSubjectView[] }> {
  return apiFetch<{ classSubjects: ClassSubjectView[] }>("/class-subjects", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createClassSubjectRequest(
  payload: CreateClassSubjectPayload,
  token: string
): Promise<{ classSubject: unknown }> {
  return apiFetch<{ classSubject: unknown }>("/class-subjects", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}
