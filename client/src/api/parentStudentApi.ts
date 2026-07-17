import { apiFetch } from "./client";
import type { ParentStudentView, Relationship } from "../types/parentStudent";

interface CreateParentStudentPayload {
  parentId: number;
  studentId: number;
  relationship: Relationship;
}

export function getParentStudentsRequest(
  token: string
): Promise<{ links: ParentStudentView[] }> {
  return apiFetch<{ links: ParentStudentView[] }>("/parent-students", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createParentStudentRequest(
  payload: CreateParentStudentPayload,
  token: string
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>("/parent-students", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}
