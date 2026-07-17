import { apiFetch } from "./client";
import type { ChildView, ChildDetails } from "../types/parent";

export function getMyChildrenRequest(token: string): Promise<{ children: ChildView[] }> {
  return apiFetch<{ children: ChildView[] }>("/parent/my-children", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getChildDetailsRequest(
  studentId: number,
  token: string
): Promise<ChildDetails> {
  return apiFetch<ChildDetails>(`/parent/children/${studentId}/details`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
