import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUsersRequest } from "../../api/usersApi";
import { getParentStudentsRequest, createParentStudentRequest } from "../../api/parentStudentApi";
import { ApiError } from "../../api/client";
import type { User } from "../../types/auth";
import type { ParentStudentView, Relationship } from "../../types/parentStudent";

const relationshipOptions: { value: Relationship; label: string }[] = [
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "guardian", label: "Guardian" },
];

export default function ParentStudents() {
  const { token } = useAuth();

  const [parents, setParents] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [links, setLinks] = useState<ParentStudentView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [parentId, setParentId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [relationship, setRelationship] = useState<Relationship>("father");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadAll(currentToken: string) {
    setIsLoading(true);
    Promise.all([getUsersRequest(currentToken), getParentStudentsRequest(currentToken)])
      .then(([usersData, linksData]) => {
        setParents(usersData.users.filter((u) => u.role === "parent"));
        setStudents(usersData.users.filter((u) => u.role === "student"));
        setLinks(linksData.links);
      })
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Something went wrong"))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (token) loadAll(token);
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!token) return;
    if (!parentId || !studentId) {
      setFormError("Please select a parent and a student.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createParentStudentRequest(
        { parentId: Number(parentId), studentId: Number(studentId), relationship },
        token
      );
      setParentId("");
      setStudentId("");
      setRelationship("father");
      loadAll(token);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link to="/admin" className="font-body text-sm text-ink/60 hover:text-ink">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Link parents to students</h1>

      {isLoading && <p className="mt-6 font-body text-ink/60">Loading...</p>}
      {loadError && <p className="mt-6 font-body text-coral">{loadError}</p>}

      {!isLoading && !loadError && (
        <>
          {parents.length === 0 || students.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-white p-4 font-body text-sm text-ink/60">
              You need at least one parent and one student account before you can link them.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-4 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-4 md:items-end"
            >
              <div>
                <label htmlFor="parentId" className="font-body text-sm font-semibold text-ink/70">
                  Parent
                </label>
                <select
                  id="parentId"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
                >
                  <option value="">Select parent</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="studentId" className="font-body text-sm font-semibold text-ink/70">
                  Student
                </label>
                <select
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
                >
                  <option value="">Select student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="relationship" className="font-body text-sm font-semibold text-ink/70">
                  Relationship
                </label>
                <select
                  id="relationship"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as Relationship)}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
                >
                  {relationshipOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-marigold px-6 py-2 font-body font-bold text-ink transition-transform hover:scale-105 disabled:opacity-60"
              >
                {isSubmitting ? "Linking..." : "+ Link"}
              </button>

              {formError && (
                <p className="font-body text-sm font-semibold text-coral md:col-span-4">
                  {formError}
                </p>
              )}
            </form>
          )}

          <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
            {links.length === 0 ? (
              <p className="p-6 font-body text-ink/60">No links yet.</p>
            ) : (
              <table className="w-full text-left font-body">
                <thead className="bg-sun-cream text-sm text-ink/60">
                  <tr>
                    <th className="px-6 py-3">Parent</th>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Relationship</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr key={`${link.parentId}-${link.studentId}`} className="border-t border-ink/5">
                      <td className="px-6 py-3 text-ink">{link.parentName}</td>
                      <td className="px-6 py-3 text-ink/70">{link.studentName}</td>
                      <td className="px-6 py-3 text-ink/70 capitalize">{link.relationship}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
