import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getClassesRequest } from "../../api/classesApi";
import { getSubjectsRequest } from "../../api/subjectsApi";
import { getUsersRequest } from "../../api/usersApi";
import { getClassSubjectsRequest, createClassSubjectRequest } from "../../api/classSubjectsApi";
import { ApiError } from "../../api/client";
import type { SchoolClass } from "../../types/classes";
import type { Subject } from "../../types/subjects";
import type { User } from "../../types/auth";
import type { ClassSubjectView } from "../../types/classSubjects";

export default function ClassSubjects() {
  const { token } = useAuth();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<ClassSubjectView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setFormError(null);

    if (!token) return;
    if (!classId || !subjectId || !teacherId) {
      setFormError("Please select a class, a subject, and a teacher.");
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
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Assign teachers</h1>
      <p className="mt-1 font-body text-sm text-ink/60">
        Assign a teacher to teach a subject in a specific class.
      </p>

      {isLoading && <p className="mt-6 font-body text-ink/60">Loading...</p>}
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

              {formError && (
                <p className="font-body text-sm font-semibold text-coral md:col-span-4">
                  {formError}
                </p>
              )}
            </form>
          )}

          <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
            {assignments.length === 0 ? (
              <p className="p-6 font-body text-ink/60">No assignments yet.</p>
            ) : (
              <table className="w-full text-left font-body">
                <thead className="bg-sun-cream text-sm text-ink/60">
                  <tr>
                    <th className="px-6 py-3">Class</th>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Teacher</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className="border-t border-ink/5">
                      <td className="px-6 py-3 text-ink">{a.className}</td>
                      <td className="px-6 py-3 text-ink/70">{a.subjectName}</td>
                      <td className="px-6 py-3 text-ink/70">{a.teacherName}</td>
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
