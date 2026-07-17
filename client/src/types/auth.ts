export type UserRole = "admin" | "teacher" | "student" | "parent";

// Matches the shape returned by the backend's toPublicUser()
export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: User;
}
