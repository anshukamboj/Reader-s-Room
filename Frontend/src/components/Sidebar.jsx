import { NavLink } from "react-router-dom";
import {
  BookOpen,
  Home,
  LayoutGrid,
  Library,
  CalendarDays,
  History,
  Heart,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Overview", icon: Home, to: "/dashboard/overview" },
  { label: "Browse Books", icon: LayoutGrid, to: "/dashboard/browse-books" },
  { label: "My Library", icon: Library, to: "/dashboard/my-library" },
  { label: "Reservations", icon: CalendarDays, to: "/dashboard/reservations" },
  { label: "Reading History", icon: History, to: "/dashboard/reading-history" },
  { label: "Wishlist", icon: Heart, to: "/dashboard/wishlist" },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] transition ${
    isActive ? "bg-[#2f7d4f] text-white" : "text-[#b9c8be] hover:bg-[#1a2a22]"
  }`;

export default function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full w-full flex-col border-r border-[#26382f] bg-[#101b16] px-2.5 py-5">
      <div className="mb-6 flex items-center gap-2 px-2">
        <BookOpen className="h-7 w-7 text-[#3fbf6f]" />
        <span className="text-[20px] font-medium text-white">Reader's Room</span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink key={to} to={to} onClick={onNavigate} className={linkClass}>
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/dashboard/settings"
        onClick={onNavigate}
        className={(s) => `${linkClass(s)} mt-auto`}
      >
        <Settings className="h-[18px] w-[18px]" />
        Settings
      </NavLink>
    </div>
  );
}