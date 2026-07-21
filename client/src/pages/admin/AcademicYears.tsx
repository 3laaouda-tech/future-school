import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  getAcademicYearsRequest,
  createAcademicYearRequest,
  setCurrentAcademicYearRequest,
  deleteAcademicYearRequest,
} from "../../api/academicYearsApi";
import { ApiError } from "../../api/client";
import type { AcademicYear } from "../../types/academicYears";

export default function AcademicYears() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [label, setLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  function loadYears(currentToken: string) {
    setIsLoading(true);
    getAcademicYearsRequest(currentToken)
      .then((data) => setYears(data.academicYears))
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Something went wrong"))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (token) loadYears(token);
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!token) return;

    setIsSubmitting(true);
    try {
      await createAcademicYearRequest(label, token);
      showToast(`Academic year "${label}" was created.`);
      setLabel("");
      loadYears(token);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSetCurrent(id: number) {
    if (!token) return;
    setBusyId(id);
    try {
      await setCurrentAcademicYearRequest(id, token);
      loadYears(token);
      showToast("Current academic year updated.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number, label: string) {
    if (!token) return;
    const confirmed = window.confirm(`Delete academic year "${label}"?`);
    if (!confirmed) return;

    setBusyId(id);
    try {
      await deleteAcademicYearRequest(id, token);
      setYears((prev) => prev.filter((y) => y.id !== id));
      showToast(`Academic year "${label}" was deleted.`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link to="/admin" className="font-body text-sm text-ink/60 hover:text-ink">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Academic years</h1>
      <p className="mt-1 font-body text-sm text-ink/60">
        Manage the academic years used across classes and enrollments.
      </p>

      {/* Add academic year form */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 flex items-end gap-4 rounded-3xl bg-white p-6 shadow-sm"
      >
        <div className="flex-1">
          <label htmlFor="label" className="font-body text-sm font-semibold text-ink/70">
            Academic year
          </label>
          <input
            id="label"
            type="text"
            placeholder="2027-2028"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-marigold px-6 py-2 font-body font-bold text-ink transition-transform hover:scale-105 disabled:opacity-60"
        >
          {isSubmitting ? "Adding..." : "+ Add"}
        </button>
      </form>

      {/* Academic years list */}
      <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
        {isLoading && <p className="p-6 font-body text-ink/60">Loading...</p>}
        {loadError && <p className="p-6 font-body text-coral">{loadError}</p>}

        {!isLoading && !loadError && years.length === 0 && (
          <p className="p-6 font-body text-ink/60">No academic years yet.</p>
        )}

        {!isLoading && !loadError && years.length > 0 && (
          <ul className="divide-y divide-ink/5">
            {years.map((year) => (
              <li key={year.id} className="flex items-center justify-between px-6 py-3">
                <span className="flex items-center gap-2 font-body text-ink">
                  {year.label}
                  {year.isCurrent && (
                    <span className="rounded-full bg-leaf/20 px-2 py-0.5 text-xs font-bold text-leaf">
                      Current
                    </span>
                  )}
                </span>
                <span>
                  {!year.isCurrent && (
                    <button
                      onClick={() => handleSetCurrent(year.id)}
                      disabled={busyId === year.id}
                      className="font-body text-sm font-bold text-sky-teal hover:underline disabled:opacity-60"
                    >
                      Set as current
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(year.id, year.label)}
                    disabled={busyId === year.id}
                    className="ml-4 font-body text-sm font-bold text-coral hover:underline disabled:opacity-60"
                  >
                    Delete
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
