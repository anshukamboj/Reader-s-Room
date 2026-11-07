import { useNavigate, Link } from "react-router-dom";
import {
  BookOpen, Library, Users, BookMarked, Heart, Target, Eye,
  ShieldCheck, Sparkles, ArrowRight, Mail, MapPin, Clock,
} from "lucide-react";

const stats = [
  { value: "10,000+", label: "Books in the library" },
  { value: "2,500+", label: "Active members" },
  { value: "15+", label: "Categories" },
  { value: "2", label: "Languages" },
];

const values = [
  { icon: Heart, title: "Love of reading", text: "We believe a good book can change a day, or a life. Everything we build starts from that." },
  { icon: Users, title: "Open to everyone", text: "Anyone can explore the library. Members and librarians each get the tools they need." },
  { icon: ShieldCheck, title: "Simple and fair", text: "Clear borrowing rules, honest availability and no hidden steps between you and your book." },
  { icon: Sparkles, title: "Always improving", text: "We listen to our readers and keep adding small things that make the library easier to use." },
];

const team = [
  { name: "Same Bothor", role: "Head Librarian", color: "from-amber-300 to-emerald-700" },
  { name: "Asther Beyar", role: "Collections Manager", color: "from-emerald-300 to-teal-700" },
  { name: "Eodle Gonon", role: "Member Support", color: "from-lime-300 to-green-700" },
];

export default function About() {
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
      {/* header (same look as the other pages) */}
      <header className="h-16 border-b border-white/10 bg-[#0f1a15]/80 backdrop-blur flex items-center gap-5 px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2 text-[#eef3ee]">
          <BookOpen size={24} className="text-[#38D982]" />
          <span className="font-serif text-lg font-medium">Reader's Room</span>
        </Link>
        <nav className="ml-auto hidden md:flex h-full gap-6">
          {links.map(([name, path]) => (
            <button key={name} onClick={() => navigate(path)}
              className={`text-sm h-full border-b-2 ${name === "About" ? "border-[#38D982] text-[#eef3ee]" : "border-transparent text-[#eef3ee]/70 hover:text-[#eef3ee]"}`}>
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
          <p className="text-sm tracking-widest text-[#38D982] mb-3">ABOUT US</p>
          <h1 className="font-serif text-4xl sm:text-5xl">A quiet place for people who love books</h1>
          <p className="text-base text-[#7D867E] mt-4">
            Reader's Room is a community library that brings its whole collection online, so finding, borrowing and
            reserving a book feels as calm as walking between the shelves.
          </p>
        </section>

        {/* stats */}
        <section className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-md border border-[#2C3C32] bg-[#1B2821] p-5 text-center">
              <p className="font-serif text-3xl text-[#38D982]">{s.value}</p>
              <p className="text-sm text-[#A6ADA5] mt-1">{s.label}</p>
            </div>
          ))}
        </section>

        {/* story */}
        <section className="max-w-6xl mx-auto mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-serif text-3xl">Our story</h2>
            <p className="mt-4 text-sm leading-7 text-[#A6ADA5]">
              Reader's Room started with a small shelf of donated books and a simple idea: a library should be easy
              for everyone. Over time the shelf grew into a full collection, and the paper cards and long queues
              were replaced by a simple website.
            </p>
            <p className="mt-3 text-sm leading-7 text-[#A6ADA5]">
              Today members can search the catalogue, see which shelf a book sits on, borrow it, or reserve it
              when it is out. Librarians manage copies and requests from one clean panel, so more time goes to
              readers and less to paperwork.
            </p>
          </div>

          {/* decorative book stack */}
          <div className="flex justify-center gap-3">
            {[
              ["from-emerald-900 to-green-600", "NATURE"],
              ["from-amber-800 to-yellow-600", "HISTORY"],
              ["from-indigo-950 to-blue-600", "SCIENCE"],
            ].map(([c, t], i) => (
              <div key={t}
                className={`bg-gradient-to-b ${c} w-[100px] sm:w-[120px] h-[160px] sm:h-[190px] rounded-sm shadow-xl flex items-center justify-center ${i === 1 ? "-translate-y-4" : ""}`}>
                <span className="font-serif text-sm font-bold tracking-wider text-white/90">{t}</span>
              </div>
            ))}
          </div>
        </section>

        {/* mission + vision */}
        <section className="max-w-6xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: Target, title: "Our mission", text: "To make every book in our library easy to find, easy to borrow and easy to enjoy for every reader in our community." },
            { icon: Eye, title: "Our vision", text: "A reading community where nobody is stopped from a good book by cost, distance or a complicated system." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-md border border-[#2C3C32] bg-[#1B2821] p-6 hover:border-[#38D982] transition">
              <span className="w-11 h-11 rounded-lg bg-[#38D982]/10 border border-[#38D982]/30 flex items-center justify-center">
                <Icon size={22} className="text-[#38D982]" />
              </span>
              <h3 className="mt-4 text-lg font-medium">{title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-[#A6ADA5]">{text}</p>
            </div>
          ))}
        </section>

        {/* values */}
        <section className="max-w-6xl mx-auto mt-20">
          <h2 className="font-serif text-3xl text-center">What we value</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-md border border-[#2C3C32] bg-[#111814] p-5">
                <Icon size={22} className="text-[#38D982]" />
                <h3 className="mt-3 text-base font-medium">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#A6ADA5]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* team */}
        <section className="max-w-4xl mx-auto mt-20">
          <h2 className="font-serif text-3xl text-center">Meet the team</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {team.map((p) => (
              <div key={p.name} className="rounded-md border border-[#2C3C32] bg-[#1B2821] p-6 text-center">
                <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${p.color}`} />
                <h3 className="mt-4 text-base font-medium">{p.name}</h3>
                <p className="text-sm text-[#A6ADA5]">{p.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* contact */}
        <section className="max-w-4xl mx-auto mt-20 rounded-xl border border-[#2C3C32] bg-gradient-to-br from-[#1B2821] to-[#0f1713] p-8 sm:p-10">
          <h2 className="font-serif text-3xl text-center">Visit or contact us</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <MapPin size={22} className="mx-auto text-[#38D982]" />
              <p className="mt-2 text-sm text-[#F0F0E3]">Address</p>
              <p className="text-sm text-[#A6ADA5]">12 Library Street, Your City</p>
            </div>
            <div>
              <Clock size={22} className="mx-auto text-[#38D982]" />
              <p className="mt-2 text-sm text-[#F0F0E3]">Opening hours</p>
              <p className="text-sm text-[#A6ADA5]">Mon - Sat, 9:00 - 18:00</p>
            </div>
            <div>
              <Mail size={22} className="mx-auto text-[#38D982]" />
              <p className="mt-2 text-sm text-[#F0F0E3]">Email</p>
              <p className="text-sm text-[#A6ADA5]">hello@readersroom.com</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate("/Books")}
              className="h-11 px-6 rounded bg-[#38D982] text-[#0D1512] text-sm font-semibold hover:brightness-110 inline-flex items-center gap-2">
              Explore Books <ArrowRight size={16} />
            </button>
            {!loggedIn && (
              <button onClick={() => navigate("/signup")}
                className="h-11 px-6 rounded border border-[#F0F0E3]/70 text-sm hover:bg-[#1B2821]">
                Join the library
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