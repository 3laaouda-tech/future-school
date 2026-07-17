import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface ActionCard {
  to: string;
  title: string;
  description: string;
  icon: string;
}

interface Section {
  title: string;
  actions: ActionCard[];
}

const sections: Section[] = [
  {
    title: "People",
    actions: [
      { to: "/admin/users/new", title: "Add user", description: "Create a teacher, student, or parent account", icon: "➕" },
      { to: "/admin/users", title: "All users", description: "View, edit, or remove accounts", icon: "👥" },
    ],
  },
  {
    title: "Academics",
    actions: [
      { to: "/admin/classes", title: "Classes", description: "Create and manage classes", icon: "🏫" },
      { to: "/admin/subjects", title: "Subjects", description: "Create and manage subjects", icon: "📚" },
      { to: "/admin/class-subjects", title: "Assign teachers", description: "Assign a teacher to a subject in a class", icon: "🧑‍🏫" },
    ],
  },
  {
    title: "Family",
    actions: [
      { to: "/admin/enrollments", title: "Enroll students", description: "Assign a student to a class", icon: "📝" },
      { to: "/admin/parent-students", title: "Link parents", description: "Connect a parent to their child", icon: "👨‍👩‍👧" },
    ],
  },
];

function Card({ to, title, description, icon }: ActionCard) {
  return (
    <Link
      to={to}
      className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sun-cream text-xl">
        {icon}
      </span>
      <span>
        <span className="block font-display text-base font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block font-body text-sm text-ink/60">{description}</span>
      </span>
    </Link>
  );
}

function SectionBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-8 first:mt-0">
      <h2 className="font-body text-sm font-bold uppercase tracking-wide text-ink/40">
        {title}
      </h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">Admin dashboard</h1>
      <p className="mt-1 font-body text-sm text-ink/60">
        Manage everything about your school from here.
      </p>

      {sections.map((section) => (
        <SectionBlock key={section.title} title={section.title}>
          {section.actions.map((action) => (
            <Card key={action.to} {...action} />
          ))}
        </SectionBlock>
      ))}
    </div>
  );
}
