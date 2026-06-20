import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Brand } from "./Brand";
import { cx } from "./ui";
import { Grid, Search, Columns, UserIcon, Card as CardIcon, LogOut } from "./icons";

const NAV = [
  { to: "/app", label: "Dashboard", icon: Grid, end: true },
  { to: "/app/opportunities", label: "Opportunities", icon: Search, end: false },
  { to: "/app/pipeline", label: "Broadcast Log", icon: Columns, end: false },
  { to: "/app/profile", label: "Speaker Profile", icon: UserIcon, end: false },
  { to: "/app/billing", label: "Plan & Billing", icon: CardIcon, end: false },
];

function navClass({ isActive }: { isActive: boolean }) {
  return cx(
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition",
    isActive ? "bg-ink text-paper-2" : "text-ink-2 hover:bg-ink/[0.06] hover:text-ink",
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const initials = (user?.name || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex max-w-[1440px]">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r-[1.5px] rule bg-paper-2 px-4 py-5 md:flex">
          <NavLink to="/app">
            <Brand withTagline />
          </NavLink>

          <div className="mt-5 flex items-center justify-between rounded-md border-[1.5px] rule bg-paper px-3 py-2">
            <span className="lamp lamp-on">
              <span className="lamp-dot" /> On Air
            </span>
            <span className="label text-ink-3">DSA·FM</span>
          </div>

          <nav className="mt-6 flex flex-1 flex-col gap-1">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={navClass}>
                <n.icon className="h-[18px] w-[18px]" />
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 flex items-center gap-3 rounded-md border-[1.5px] rule bg-paper px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-[1.5px] border-ink bg-signal text-xs font-bold text-paper-2">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink">{user?.name}</div>
              <div className="truncate text-xs text-ink-3">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="rounded-md p-1.5 text-ink-3 transition hover:bg-ink/[0.06] hover:text-signal"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </aside>

        {/* Mobile */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b-[1.5px] rule bg-paper-2 px-4 py-3 md:hidden">
            <NavLink to="/app">
              <Brand />
            </NavLink>
            <div className="flex items-center gap-3">
              <span className="lamp lamp-on">
                <span className="lamp-dot" /> On Air
              </span>
              <button onClick={handleLogout} className="rounded-md p-2 text-ink-3 hover:text-signal">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </header>
          <nav className="flex gap-1 overflow-x-auto border-b-[1.5px] rule bg-paper-2 px-3 py-2 md:hidden">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cx(
                    "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold",
                    isActive ? "bg-ink text-paper-2" : "text-ink-2",
                  )
                }
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </NavLink>
            ))}
          </nav>

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
