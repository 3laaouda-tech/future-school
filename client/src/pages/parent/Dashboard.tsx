import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyChildrenRequest, getChildDetailsRequest } from "../../api/parentApi";
import { ApiError } from "../../api/client";
import { Skeleton, SkeletonCard } from "../../components/Skeleton";
import type { ChildView, ChildDetails } from "../../types/parent";

const statusColor: Record<string, string> = {
  present: "bg-leaf/20 text-leaf",
  absent: "bg-coral/20 text-coral",
  late: "bg-marigold/20 text-ink",
  excused: "bg-sky-teal/20 text-sky-teal",
};

export default function ParentDashboard() {
  const { token } = useAuth();
  const [children, setChildren] = useState<ChildView[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [details, setDetails] = useState<ChildDetails | null>(null);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getMyChildrenRequest(token)
      .then((data) => {
        setChildren(data.children);
        if (data.children.length > 0) setSelectedId(data.children[0].studentId);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Something went wrong"))
      .finally(() => setIsLoadingChildren(false));
  }, [token]);

  useEffect(() => {
    if (!token || selectedId === null) return;
    setIsLoadingDetails(true);
    getChildDetailsRequest(selectedId, token)
      .then(setDetails)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Something went wrong"))
      .finally(() => setIsLoadingDetails(false));
  }, [token, selectedId]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">My children</h1>

      {isLoadingChildren && (
        <div className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>
      )}
      {error && <p className="mt-6 font-body text-coral">{error}</p>}

      {!isLoadingChildren && !error && children.length === 0 && (
        <p className="mt-6 rounded-2xl bg-white p-6 font-body text-ink/60">
          No children are linked to your account yet. Ask an admin to link them.
        </p>
      )}

      {!isLoadingChildren && !error && children.length > 0 && (
        <>
          {/* Child selector tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {children.map((child) => (
              <button
                key={child.studentId}
                onClick={() => setSelectedId(child.studentId)}
                className={`rounded-full px-4 py-2 font-body text-sm font-bold transition-transform hover:scale-105 ${
                  selectedId === child.studentId
                    ? "bg-marigold text-ink"
                    : "bg-white text-ink/60"
                }`}
              >
                {child.studentName}
                <span className="ml-1 font-normal capitalize text-ink/50">
                  ({child.relationship})
                </span>
              </button>
            ))}
          </div>

          {isLoadingDetails && (
            <div className="mt-6 space-y-6">
              <SkeletonCard />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            </div>
          )}

          {!isLoadingDetails && details && (
            <>
              {details.class ? (
                <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
                  <p className="font-display text-lg font-semibold text-ink">
                    {details.class.className}
                  </p>
                  <p className="mt-1 font-body text-sm text-ink/60">{details.class.academicYear}</p>
                </div>
              ) : (
                <p className="mt-6 rounded-2xl bg-white p-6 font-body text-ink/60">
                  This child is not enrolled in a class yet.
                </p>
              )}

              {/* Subjects */}
              <h2 className="mt-8 font-display text-lg font-semibold text-ink">Subjects</h2>
              {details.subjects.length === 0 ? (
                <p className="mt-2 font-body text-ink/60">No subjects assigned yet.</p>
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
                      {details.subjects.map((s) => (
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
              <h2 className="mt-8 font-display text-lg font-semibold text-ink">Attendance</h2>
              {details.attendance.length === 0 ? (
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
                      {details.attendance.map((a) => (
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
              <h2 className="mt-8 font-display text-lg font-semibold text-ink">Grades</h2>
              {details.grades.length === 0 ? (
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
                      {details.grades.map((g, i) => (
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
        </>
      )}
    </div>
  );
}
