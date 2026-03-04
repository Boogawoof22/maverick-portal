"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/videos", label: "Videos", icon: "🎬" },
  { href: "/playbook", label: "Playbook", icon: "📋" },
  { href: "/quizzes", label: "Quizzes", icon: "📝" },
  { href: "/flashcards", label: "Flashcards", icon: "🃏" },
  { href: "/drills", label: "Drills", icon: "🏋️" },
  { href: "/assignments", label: "Assignments", icon: "✅" },
  { href: "/messages", label: "Messages", icon: "💬" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-bg-sidebar border-r border-border min-h-screen fixed left-0 top-0">
        <div className="p-5 border-b border-border">
          <h1 className="text-xl font-bold">
            <span className="text-mav-gold">MAVERICK</span>{" "}
            <span className="text-mav-green-light">FOOTBALL</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">Team Portal</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-mav-green text-white"
                  : "text-text-muted hover:bg-bg-card hover:text-text"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-mav-green flex items-center justify-center text-white text-sm font-bold">
              {session?.user?.name?.[0] || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name}</p>
              <p className="text-xs text-text-muted capitalize">{(session?.user as any)?.role}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-xs text-text-muted hover:text-red-400 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-sidebar border-t border-border z-50 flex justify-around py-2">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${
              pathname.startsWith(item.href) ? "text-mav-gold" : "text-text-muted"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        <Link
          href="/messages"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${
            pathname.startsWith("/messages") ? "text-mav-gold" : "text-text-muted"
          }`}
        >
          <span className="text-lg">💬</span>
          <span>More</span>
        </Link>
      </nav>
    </>
  );
}
