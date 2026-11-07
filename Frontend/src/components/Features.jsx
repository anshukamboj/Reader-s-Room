import { useNavigate, Link } from "react-router-dom";
import {
  BookOpen, Search, BookMarked, CalendarClock, Heart, Star,
  Bell, LayoutDashboard, MapPin, Sparkles, UserPlus, ArrowRight,
} from "lucide-react";

const features = [
  { icon: Search, title: "Smart Search & Filters", text: "Find any book by title, ISBN or category. Filter by author, language, year, availability and rating." },
  { icon: BookMarked, title: "Borrow & Reserve", text: "Borrow available books in one click, or reserve a copy that is checked out and get it when it returns." },
  { icon: MapPin, title: "Shelf Location", text: "Every book shows its shelf number, so you can walk in and pick it up without asking around." },
  { icon: Heart, title: "Favourites List", text: "Save the books you love and come back to them any time from your own list." },
  { icon: Star, title: "Ratings & Reviews", text: "See what other readers think before you borrow, and rate the books you finish." },
  { icon: CalendarClock, title: "Due Date Tracking", text: "Always know when a book is due, and renew it before it becomes late." },
  { icon: Bell, title: "Notifications", text: "Get a message when a reserved book is ready or when a due date is near." },
  { icon: Sparkles, title: "Related Books", text: "Every book page suggests similar titles, so your next read is never far away." },
  { icon: LayoutDashboard, title: "Librarian Dashboard", text: "Librarians manage books, copies, members and borrow requests from one simple panel." },
];

const steps = [
  { icon: UserPlus, title: "Create an account", text: "Sign up for free as a member in less than a minute." },
  { icon: Search, title: "Find your book", text: "Search or browse the library and check if it is available." },
  { icon: BookOpen, title: "Borrow or reserve", text: "Take it home now, or reserve it and we will let you know." },
];

export default function Features() {
  const navigate = useNavigate();
  const loggedIn = !!localStorage.getItem("rr_token");

  const links = [
    ["Home", "/"],
    ["Explore Books", "/Books"],
    ["Features", "/features"],
    ["About", "/about"],
  ];

  return (
    <div className="min-h-screen bg-[#0D1512] text-[#F0F0E3]">
      {/* header (same look as the Explore page) */}
      <header className="h-16 border-b border-white/10 bg-[#0f1a15]/80 backdrop-blur flex items-center gap-5 px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2 text-[#eef3ee]">
          <BookOpen size={24} className="text-[#38D982]" />
          <span className="font-serif text-lg font-medium">Reader's Room</span>
        </Link>
        <nav className="ml-auto hidden md:flex h-full gap-6">
          {links.map(([name, path]) => (
            <button key={name} onClick={() => navigate(path)}
              className={`text-sm h-full border-b-2 ${name === "Features" ? "border-[#38D982] text-[#eef3ee]" : "border-transparent text-[#eef3ee]/70 hover:text-[#eef3ee]"}`}>
              {name}
            </button>
          ))}
        </nav>
        {!loggedIn && (
          <div className="ml-auto md:ml-0 flex items-center gap-4">
            <button onClick={() => navigate("/login")} className="text-sm text-[#eef3ee] hover:text-[#38D982]">Log in</button>
            <button onClick={() => navigate("/signup")}
              className="text-sm h-9 px-4 rounded bg-[#38D982] text-[#0D1512] font-semibold hover:brightness-110">Sign up</button>
          </div>
        )}
      </header>

      <main className="bg-[#101814] px-4 sm:px-8 pb-20">
        {/* hero */}
        <section className="pt-14 pb-10 text-center max-w-3xl mx-auto">
          <p className="text-sm tracking-widest text-[#38D982] mb-3">FEATURES</p>
          <h1 className="font-serif text-4xl sm:text-5xl">Everything you need to enjoy your library</h1>
          <p className="text-base text-[#7D867E] mt-4">
            Reader's Room makes it easy to find, borrow and keep track of books, for members and librarians alike.
          </p>
        </section>

        {/* feature cards */}
        <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title}
              className="rounded-md border border-[#2C3C32] bg-[#1B2821] p-5 hover:border-[#38D982] transition">
              <span className="w-11 h-11 rounded-lg bg-[#38D982]/10 border border-[#38D982]/30 flex items-center justify-center">
                <Icon size={22} className="text-[#38D982]" />
              </span>
              <h3 className="mt-4 text-lg font-medium text-[#F0F0E3]">{title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-[#A6ADA5]">{text}</p>
            </div>
          ))}
        </section>

        {/* how it works */}
        <section className="max-w-6xl mx-auto mt-20">
          <h2 className="font-serif text-3xl text-center">How it works</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="rounded-md border border-[#2C3C32] bg-[#111814] p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-[#38D982] text-[#0D1512] flex items-center justify-center">
                  <Icon size={22} />
                </div>
                <p className="mt-4 text-xs text-[#7D867E]">STEP {i + 1}</p>
                <h3 className="text-lg font-medium mt-1">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#A6ADA5]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* call to action */}
        <section className="max-w-4xl mx-auto mt-20 rounded-xl border border-[#2C3C32] bg-gradient-to-br from-[#1B2821] to-[#0f1713] p-8 sm:p-12 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl">Ready to find your next book?</h2>
          <p className="text-base text-[#A6ADA5] mt-3">Browse the whole library now. No account needed to explore.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate("/Books")}
              className="h-11 px-6 rounded bg-[#38D982] text-[#0D1512] text-sm font-semibold hover:brightness-110 inline-flex items-center gap-2">
              Explore Books <ArrowRight size={16} />
            </button>
            {!loggedIn && (
              <button onClick={() => navigate("/signup")}
                className="h-11 px-6 rounded border border-[#F0F0E3]/70 text-sm hover:bg-[#1B2821]">
                Create an account
              </button>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-sm text-[#7D867E]">
        © {new Date().getFullYear()} Reader's Room. All rights reserved.
      </footer>
    </div>
  );
}