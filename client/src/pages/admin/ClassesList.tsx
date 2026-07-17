import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getClassesRequest,
  createClassRequest,
  updateClassRequest,
  deleteClassRequest,
} from "../../api/classesApi";
import { ApiError } from "../../api/client";
import type { SchoolClass } from "../../types/classes";

interface ClassRowProps {
  cls: SchoolClass;
  token: string;
  onUpdated: (cls: SchoolClass) => void;
  onDeleted: (id: number) => void;
}

function ClassRow({ cls, token, onUpdated, onDeleted }: ClassRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(cls.name);
  const [gradeLevel, setGradeLevel] = useState(cls.gradeLevel);
  const [academicYear, setAcademicYear] = useState(cls.academicYear);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave() {
    setError(null);
    setIsSaving(true);
    try {
      const { class: updated } = await updateClassRequest(
        cls.id,
        { name, gradeLevel, academicYear },
        token
      );
      onUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${cls.name}"? This also removes its enrollments, attendance, and grades.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteClassRequest(cls.id, token);
      onDeleted(cls.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setIsDeleting(false);
    }
  }

  if (isEditing) {
    return (
      <tr className="border-t border-ink/5 bg-sun-cream/50">
        <td className="px-6 py-3" colSpan={4}>
          <div className="grid gap-3 md:grid-cols-4 md:items-end">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-ink/10 bg-white px-3 py-1.5 font-body text-sm"
            />
            <input
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="rounded-xl border border-ink/10 bg-white px-3 py-1.5 font-body text-sm"
            />
            <input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="rounded-xl border border-ink/10 bg-white px-3 py-1.5 font-body text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-full bg-marigold px-4 py-1.5 font-body text-sm font-bold text-ink disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setName(cls.name);
                  setGradeLevel(cls.gradeLevel);
                  setAcademicYear(cls.academicYear);
                  setError(null);
                }}
                className="rounded-full border-2 border-ink/10 px-4 py-1.5 font-body text-sm font-bold text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
          {error && <p className="mt-2 font-body text-sm font-semibold text-coral">{error}</p>}
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-ink/5">
      <td className="px-6 py-3 text-ink">{cls.name}</td>
      <td className="px-6 py-3 text-ink/70">{cls.gradeLevel}</td>
      <td className="px-6 py-3 text-ink/70">{cls.academicYear}</td>
      <td className="px-6 py-3 text-right">
        <button
          onClick={() => setIsEditing(true)}
          className="font-body text-sm font-bold text-sky-teal hover:underline"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="ml-4 font-body text-sm font-bold text-coral hover:underline disabled:opacity-60"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </td>
    </tr>
  );
}

export default function ClassesList() {
  const { token } = useAuth();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  function loadClasses(currentToken: string) {
    setIsLoading(true);
    getClassesRequest(currentToken)
      .then((data) => setClasses(data.classes))
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Something went wrong"))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (token) loadClasses(token);
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!token) return;

    setIsSubmitting(true);
    try {
      await createClassRequest({ name, gradeLevel, academicYear }, token);
      setName("");
      setGradeLevel("");
      setAcademicYear("");
      loadClasses(token);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleUpdated(updated: SchoolClass) {
    setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function handleDeleted(id: number) {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  }

  const filteredClasses = classes.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.gradeLevel.toLowerCase().includes(q) ||
      c.academicYear.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link to="/admin" className="font-body text-sm text-ink/60 hover:text-ink">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Classes</h1>

      {/* Add class form */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-4 md:items-end"
      >
        <div>
          <label htmlFor="name" className="font-body text-sm font-semibold text-ink/70">
            Class name
          </label>
          <input
            id="name"
            type="text"
            placeholder='e.g. "Grade 7 - A"'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
            required
          />
        </div>

        <div>
          <label htmlFor="gradeLevel" className="font-body text-sm font-semibold text-ink/70">
            Grade level
          </label>
          <input
            id="gradeLevel"
            type="text"
            placeholder='e.g. "7"'
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
            required
          />
        </div>

        <div>
          <label htmlFor="academicYear" className="font-body text-sm font-semibold text-ink/70">
            Academic year
          </label>
          <input
            id="academicYear"
            type="text"
            placeholder="2026-2027"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-marigold px-6 py-2 font-body font-bold text-ink transition-transform hover:scale-105 disabled:opacity-60"
        >
          {isSubmitting ? "Adding..." : "+ Add class"}
        </button>

        {formError && (
          <p className="font-body text-sm font-semibold text-coral md:col-span-4">{formError}</p>
        )}
      </form>

      {/* Classes list */}
      <input
        type="text"
        placeholder="Search classes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-6 w-full rounded-xl border border-ink/10 bg-white px-4 py-2 font-body md:w-80"
      />

      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm">
        {isLoading && <p className="p-6 font-body text-ink/60">Loading classes...</p>}
        {loadError && <p className="p-6 font-body text-coral">{loadError}</p>}

        {!isLoading && !loadError && filteredClasses.length === 0 && (
          <p className="p-6 font-body text-ink/60">
            {classes.length === 0 ? "No classes yet." : "No classes match your search."}
          </p>
        )}

        {!isLoading && !loadError && filteredClasses.length > 0 && token && (
          <table className="w-full text-left font-body">
            <thead className="bg-sun-cream text-sm text-ink/60">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Grade level</th>
                <th className="px-6 py-3">Academic year</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((cls) => (
                <ClassRow
                  key={cls.id}
                  cls={cls}
                  token={token}
                  onUpdated={handleUpdated}
                  onDeleted={handleDeleted}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
