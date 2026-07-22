import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getClassesRequest } from "../../api/classesApi";
import { getSubjectsRequest } from "../../api/subjectsApi";
import { getUsersRequest } from "../../api/usersApi";
import { getClassSubjectsRequest, createClassSubjectRequest } from "../../api/classSubjectsApi";
import { ApiError } from "../../api/client";
import { Skeleton, SkeletonRow } from "../../components/Skeleton";
import type { SchoolClass } from "../../types/classes";
import type { Subject } from "../../types/subjects";
import type { User } from "../../types/auth";
import type { ClassSubjectView } from "../../types/classSubjects";

const PAGE_SIZE = 8;

export default function ClassSubjects() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<ClassSubjectView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  function loadAll(currentToken: string) {
    setIsLoading(true);
    Promise.all([
      getClassesRequest(currentToken),
      getSubjectsRequest(currentToken),
      getUsersRequest(currentToken),
      getClassSubjectsRequest(currentToken),
    ])
      .then(([classesData, subjectsData, usersData, assignmentsData]) => {
        setClasses(classesData.classes);
        setSubjects(subjectsData.subjects);
        setTeachers(usersData.users.filter((u) => u.role === "teacher"));
        setAssignments(assignmentsData.classSubjects);
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
    if (!classId || !subjectId || !teacherId) {
      showToast("Please select a class, a subject, and a teacher.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createClassSubjectRequest(
        { classId: Number(classId), subjectId: Number(subjectId), teacherId: Number(teacherId) },
        token
      );
      setClassId("");
      setSubjectId("");
      setTeacherId("");
      loadAll(token);
      showToast("Teacher assigned.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link to="/admin" className="font-body text-sm text-ink/60 hover:text-ink">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Assign teachers</h1>
      <p className="mt-1 font-body text-sm text-ink/60">
        Assign a teacher to teach a subject in a specific class.
      </p>

      {isLoading && (
        <>
          <div className="mt-6 grid gap-4 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
          <table className="mt-6 w-full overflow-hidden rounded-3xl bg-white text-left font-body shadow-sm">
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={i} columns={3} />
              ))}
            </tbody>
          </table>
        </>
      )}
      {loadError && <p className="mt-6 font-body text-coral">{loadError}</p>}

      {!isLoading && !loadError && (
        <>
          {classes.length === 0 || subjects.length === 0 || teachers.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-white p-4 font-body text-sm text-ink/60">
              You need at least one class, one subject, and one teacher before you can
              create an assignment.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-4 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-4 md:items-end"
            >
              <div>
                <label htmlFor="classId" className="font-body text-sm font-semibold text-ink/70">
                  Class
                </label>
                <select
                  id="classId"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
                >
                  <option value="">Select class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subjectId" className="font-body text-sm font-semibold text-ink/70">
                  Subject
                </label>
                <select
                  id="subjectId"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
                >
                  <option value="">Select subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="teacherId" className="font-body text-sm font-semibold text-ink/70">
                  Teacher
                </label>
                <select
                  id="teacherId"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
                >
                  <option value="">Select teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-marigold px-6 py-2 font-body font-bold text-ink transition-transform hover:scale-105 disabled:opacity-60"
              >
                {isSubmitting ? "Assigning..." : "+ Assign"}
              </button>
            </form>
          )}

          <input
            type="text"
            placeholder="Search by class, subject, or teacher..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="mt-6 w-full rounded-xl border border-ink/10 bg-white px-4 py-2 font-body md:w-80"
          />

          <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm">
            {(() => {
              const filtered = assignments.filter((a) => {
                const q = search.trim().toLowerCase();
                if (!q) return true;
                return (
                  a.className.toLowerCase().includes(q) ||
                  a.subjectName.toLowerCase().includes(q) ||
                  a.teacherName.toLowerCase().includes(q)
                );
              });
              const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
              const currentPage = Math.min(page, totalPages);
              const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

              if (filtered.length === 0) {
                return (
                  <p className="p-6 font-body text-ink/60">
                    {assignments.length === 0 ? "No assignments yet." : "No assignments match your search."}
                  </p>
                );
              }

              return (
                <>
                  <table className="w-full text-left font-body">
                    <thead className="bg-sun-cream text-sm text-ink/60">
                      <tr>
                        <th className="px-6 py-3">Class</th>
                        <th className="px-6 py-3">Subject</th>
                        <th className="px-6 py-3">Teacher</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((a) => (
                        <tr key={a.id} className="border-t border-ink/5">
                          <td className="px-6 py-3 text-ink">{a.className}</td>
                          <td className="px-6 py-3 text-ink/70">{a.subjectName}</td>
                          <td className="px-6 py-3 text-ink/70">{a.teacherName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length > PAGE_SIZE && (
                    <div className="flex items-center justify-between border-t border-ink/5 px-6 py-3">
                      <p className="font-body text-sm text-ink/60">
                        Page {currentPage} of {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="rounded-full border-2 border-ink/10 bg-white px-4 py-1 font-body text-sm font-bold text-ink disabled:opacity-40"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="rounded-full border-2 border-ink/10 bg-white px-4 py-1 font-body text-sm font-bold text-ink disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}
