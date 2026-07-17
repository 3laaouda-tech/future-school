import { apiFetch } from "./client";
import type { Subject } from "../types/subjects";

export function getSubjectsRequest(token: string): Promise<{ subjects: Subject[] }> {
  return apiFetch<{ subjects: Subject[] }>("/subjects", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createSubjectRequest(
  name: string,
  token: string
): Promise<{ subject: Subject }> {
  return apiFetch<{ subject: Subject }>("/subjects", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
}

export function updateSubjectRequest(
  id: number,
  name: string,
  token: string
): Promise<{ subject: Subject }> {
  return apiFetch<{ subject: Subject }>(`/subjects/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
}

export function deleteSubjectRequest(id: number, token: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/subjects/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
