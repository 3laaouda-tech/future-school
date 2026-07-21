import { apiFetch } from "./client";
import type { AdminStats } from "../types/adminStats";

export function getAdminStatsRequest(token: string): Promise<{ stats: AdminStats }> {
  return apiFetch<{ stats: AdminStats }>("/admin-stats", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
