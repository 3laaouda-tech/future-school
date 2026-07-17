import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getClassStudentsRequest,
  getAttendanceRequest,
  submitAttendanceRequest,
} from "../../api/attendanceApi";
import { ApiError } from "../../api/client";
import type { StudentInClass, AttendanceStatus } from "../../types/attendance";

const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "excused", label: "Excused" },
];

const statusColor: Record<AttendanceStatus, string> = {
  present: "bg-leaf/20 text-leaf",
  absent: "bg-coral/20 text-coral",
  late: "bg-marigold/20 text-ink",
  excused: "bg-sky-teal/20 text-sky-teal",
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export default function Attendance() {
  const { classId } = useParams<{ classId: string }>();
  const { token } = useAuth();
  const numericClassId = Number(classId);

  const [date, setDate] = useState(todayIso());
  const [students, setStudents] = useState<StudentInClass[]>([]);
  const [statuses, setStatuses] = useState<Record<number, AttendanceStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Load the class roster once
  useEffect(() => {
    if (!token || !numericClassId) return;
    getClassStudentsRequest(numericClassId, token)
      .then((data) => setStudents(data.students))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Something went wrong"));
  }, [token, numericClassId]);

  // Load existing attendance whenever the date changes, defaulting
  // anyone without a saved record to "present"
  useEffect(() => {
    if (!token || !numericClassId || students.length === 0) return;

    setIsLoading(true);
    setSavedMessage(null);
    getAttendanceRequest(numericClassId, date, token)
      .then((data) => {
        const existing: Record<number, AttendanceStatus> = {};
        for (const record of data.records) {
          existing[record.studentId] = record.status;
        }
        const merged: Record<number, AttendanceStatus> = {};
        for (const student of students) {
          merged[student.id] = existing[student.id] ?? "present";
        }
        setStatuses(merged);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Something went wrong"))
      .finally(() => setIsLoading(false));
  }, [token, numericClassId, date, students]);

  async function handleSave() {
    if (!token) return;
    setIsSaving(true);
    setSavedMessage(null);
    setError(null);

    try {
      const records = students.map((s) => ({ studentId: s.id, status: statuses[s.id] }));
      await submitAttendanceRequest(numericClassId, date, records, token);
      setSavedMessage("Attendance saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link to="/teacher" className="font-body text-sm text-ink/60 hover:text-ink">
        ← Back to my classes
      </Link>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Take attendance</h1>

      <div className="mt-4">
        <label htmlFor="date" className="font-body text-sm font-semibold text-ink/70">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block rounded-xl border border-ink/10 bg-white px-4 py-2 font-body"
        />
      </div>

      {isLoading && <p className="mt-6 font-body text-ink/60">Loading...</p>}
      {error && <p className="mt-6 font-body text-coral">{error}</p>}

      {!isLoading && !error && students.length === 0 && (
        <p className="mt-6 rounded-2xl bg-white p-6 font-body text-ink/60">
          No students are enrolled in this class yet.
        </p>
      )}

      {!isLoading && !error && students.length > 0 && (
        <>
          <div className="mt-6 divide-y divide-ink/5 overflow-hidden rounded-3xl bg-white shadow-sm">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between px-6 py-4">
                <p className="font-body text-ink">{student.fullName}</p>
                <div className="flex gap-1">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setStatuses((prev) => ({ ...prev, [student.id]: option.value }))
                      }
                      className={`rounded-full px-3 py-1 font-body text-xs font-bold transition-transform hover:scale-105 ${
                        statuses[student.id] === option.value
                          ? statusColor[option.value]
                          : "bg-sun-cream text-ink/40"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-marigold px-6 py-3 font-body font-bold text-ink transition-transform hover:scale-105 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save attendance"}
            </button>
            {savedMessage && (
              <p className="font-body text-sm font-semibold text-leaf">{savedMessage}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
