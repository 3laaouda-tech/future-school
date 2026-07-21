import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../types/auth";
import Logo from "../Logo";

const roleBadgeColor: Record<UserRole, string> = {
  admin: "bg-coral/20 text-coral",
  teacher: "bg-sky-teal/20 text-sky-teal",
  student: "bg-marigold/20 text-ink",
  parent: "bg-leaf/20 text-leaf",
};

// Wraps every authenticated dashboard (Admin/Teacher/Student/Parent) with
// a shared navbar: brand, current user info, and a working logout button.
export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-sun-cream">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Logo />
            Future School
          </span>

          {user && (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="text-right transition-opacity hover:opacity-70">
                <p className="font-body text-sm font-semibold text-ink">{user.fullName}</p>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold capitalize ${roleBadgeColor[user.role]}`}
                >
                  {user.role}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border-2 border-ink/10 px-4 py-2 font-body text-sm font-bold text-ink transition-transform hover:scale-105"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink/10 py-4 text-center font-body text-xs text-ink/40">
        © {new Date().getFullYear()} Future School
      </footer>
    </div>
  );
}
