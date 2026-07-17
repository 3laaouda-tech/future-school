import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sun-cream px-6">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="mb-6 block text-center font-display text-xl font-semibold text-ink"
        >
          🌱 Future School
        </Link>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-1 font-body text-sm text-ink/60">
            Log in to your Future School account.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="font-body text-sm font-semibold text-ink/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body text-ink outline-none focus:border-marigold"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="font-body text-sm font-semibold text-ink/70">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body text-ink outline-none focus:border-marigold"
                required
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 font-body text-sm font-semibold text-coral">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-full bg-marigold px-6 py-3 font-body font-bold text-ink transition-transform hover:scale-105 disabled:opacity-60"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <Link
          to="/"
          className="mt-4 block text-center font-body text-sm text-ink/50 hover:text-ink"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
