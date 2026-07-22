import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Logo from "../Logo";
import { useTheme } from "../../context/ThemeContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/docs", label: "Docs" },
  { to: "/how-to-work", label: "How to work" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-sun-cream/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          onClick={() => setIsMenuOpen(false)}
          className="flex items-center gap-2 font-display text-xl font-semibold text-ink"
        >
          <Logo />
          Future School
        </Link>

        {/* Desktop links */}
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
          className="hidden rounded-full bg-coral px-5 py-2 font-body text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 md:inline-block"
        >
          Log in
        </Link>

        <button
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="hidden h-10 w-10 items-center justify-center rounded-full bg-white/60 text-ink md:flex"
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        {/* Mobile hamburger toggle */}
        <button
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-ink md:hidden"
        >
          {isMenuOpen ? (
            <span className="text-xl leading-none">✕</span>
          ) : (
            <span className="text-xl leading-none">☰</span>
          )}
        </button>
      </nav>

      {/* Mobile menu panel */}
      {isMenuOpen && (
        <div className="border-t border-ink/10 bg-sun-cream px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-2 font-body text-sm font-semibold transition-colors ${
                    isActive ? "bg-marigold text-ink" : "text-ink/70 hover:bg-white/60"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={toggleTheme}
              className="mt-1 flex items-center gap-2 rounded-xl px-4 py-2 text-left font-body text-sm font-semibold text-ink/70 hover:bg-white/60"
            >
              {isDark ? "☀️ Light mode" : "🌙 Dark mode"}
            </button>
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="mt-2 rounded-xl bg-coral px-4 py-2 text-center font-body text-sm font-bold text-white"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
