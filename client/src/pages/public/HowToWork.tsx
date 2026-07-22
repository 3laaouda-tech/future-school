import { useState } from "react";

type RoleKey = "admin" | "teacher" | "student" | "parent";

const roleTabs: { key: RoleKey; label: string; icon: string }[] = [
  { key: "admin", label: "Admin", icon: "🛠️" },
  { key: "teacher", label: "Teacher", icon: "🧑‍🏫" },
  { key: "student", label: "Student", icon: "🎒" },
  { key: "parent", label: "Parent", icon: "👨‍👩‍👧" },
];

const steps: Record<RoleKey, string[]> = {
  admin: [
    "Log in with your admin account.",
    'Go to "Academic years" and add the current school year.',
    'Use "+ Add user" to create accounts for teachers, students, and parents.',
    'Go to "Classes" and "Subjects" to set up what your school offers.',
    'Open "Assign teachers" and pick a teacher for each subject in each class.',
    'Open "Timetable" to schedule each subject into a day and period for a class — the system blocks any slot that would double-book a class or a teacher.',
    'Open "Enroll students" to place each student into their class for the year.',
    'Open "Link parents" to connect each parent to their child.',
    'Search, filter by role, sort columns, or select multiple rows to delete in bulk from any list.',
  ],
  teacher: [
    "Log in with your teacher account.",
    'Your dashboard shows "My classes" — the classes and subjects assigned to you.',
    'Click "My timetable" to see your full weekly schedule at a glance.',
    'On a class card, click "Take attendance" to mark each student present, absent, late, or excused for a chosen date.',
    'Click "Enter grades" to record a score for a student, choosing the term and assessment type.',
  ],
  student: [
    "Log in with your student account.",
    "Your dashboard shows your class, and the subjects and teachers you have.",
    'Scroll down to "My timetable" to see your weekly schedule.',
    'Scroll down to "My attendance" to see your attendance history.',
    'Scroll down to "My grades" to see the scores you\'ve been given.',
  ],
  parent: [
    "Log in with your parent account.",
    "If you have more than one child linked to your account, pick their name from the tabs at the top.",
    "See that child's class, subjects, and weekly timetable.",
    "Scroll down to see their attendance and grades.",
  ],
};

const everyoneSteps = [
  'Click your name in the top bar to open "My Profile" and update your name, email, or password.',
  "Click the sun/moon icon to switch between light and dark mode — your choice is remembered next time you visit.",
];

export default function HowToWork() {
  const [active, setActive] = useState<RoleKey>("admin");
  const activeSteps = steps[active];

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-center">
        <p className="font-body text-sm font-bold uppercase tracking-wide text-coral">
          How to work
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink">
          A step-by-step guide for every role
        </h1>
        <p className="mt-4 font-body text-ink/70">
          Pick your role below to see exactly what to do first.
        </p>
      </div>

      {/* Role tabs */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {roleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`rounded-full px-5 py-2 font-body text-sm font-bold transition-transform hover:scale-105 ${
              active === tab.key ? "bg-marigold text-ink" : "bg-white text-ink/60"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Step list */}
      <ol className="mt-10 space-y-4">
        {activeSteps.map((step, i) => (
          <li key={i} className="flex gap-4 rounded-3xl bg-white p-5 shadow-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sun-cream font-display font-semibold text-ink">
              {i + 1}
            </span>
            <p className="font-body text-ink/80">{step}</p>
          </li>
        ))}
      </ol>

      {/* Steps that apply to every role */}
      <h2 className="mt-12 text-center font-display text-lg font-semibold text-ink">
        For everyone, regardless of role
      </h2>
      <ul className="mt-4 space-y-3">
        {everyoneSteps.map((step) => (
          <li key={step} className="flex gap-3 rounded-3xl bg-white p-4 shadow-sm">
            <span className="text-leaf">✓</span>
            <p className="font-body text-sm text-ink/80">{step}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
