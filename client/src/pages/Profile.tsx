import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { updateMeRequest } from "../api/usersApi";
import { ApiError } from "../api/client";

const roleBadgeColor: Record<string, string> = {
  admin: "bg-coral/20 text-coral",
  teacher: "bg-sky-teal/20 text-sky-teal",
  student: "bg-marigold/20 text-ink",
  parent: "bg-leaf/20 text-leaf",
};

export default function Profile() {
  const { user, token, updateUser } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    try {
      const payload = password ? { fullName, email, password } : { fullName, email };
      const { user: updated } = await updateMeRequest(payload, token);
      updateUser(updated);
      setPassword("");
      showToast("Your profile was updated.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <Link
        to={`/${user.role}`}
        className="font-body text-sm text-ink/60 hover:text-ink"
      >
        ← Back to dashboard
      </Link>

      <form onSubmit={handleSubmit} className="mt-4 rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-semibold text-ink">My profile</h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${roleBadgeColor[user.role]}`}
          >
            {user.role}
          </span>
        </div>
        <p className="mt-1 font-body text-sm text-ink/60">
          Update your name, email, or password.
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
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              minLength={8}
              className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-full bg-marigold px-6 py-3 font-body font-bold text-ink transition-transform hover:scale-105 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
