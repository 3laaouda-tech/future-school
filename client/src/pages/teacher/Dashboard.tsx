import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyClassesRequest } from "../../api/teacherApi";
import { ApiError } from "../../api/client";
import type { TeacherClass } from "../../types/teacher";

export default function TeacherDashboard() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    getMyClassesRequest(token)
      .then((data) => setClasses(data.classes))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Something went wrong"))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">My classes</h1>

      {isLoading && <p className="mt-6 font-body text-ink/60">Loading your classes...</p>}
      {error && <p className="mt-6 font-body text-coral">{error}</p>}

      {!isLoading && !error && classes.length === 0 && (
        <p className="mt-6 rounded-2xl bg-white p-6 font-body text-ink/60">
          You haven't been assigned to any classes yet. Ask an admin to assign you a subject.
        </p>
      )}

      {!isLoading && !error && classes.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {classes.map((cls) => (
            <div key={cls.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="font-display text-lg font-semibold text-ink">{cls.className}</p>
              <p className="mt-1 font-body text-sm text-ink/60">{cls.subjectName}</p>
              <Link
                to={`/teacher/classes/${cls.classId}/attendance`}
                className="mt-4 inline-block rounded-full bg-marigold px-4 py-2 font-body text-sm font-bold text-ink transition-transform hover:scale-105"
              >
                Take attendance
              </Link>
              <Link
                to={`/teacher/classes/${cls.classId}/subjects/${cls.subjectId}/grades`}
                className="mt-4 ml-2 inline-block rounded-full border-2 border-ink/10 bg-white px-4 py-2 font-body text-sm font-bold text-ink transition-transform hover:scale-105"
              >
                Enter grades
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
