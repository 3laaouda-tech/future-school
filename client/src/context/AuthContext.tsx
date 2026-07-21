import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/auth";
import { loginRequest } from "../api/authApi";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Reads any previously saved session from localStorage so a page refresh
// doesn't log the user out.
function loadStoredUser(): User | null {
  const raw = localStorage.getItem("auth_user");
  return raw ? (JSON.parse(raw) as User) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));

  async function login(email: string, password: string): Promise<User> {
    const data = await loginRequest(email, password);

    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    return data.user;
  }

  function logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  }

  // Called after a successful profile edit, so the navbar and any other
  // place reading `user` reflects the change immediately without a
  // full login/logout cycle.
  function updateUser(updated: User): void {
    localStorage.setItem("auth_user", JSON.stringify(updated));
    setUser(updated);
  }

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: user !== null && token !== null,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook so components use `useAuth()` instead of importing
// useContext + AuthContext everywhere (also throws a clear error if
// someone forgets to wrap the app in <AuthProvider>).
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
