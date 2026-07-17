import { Link, NavLink } from "react-router-dom";
import Logo from "../Logo";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/docs", label: "Docs" },
  { to: "/how-to-work", label: "How to work" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-sun-cream/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
          <Logo />
          Future School
        </Link>

        <div className="hidden gap-2 rounded-full bg-white/60 p-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 font-body text-sm font-semibold transition-colors ${
                  isActive ? "bg-marigold text-ink" : "text-ink/70 hover:text-ink"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <Link
          to="/login"
          className="rounded-full bg-coral px-5 py-2 font-body text-sm font-bold text-white shadow-sm transition-transform hover:scale-105"
        >
          Log in
        </Link>
      </nav>
    </header>
  );
}
