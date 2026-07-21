import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  getClassesRequest,
  createClassRequest,
  updateClassRequest,
  deleteClassRequest,
} from "../../api/classesApi";
import { getAcademicYearsRequest } from "../../api/academicYearsApi";
import { ApiError } from "../../api/client";
import { SkeletonRow } from "../../components/Skeleton";
import { gradeLevels } from "../../constants";
import type { SchoolClass } from "../../types/classes";
import type { AcademicYear } from "../../types/academicYears";

interface ClassRowProps {
  cls: SchoolClass;
  token: string;
  academicYears: AcademicYear[];
  onUpdated: (cls: SchoolClass) => void;
  onDeleted: (id: number) => void;
}

function ClassRow({ cls, token, academicYears, onUpdated, onDeleted }: ClassRowProps) {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(cls.name);
  const [gradeLevel, setGradeLevel] = useState(cls.gradeLevel);
  const [academicYearId, setAcademicYearId] = useState(String(cls.academicYearId));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      const { class: updated } = await updateClassRequest(
        cls.id,
        { name, gradeLevel, academicYearId: Number(academicYearId) },
        token
      );
      onUpdated(updated);
      setIsEditing(false);
      showToast(`${updated.name} was updated.`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong", "error");
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
      showToast(`"${cls.name}" was deleted.`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong", "error");
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
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="rounded-xl border border-ink/10 bg-white px-3 py-1.5 font-body text-sm"
            >
              {gradeLevels.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <select
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              className="rounded-xl border border-ink/10 bg-white px-3 py-1.5 font-body text-sm"
            >
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.label}
                </option>
              ))}
            </select>
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
                  setAcademicYearId(String(cls.academicYearId));
                }}
                className="rounded-full border-2 border-ink/10 px-4 py-1.5 font-body text-sm font-bold text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-ink/5">
      <td className="px-6 py-3 text-ink">{cls.name}</td>
      <td className="px-6 py-3 text-ink/70">{cls.gradeLevel}</td>
      <td className="px-6 py-3 text-ink/70">{cls.academicYearLabel}</td>
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
  const { showToast } = useToast();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState<string>(gradeLevels[0]);
  const [academicYearId, setAcademicYearId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  function loadAll(currentToken: string) {
    setIsLoading(true);
    Promise.all([getClassesRequest(currentToken), getAcademicYearsRequest(currentToken)])
      .then(([classesData, yearsData]) => {
        setClasses(classesData.classes);
        setAcademicYears(yearsData.academicYears);
        // default the form to the current academic year, if there is one
        const current = yearsData.academicYears.find((y) => y.isCurrent);
        setAcademicYearId(String((current ?? yearsData.academicYears[0])?.id ?? ""));
      })
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Something went wrong"))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (token) loadAll(token);
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!token) return;
    if (!academicYearId) {
      showToast("Please add an academic year first.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createClassRequest(
        { name, gradeLevel, academicYearId: Number(academicYearId) },
        token
      );
      setName("");
      setGradeLevel(gradeLevels[0]);
      loadAll(token);
      showToast(`"${name}" was created.`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong", "error");
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
      c.academicYearLabel.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link to="/admin" className="font-body text-sm text-ink/60 hover:text-ink">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Classes</h1>

      {!isLoading && !loadError && academicYears.length === 0 && (
        <p className="mt-6 rounded-2xl bg-white p-4 font-body text-sm text-ink/60">
          You need to{" "}
          <Link to="/admin/academic-years" className="font-bold text-sky-teal hover:underline">
            add an academic year
          </Link>{" "}
          before you can create a class.
        </p>
      )}

      {/* Add class form */}
      {academicYears.length > 0 && (
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
            <select
              id="gradeLevel"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
            >
              {gradeLevels.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="academicYearId" className="font-body text-sm font-semibold text-ink/70">
              Academic year
            </label>
            <select
              id="academicYearId"
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
            >
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-marigold px-6 py-2 font-body font-bold text-ink transition-transform hover:scale-105 disabled:opacity-60"
          >
            {isSubmitting ? "Adding..." : "+ Add class"}
          </button>
        </form>
      )}

      {/* Classes list */}
      <input
        type="text"
        placeholder="Search classes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-6 w-full rounded-xl border border-ink/10 bg-white px-4 py-2 font-body md:w-80"
      />

      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm">
        {isLoading && (
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
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRow key={i} columns={4} />
              ))}
            </tbody>
          </table>
        )}
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
                  academicYears={academicYears}
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
