import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyClassRequest, getMyAttendanceRequest, getMyGradesRequest } from "../../api/studentApi";
import { ApiError } from "../../api/client";
import type {
  StudentClassInfo,
  StudentSubjectView,
  StudentAttendanceEntry,
  StudentGradeEntry,
} from "../../types/student";

const statusColor: Record<string, string> = {
  present: "bg-leaf/20 text-leaf",
  absent: "bg-coral/20 text-coral",
  late: "bg-marigold/20 text-ink",
  excused: "bg-sky-teal/20 text-sky-teal",
};

export default function StudentDashboard() {
  const { token } = useAuth();
  const [classInfo, setClassInfo] = useState<StudentClassInfo | null>(null);
  const [subjects, setSubjects] = useState<StudentSubjectView[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendanceEntry[]>([]);
  const [grades, setGrades] = useState<StudentGradeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      getMyClassRequest(token),
      getMyAttendanceRequest(token),
      getMyGradesRequest(token),
    ])
      .then(([classData, attendanceData, gradesData]) => {
        setClassInfo(classData.class);
        setSubjects(classData.subjects);
        setAttendance(attendanceData.attendance);
        setGrades(gradesData.grades);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Something went wrong"))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">My class</h1>

      {isLoading && <p className="mt-6 font-body text-ink/60">Loading...</p>}
      {error && <p className="mt-6 font-body text-coral">{error}</p>}

      {!isLoading && !error && !classInfo && (
        <p className="mt-6 rounded-2xl bg-white p-6 font-body text-ink/60">
          You're not enrolled in a class yet. Ask an admin to enroll you.
        </p>
      )}

      {!isLoading && !error && classInfo && (
        <>
          <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
            <p className="font-display text-lg font-semibold text-ink">{classInfo.className}</p>
            <p className="mt-1 font-body text-sm text-ink/60">{classInfo.academicYear}</p>
          </div>

          {/* Subjects */}
          <h2 className="mt-8 font-display text-lg font-semibold text-ink">My subjects</h2>
          {subjects.length === 0 ? (
            <p className="mt-2 font-body text-ink/60">No subjects assigned to your class yet.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm">
              <table className="w-full text-left font-body">
                <thead className="bg-sun-cream text-sm text-ink/60">
                  <tr>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Teacher</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.subjectId} className="border-t border-ink/5">
                      <td className="px-6 py-3 text-ink">{s.subjectName}</td>
                      <td className="px-6 py-3 text-ink/70">{s.teacherName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Attendance */}
          <h2 className="mt-8 font-display text-lg font-semibold text-ink">My attendance</h2>
          {attendance.length === 0 ? (
            <p className="mt-2 font-body text-ink/60">No attendance records yet.</p>
          ) : (
            <div className="mt-4 max-h-64 overflow-y-auto rounded-3xl bg-white shadow-sm">
              <table className="w-full text-left font-body">
                <thead className="sticky top-0 bg-sun-cream text-sm text-ink/60">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a) => (
                    <tr key={a.date} className="border-t border-ink/5">
                      <td className="px-6 py-3 text-ink">{a.date}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusColor[a.status] ?? ""}`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Grades */}
          <h2 className="mt-8 font-display text-lg font-semibold text-ink">My grades</h2>
          {grades.length === 0 ? (
            <p className="mt-2 font-body text-ink/60">No grades entered yet.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm">
              <table className="w-full text-left font-body">
                <thead className="bg-sun-cream text-sm text-ink/60">
                  <tr>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Term</th>
                    <th className="px-6 py-3">Assessment</th>
                    <th className="px-6 py-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g, i) => (
                    <tr key={i} className="border-t border-ink/5">
                      <td className="px-6 py-3 text-ink">{g.subjectName}</td>
                      <td className="px-6 py-3 text-ink/70">{g.term}</td>
                      <td className="px-6 py-3 text-ink/70">{g.assessmentType}</td>
                      <td className="px-6 py-3 text-ink/70">
                        {g.score} / {g.maxScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
