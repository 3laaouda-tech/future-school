import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAdminStatsRequest } from "../../api/adminStatsApi";
import { Skeleton } from "../../components/Skeleton";
import type { AdminStats } from "../../types/adminStats";

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
      { to: "/admin/academic-years", title: "Academic years", description: "Manage academic years", icon: "📅" },
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-white p-5 text-center shadow-sm">
      <p className="font-display text-3xl font-semibold text-sky-teal">{value}</p>
      <p className="mt-1 font-body text-xs font-semibold uppercase tracking-wide text-ink/50">
        {label}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!token) return;
    getAdminStatsRequest(token)
      .then((data) => setStats(data.stats))
      .catch(() => {
        // stats are a nice-to-have on this page; fail quietly rather
        // than blocking the whole dashboard if this call fails
      })
      .finally(() => setIsLoadingStats(false));
  }, [token]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">Admin dashboard</h1>
      <p className="mt-1 font-body text-sm text-ink/60">
        Manage everything about your school from here.
      </p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {isLoadingStats &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl bg-white p-5 shadow-sm">
              <Skeleton className="mx-auto h-8 w-10" />
              <Skeleton className="mx-auto mt-2 h-3 w-16" />
            </div>
          ))}
        {!isLoadingStats && stats && (
          <>
            <StatCard label="Students" value={stats.studentCount} />
            <StatCard label="Teachers" value={stats.teacherCount} />
            <StatCard label="Parents" value={stats.parentCount} />
            <StatCard label="Classes" value={stats.classCount} />
            <StatCard label="Subjects" value={stats.subjectCount} />
            <StatCard label="Enrollments" value={stats.enrollmentCount} />
          </>
        )}
      </div>

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
