import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getClassesRequest } from "../../api/classesApi";
import { getClassSubjectsRequest } from "../../api/classSubjectsApi";
import {
  getClassTimetableRequest,
  createTimetableEntryRequest,
  deleteTimetableEntryRequest,
} from "../../api/timetableApi";
import { ApiError } from "../../api/client";
import TimetableGrid from "../../components/TimetableGrid";
import { Skeleton } from "../../components/Skeleton";
import type { SchoolClass } from "../../types/classes";
import type { ClassSubjectView } from "../../types/classSubjects";
import type { TimetableEntryView } from "../../types/timetable";

export default function Timetable() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectView[]>([]);
  const [entries, setEntries] = useState<TimetableEntryView[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([getClassesRequest(token), getClassSubjectsRequest(token)])
      .then(([classesData, classSubjectsData]) => {
        setClasses(classesData.classes);
        setClassSubjects(classSubjectsData.classSubjects);
        if (classesData.classes.length > 0) {
          setSelectedClassId(String(classesData.classes[0].id));
        }
      })
      .catch((err) => showToast(err instanceof ApiError ? err.message : "Something went wrong", "error"))
      .finally(() => setIsLoadingClasses(false));
  }, [token]);

  function loadEntries(classId: number, currentToken: string) {
    setIsLoadingEntries(true);
    getClassTimetableRequest(classId, currentToken)
      .then((data) => setEntries(data.entries))
      .catch((err) => showToast(err instanceof ApiError ? err.message : "Something went wrong", "error"))
      .finally(() => setIsLoadingEntries(false));
  }

  useEffect(() => {
    if (token && selectedClassId) loadEntries(Number(selectedClassId), token);
  }, [token, selectedClassId]);

  const selectedClass = classes.find((c) => c.id === Number(selectedClassId));
  // subjects available for the selected class (matched by class name)
  const availableSubjects = classSubjects.filter((cs) => cs.className === selectedClass?.name);

  async function handleAssign(day: string, period: number, classSubjectId: string) {
    if (!token || !classSubjectId) return;
    const key = `${day}-${period}`;
    setBusyKey(key);
    try {
      await createTimetableEntryRequest(
        { classSubjectId: Number(classSubjectId), dayOfWeek: day, period },
        token
      );
      loadEntries(Number(selectedClassId), token);
      showToast("Timetable updated.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong", "error");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleRemove(entryId: number, day: string, period: number) {
    if (!token) return;
    const key = `${day}-${period}`;
    setBusyKey(key);
    try {
      await deleteTimetableEntryRequest(entryId, token);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      showToast("Slot cleared.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong", "error");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link to="/admin" className="font-body text-sm text-ink/60 hover:text-ink">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Timetable</h1>
      <p className="mt-1 font-body text-sm text-ink/60">
        Assign subjects to time slots for a class. Only subjects already assigned to teachers
        in this class (via "Assign teachers") can be scheduled.
      </p>

      {isLoadingClasses && <Skeleton className="mt-6 h-10 w-64" />}

      {!isLoadingClasses && classes.length === 0 && (
        <p className="mt-6 rounded-2xl bg-white p-4 font-body text-sm text-ink/60">
          You need at least one class before you can build a timetable.
        </p>
      )}

      {!isLoadingClasses && classes.length > 0 && (
        <>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="mt-6 w-full rounded-xl border border-ink/10 bg-white px-4 py-2 font-body md:w-64"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          {availableSubjects.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-white p-4 font-body text-sm text-ink/60">
              This class has no subjects assigned yet. Go to{" "}
              <Link to="/admin/class-subjects" className="font-bold text-sky-teal hover:underline">
                Assign teachers
              </Link>{" "}
              first.
            </p>
          ) : (
            <div className="mt-6">
              {isLoadingEntries ? (
                <Skeleton className="h-64 w-full rounded-3xl" />
              ) : (
                <TimetableGrid
                  renderCell={(day, period) => {
                    const entry = entries.find((e) => e.dayOfWeek === day && e.period === period);
                    const key = `${day}-${period}`;
                    const isBusy = busyKey === key;

                    if (entry) {
                      return (
                        <div className="rounded-xl bg-sun-cream p-2">
                          <p className="font-body text-xs font-bold text-ink">{entry.subjectName}</p>
                          <p className="font-body text-xs text-ink/60">{entry.teacherName}</p>
                          <button
                            onClick={() => handleRemove(entry.id, day, period)}
                            disabled={isBusy}
                            className="mt-1 font-body text-xs font-bold text-coral hover:underline disabled:opacity-60"
                          >
                            {isBusy ? "..." : "Remove"}
                          </button>
                        </div>
                      );
                    }

                    return (
                      <select
                        disabled={isBusy}
                        value=""
                        onChange={(e) => handleAssign(day, period, e.target.value)}
                        className="w-full rounded-xl border border-ink/10 bg-white px-2 py-1.5 font-body text-xs disabled:opacity-60"
                      >
                        <option value="">— empty —</option>
                        {availableSubjects.map((cs) => (
                          <option key={cs.id} value={cs.id}>
                            {cs.subjectName}
                          </option>
                        ))}
                      </select>
                    );
                  }}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
