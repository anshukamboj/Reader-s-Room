import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Explore Books", to: "/Books" },
  { label: "About", href: "#about" }, // stays an anchor on the Home page
];

export default function Navbar({ isDark, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // the active link now comes from the current URL
  const isActive = (l) => (l.to ? pathname === l.to : false);

  return (
    <nav className="relative flex items-center justify-between gap-4 px-4 py-6" aria-label="Main">
      <Link to="/" className="flex items-center gap-3 font-serif text-[32px] font-semibold">
        <svg viewBox="0 0 32 32" fill="none" className="h-10 w-10 flex-none" aria-hidden="true">
          <rect x="3" y="6" width="26" height="22" rx="3" fill="#2f6b4a" />
          <path
            d="M16 9v17M6 10c5 0 8 1.5 10 4 2-2.5 5-4 10-4v14c-5 0-8 1.5-10 4-2-2.5-5-4-10-4z"
            stroke="#eaf5ec"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        Reader's Room
      </Link>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <ul
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 right-0 top-24 z-10 flex-col rounded-xl border border-[#2a3d33] bg-[#17241d] p-2 md:static md:flex md:flex-row md:gap-2 md:border-0 md:bg-transparent md:p-0`}
        >
          {LINKS.map((l) => {
            const cls = `block border-b-2 px-5 py-3 text-[20px] transition-colors hover:text-[#eef3ee] ${
              isActive(l) ? "border-[#3b8259] text-[#eef3ee]" : "border-transparent text-[#a9b9ae]"
            }`;
            return (
              <li key={l.label}>
                {l.to ? (
                  <Link to={l.to} onClick={() => setMenuOpen(false)} className={cls}>
                    {l.label}
                  </Link>
                ) : (
                  <a href={l.href} onClick={() => setMenuOpen(false)} className={cls}>
                    {l.label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>

     <Link to="/login" className="hidden px-4 py-3 text-[20px] font-semibold hover:text-white md:block">
  Login
</Link>

        <button
          type="button"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={onToggleTheme}
          className="grid h-12 w-12 place-items-center rounded-lg hover:bg-white/10"
        >
          {isDark ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-7 w-7" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="grid h-12 w-12 place-items-center rounded-lg hover:bg-white/10 md:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-7 w-7" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
}