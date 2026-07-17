import { Link } from "react-router-dom";
import Logo from "../Logo";

export default function Footer() {
  return (
    <footer className="bg-sky-teal font-body text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:justify-between">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-semibold">
            <Logo />
            Future School
          </p>
          <p className="mt-2 max-w-xs text-sm text-white/80">
            Growing curious minds, one school day at a time.
          </p>
        </div>

        <div>
          <p className="font-semibold">Pages</p>
          <ul className="mt-2 space-y-1 text-sm text-white/80">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/docs" className="hover:text-white">Docs</Link></li>
            <li><Link to="/how-to-work" className="hover:text-white">How to work</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-semibold">Contact</p>
          <ul className="mt-2 space-y-1 text-sm text-white/80">
            <li>hello@futureschool.edu</li>
            <li>+962 6 000 0000</li>
            <li>Amman, Jordan</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/20 py-4 text-center text-xs text-white/70">
        © {new Date().getFullYear()} Future School. All rights reserved.
      </div>
    </footer>
  );
}
