import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getClassStudentsRequest } from "../../api/attendanceApi";
import { getGradesRequest, submitGradeRequest } from "../../api/gradesApi";
import { ApiError } from "../../api/client";
import { terms, assessmentTypes } from "../../constants";
import type { StudentInClass } from "../../types/attendance";
import type { GradeView } from "../../types/grades";

export default function Grades() {
  const { classId, subjectId } = useParams<{ classId: string; subjectId: string }>();
  const { token } = useAuth();
  const { showToast } = useToast();
  const numericClassId = Number(classId);
  const numericSubjectId = Number(subjectId);

  const [students, setStudents] = useState<StudentInClass[]>([]);
  const [grades, setGrades] = useState<GradeView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [studentId, setStudentId] = useState("");
  const [term, setTerm] = useState<string>(terms[0]);
  const [assessmentType, setAssessmentType] = useState<string>(assessmentTypes[0]);
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadGrades(currentToken: string) {
    getGradesRequest(numericClassId, numericSubjectId, currentToken)
      .then((data) => setGrades(data.grades))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Something went wrong"));
  }

  useEffect(() => {
    if (!token || !numericClassId || !numericSubjectId) return;

    setIsLoading(true);
    Promise.all([
      getClassStudentsRequest(numericClassId, token),
      getGradesRequest(numericClassId, numericSubjectId, token),
    ])
      .then(([studentsData, gradesData]) => {
        setStudents(studentsData.students);
        setGrades(gradesData.grades);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Something went wrong"))
      .finally(() => setIsLoading(false));
  }, [token, numericClassId, numericSubjectId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!token) return;
    if (!studentId || !term || !assessmentType || !score) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitGradeRequest(
        numericClassId,
        numericSubjectId,
        {
          studentId: Number(studentId),
          term,
          assessmentType,
          score: Number(score),
          maxScore: Number(maxScore) || 100,
        },
        token
      );
      setStudentId("");
      setTerm(terms[0]);
      setAssessmentType(assessmentTypes[0]);
      setScore("");
      setMaxScore("100");
      loadGrades(token);
      showToast("Grade added.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link to="/teacher" className="font-body text-sm text-ink/60 hover:text-ink">
        ← Back to my classes
      </Link>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Enter grades</h1>

      {isLoading && <p className="mt-6 font-body text-ink/60">Loading...</p>}
      {error && <p className="mt-6 font-body text-coral">{error}</p>}

      {!isLoading && !error && (
        <>
          {students.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-white p-6 font-body text-ink/60">
              No students are enrolled in this class yet.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-4 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-3"
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
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="term" className="font-body text-sm font-semibold text-ink/70">
                  Term
                </label>
                <select
                  id="term"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
                >
                  {terms.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="assessmentType" className="font-body text-sm font-semibold text-ink/70">
                  Assessment type
                </label>
                <select
                  id="assessmentType"
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
                >
                  {assessmentTypes.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="score" className="font-body text-sm font-semibold text-ink/70">
                  Score
                </label>
                <input
                  id="score"
                  type="number"
                  step="0.01"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
                />
              </div>

              <div>
                <label htmlFor="maxScore" className="font-body text-sm font-semibold text-ink/70">
                  Out of
                </label>
                <input
                  id="maxScore"
                  type="number"
                  step="0.01"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="self-end rounded-full bg-marigold px-6 py-2 font-body font-bold text-ink transition-transform hover:scale-105 disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "+ Add grade"}
              </button>
            </form>
          )}

          <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
            {grades.length === 0 ? (
              <p className="p-6 font-body text-ink/60">No grades entered yet.</p>
            ) : (
              <table className="w-full text-left font-body">
                <thead className="bg-sun-cream text-sm text-ink/60">
                  <tr>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Term</th>
                    <th className="px-6 py-3">Assessment</th>
                    <th className="px-6 py-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g.id} className="border-t border-ink/5">
                      <td className="px-6 py-3 text-ink">{g.studentName}</td>
                      <td className="px-6 py-3 text-ink/70">{g.term}</td>
                      <td className="px-6 py-3 text-ink/70">{g.assessmentType}</td>
                      <td className="px-6 py-3 text-ink/70">
                        {g.score} / {g.maxScore}
                      </td>
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
