"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, LayoutGrid, Heart } from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/chat",     label: "AI Chat",       icon: MessageCircle },
  { href: "/medicine", label: "Medicine Hub",  icon: LayoutGrid },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-white border-r border-slate-200 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
        <div className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-xl">
          <Heart className="w-5 h-5 text-white" fill="currentColor" />
        </div>
        <div>
          <p className="text-base font-bold text-slate-800 leading-none">CuraSense</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Medicine Intelligence</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <Icon
                className={clsx("w-4.5 h-4.5 flex-shrink-0", active ? "text-blue-600" : "text-slate-400")}
                size={18}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 leading-snug">
          Always consult a qualified healthcare professional before taking any medication.
        </p>
      </div>
    </aside>
  );
}
