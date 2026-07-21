import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyTeacherTimetableRequest } from "../../api/teacherApi";
import { ApiError } from "../../api/client";
import TimetableGrid from "../../components/TimetableGrid";
import { Skeleton } from "../../components/Skeleton";
import type { TimetableEntryView } from "../../types/timetable";

export default function TeacherTimetable() {
  const { token } = useAuth();
  const [entries, setEntries] = useState<TimetableEntryView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getMyTeacherTimetableRequest(token)
      .then((data) => setEntries(data.entries))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Something went wrong"))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link to="/teacher" className="font-body text-sm text-ink/60 hover:text-ink">
        ← Back to my classes
      </Link>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">My timetable</h1>

      {isLoading && <Skeleton className="mt-6 h-64 w-full rounded-3xl" />}
      {error && <p className="mt-6 font-body text-coral">{error}</p>}

      {!isLoading && !error && entries.length === 0 && (
        <p className="mt-6 rounded-2xl bg-white p-6 font-body text-ink/60">
          You don't have any scheduled classes yet.
        </p>
      )}

      {!isLoading && !error && entries.length > 0 && (
        <div className="mt-6">
          <TimetableGrid
            renderCell={(day, period) => {
              const entry = entries.find((e) => e.dayOfWeek === day && e.period === period);
              if (!entry) return null;
              return (
                <div className="rounded-xl bg-sun-cream p-2">
                  <p className="font-body text-xs font-bold text-ink">{entry.subjectName}</p>
                  <p className="font-body text-xs text-ink/60">{entry.className}</p>
                </div>
              );
            }}
          />
        </div>
      )}
    </div>
  );
}
