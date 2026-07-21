import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getClassesRequest } from "../../api/classesApi";
import { getUsersRequest } from "../../api/usersApi";
import { getEnrollmentsRequest, createEnrollmentRequest } from "../../api/enrollmentsApi";
import { getAcademicYearsRequest } from "../../api/academicYearsApi";
import { ApiError } from "../../api/client";
import { Skeleton, SkeletonRow } from "../../components/Skeleton";
import type { SchoolClass } from "../../types/classes";
import type { User } from "../../types/auth";
import type { EnrollmentView } from "../../types/enrollments";
import type { AcademicYear } from "../../types/academicYears";

export default function Enrollments() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentView[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadAll(currentToken: string) {
    setIsLoading(true);
    Promise.all([
      getClassesRequest(currentToken),
      getUsersRequest(currentToken),
      getEnrollmentsRequest(currentToken),
      getAcademicYearsRequest(currentToken),
    ])
      .then(([classesData, usersData, enrollmentsData, yearsData]) => {
        setClasses(classesData.classes);
        setStudents(usersData.users.filter((u) => u.role === "student"));
        setEnrollments(enrollmentsData.enrollments);
        setAcademicYears(yearsData.academicYears);
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
    if (!studentId || !classId || !academicYearId) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createEnrollmentRequest(
        { studentId: Number(studentId), classId: Number(classId), academicYearId: Number(academicYearId) },
        token
      );
      setStudentId("");
      setClassId("");
      loadAll(token);
      showToast("Student enrolled.");
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
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Enroll students</h1>
      <p className="mt-1 font-body text-sm text-ink/60">
        Assign a student to a class for a given academic year.
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
          {classes.length === 0 || students.length === 0 || academicYears.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-white p-4 font-body text-sm text-ink/60">
              You need at least one class, one student, and one academic year before you can
              enroll anyone.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-4 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-4 md:items-end"
            >
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
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.fullName}
                    </option>
                  ))}
                </select>
              </div>

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
                {isSubmitting ? "Enrolling..." : "+ Enroll"}
              </button>
            </form>
          )}

          <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
            {enrollments.length === 0 ? (
              <p className="p-6 font-body text-ink/60">No enrollments yet.</p>
            ) : (
              <table className="w-full text-left font-body">
                <thead className="bg-sun-cream text-sm text-ink/60">
                  <tr>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Class</th>
                    <th className="px-6 py-3">Academic year</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => (
                    <tr key={e.id} className="border-t border-ink/5">
                      <td className="px-6 py-3 text-ink">{e.studentName}</td>
                      <td className="px-6 py-3 text-ink/70">{e.className}</td>
                      <td className="px-6 py-3 text-ink/70">{e.academicYear}</td>
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
