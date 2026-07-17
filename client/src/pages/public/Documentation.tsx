const techStack = [
  { label: "Frontend", value: "React, Vite, TypeScript, Tailwind CSS" },
  { label: "Backend", value: "Node.js, Express, TypeScript" },
  { label: "Database", value: "PostgreSQL" },
  { label: "Authentication", value: "JWT tokens with hashed passwords" },
];

const roles = [
  {
    icon: "🛠️",
    title: "Admin",
    points: [
      "Add, edit, and remove user accounts",
      "Manage academic years, classes, and subjects",
      "Assign teachers to classes and subjects",
      "Enroll students and link parents to their children",
    ],
  },
  {
    icon: "🧑‍🏫",
    title: "Teacher",
    points: [
      "See the classes and subjects assigned to them",
      "Take daily attendance for their classes",
      "Enter grades for assessments",
    ],
  },
  {
    icon: "🎒",
    title: "Student",
    points: [
      "View their class, subjects, and teachers",
      "Check their attendance history",
      "Check their grades",
    ],
  },
  {
    icon: "👨‍👩‍👧",
    title: "Parent",
    points: [
      "View a list of their linked children",
      "See each child's class, attendance, and grades",
    ],
  },
];

const dbHighlights = [
  "10 related tables covering users, classes, subjects, enrollment, attendance, and grades",
  'A fixed set of academic years (not free text), so every class always points to a real, valid year',
  "Deleting a class or subject also removes anything that depended on it (enrollments, attendance, grades) — the interface always warns before this happens",
  "Every account's role is set once at creation and can't drift, keeping each person's data consistent",
];

export default function Documentation() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-12 text-center">
        <p className="font-body text-sm font-bold uppercase tracking-wide text-coral">
          Documentation
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink">
          What Future School is, and how it's built
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-body text-ink/70">
          A school management system with a separate space for admins,
          teachers, students, and parents. Here's an overview of what it does
          and how it's put together.
        </p>
      </section>

      {/* Tech stack */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <h2 className="font-display text-2xl font-semibold text-ink">Built with</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {techStack.map((item) => (
            <div key={item.label} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="font-body text-sm font-bold text-ink/50">{item.label}</p>
              <p className="mt-1 font-body text-ink">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features by role */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="text-center font-display text-2xl font-semibold text-ink">
          What each role can do
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {roles.map((role) => (
            <div key={role.title} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sun-cream text-xl">
                  {role.icon}
                </span>
                <h3 className="font-display text-lg font-semibold text-ink">{role.title}</h3>
              </div>
              <ul className="mt-4 space-y-2">
                {role.points.map((point) => (
                  <li key={point} className="flex gap-2 font-body text-sm text-ink/70">
                    <span className="text-leaf">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Database highlights */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <h2 className="font-display text-2xl font-semibold text-ink">
          How the data is organized
        </h2>
        <div className="mt-4 rounded-3xl bg-white p-6 shadow-sm">
          <ul className="space-y-3">
            {dbHighlights.map((point) => (
              <li key={point} className="flex gap-3 font-body text-sm text-ink/70">
                <span className="text-marigold">●</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
