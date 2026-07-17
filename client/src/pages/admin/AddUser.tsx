import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createUserRequest } from "../../api/usersApi";
import { ApiError } from "../../api/client";
import type { UserRole } from "../../types/auth";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
  { value: "admin", label: "Admin" },
];

export default function AddUser() {
  const { token } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("teacher");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!token) {
      setError("You must be logged in as an admin to add a user.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = await createUserRequest({ fullName, email, password, role }, token);
      setSuccessMessage(`${user.fullName} was added as ${user.role}.`);
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("teacher");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-sun-cream px-6 py-10">
      <div className="mx-auto max-w-md">
        <Link to="/admin" className="font-body text-sm text-ink/60 hover:text-ink">
          ← Back to dashboard
        </Link>

        <form
          onSubmit={handleSubmit}
          className="mt-4 rounded-3xl bg-white p-8 shadow-sm"
        >
          <h1 className="font-display text-2xl font-semibold text-ink">Add a new user</h1>
          <p className="mt-1 font-body text-sm text-ink/60">
            Create an account for a teacher, student, parent, or another admin.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="fullName" className="font-body text-sm font-semibold text-ink/70">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="font-body text-sm font-semibold text-ink/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="font-body text-sm font-semibold text-ink/70">
                Temporary password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
                minLength={8}
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="font-body text-sm font-semibold text-ink/70">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="mt-4 text-sm font-semibold text-coral">{error}</p>}
          {successMessage && (
            <p className="mt-4 text-sm font-semibold text-leaf">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-full bg-marigold px-6 py-3 font-body font-bold text-ink transition-transform hover:scale-105 disabled:opacity-60"
          >
            {isSubmitting ? "Adding..." : "Add user"}
          </button>
        </form>
      </div>
    </div>
  );
}
