import { apiFetch } from "./client";
import type { SchoolClass } from "../types/classes";

interface CreateClassPayload {
  name: string;
  gradeLevel: string;
  academicYearId: number;
}

export function getClassesRequest(token: string): Promise<{ classes: SchoolClass[] }> {
  return apiFetch<{ classes: SchoolClass[] }>("/classes", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createClassRequest(
  payload: CreateClassPayload,
  token: string
): Promise<{ class: SchoolClass }> {
  return apiFetch<{ class: SchoolClass }>("/classes", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function updateClassRequest(
  id: number,
  payload: CreateClassPayload,
  token: string
): Promise<{ class: SchoolClass }> {
  return apiFetch<{ class: SchoolClass }>(`/classes/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function deleteClassRequest(id: number, token: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/classes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
