import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getSubjectsRequest,
  createSubjectRequest,
  updateSubjectRequest,
  deleteSubjectRequest,
} from "../../api/subjectsApi";
import { ApiError } from "../../api/client";
import type { Subject } from "../../types/subjects";

interface SubjectRowProps {
  subject: Subject;
  token: string;
  onUpdated: (subject: Subject) => void;
  onDeleted: (id: number) => void;
}

function SubjectRow({ subject, token, onUpdated, onDeleted }: SubjectRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(subject.name);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave() {
    setError(null);
    setIsSaving(true);
    try {
      const { subject: updated } = await updateSubjectRequest(subject.id, name, token);
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
      `Delete "${subject.name}"? This also removes its teacher assignments and grades.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteSubjectRequest(subject.id, token);
      onDeleted(subject.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setIsDeleting(false);
    }
  }

  if (isEditing) {
    return (
      <li className="flex items-center gap-3 px-6 py-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-xl border border-ink/10 bg-sun-cream px-3 py-1.5 font-body text-sm"
        />
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
            setName(subject.name);
            setError(null);
          }}
          className="rounded-full border-2 border-ink/10 px-4 py-1.5 font-body text-sm font-bold text-ink"
        >
          Cancel
        </button>
        {error && <p className="font-body text-sm font-semibold text-coral">{error}</p>}
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between px-6 py-3">
      <span className="font-body text-ink">{subject.name}</span>
      <span>
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
      </span>
    </li>
  );
}

export default function SubjectsList() {
  const { token } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  function loadSubjects(currentToken: string) {
    setIsLoading(true);
    getSubjectsRequest(currentToken)
      .then((data) => setSubjects(data.subjects))
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Something went wrong"))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (token) loadSubjects(token);
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!token) return;

    setIsSubmitting(true);
    try {
      await createSubjectRequest(name, token);
      setName("");
      loadSubjects(token);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleUpdated(updated: Subject) {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  function handleDeleted(id: number) {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link to="/admin" className="font-body text-sm text-ink/60 hover:text-ink">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Subjects</h1>

      {/* Add subject form */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 flex items-end gap-4 rounded-3xl bg-white p-6 shadow-sm"
      >
        <div className="flex-1">
          <label htmlFor="name" className="font-body text-sm font-semibold text-ink/70">
            Subject name
          </label>
          <input
            id="name"
            type="text"
            placeholder='e.g. "Mathematics"'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-marigold px-6 py-2 font-body font-bold text-ink transition-transform hover:scale-105 disabled:opacity-60"
        >
          {isSubmitting ? "Adding..." : "+ Add subject"}
        </button>
      </form>
      {formError && <p className="mt-2 font-body text-sm font-semibold text-coral">{formError}</p>}

      {/* Subjects list */}
      <input
        type="text"
        placeholder="Search subjects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-6 w-full rounded-xl border border-ink/10 bg-white px-4 py-2 font-body md:w-80"
      />

      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm">
        {isLoading && <p className="p-6 font-body text-ink/60">Loading subjects...</p>}
        {loadError && <p className="p-6 font-body text-coral">{loadError}</p>}

        {!isLoading && !loadError && filteredSubjects.length === 0 && (
          <p className="p-6 font-body text-ink/60">
            {subjects.length === 0 ? "No subjects yet." : "No subjects match your search."}
          </p>
        )}

        {!isLoading && !loadError && filteredSubjects.length > 0 && token && (
          <ul className="divide-y divide-ink/5">
            {filteredSubjects.map((subject) => (
              <SubjectRow
                key={subject.id}
                subject={subject}
                token={token}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
