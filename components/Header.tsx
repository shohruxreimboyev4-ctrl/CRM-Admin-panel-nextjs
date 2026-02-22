"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Shield,
  GraduationCap,
  UserSquare2,
  Layers,
  BookOpen,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";

export type UserType = {
  first_name?: string;
  fullName?: string;
  role?: string;
  image?: string | null;
};

type HeaderProps = {
  isOpen: boolean;
  user?: UserType | null;
};

const navMain = [
  { href: "/", label: "Asosiy", icon: Home },
  { href: "/menagers", label: "Menajerlar", icon: Users },
  { href: "/admins", label: "Adminlar", icon: Shield },
  { href: "/teachers", label: "Ustozlar", icon: GraduationCap },
  { href: "/students", label: "Studentlar", icon: UserSquare2 },
  { href: "/groups", label: "Guruhlar", icon: Layers },
  { href: "/courses", label: "Kurslar", icon: BookOpen },
  { href: "/payment", label: "To'lovlar", icon: CreditCard },
];

const navOther = [{ href: "/settings", label: "Sozlamalar", icon: Settings }];

export default function Header({ isOpen }: HeaderProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      className={[
        "sticky top-0 h-screen shrink-0 border-r border-slate-200/60 dark:border-slate-800/60",
        "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-500 ease-in-out z-50",
        isOpen ? "w-[280px]" : "w-[90px]",
      ].join(" ")}
    >
      <div className="px-6 py-8 flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div
          className={[
            "font-black tracking-tighter text-xl bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent italic uppercase transition-all duration-500",
            isOpen
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4 w-0 overflow-hidden",
          ].join(" ")}
        >
          Admin CRM
        </div>
      </div>

      <div className="px-4 flex flex-col h-[calc(100vh-100px)] justify-between pb-6">
        <div>
          <div
            className={[
              "px-4 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 transition-all",
              isOpen ? "opacity-100" : "opacity-0 h-0 overflow-hidden",
            ].join(" ")}
          >
            Asosiy Menyu
          </div>

          <nav className="space-y-1.5">
            {navMain.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!isOpen ? item.label : undefined}
                  className={[
                    "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-300",
                    active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900",
                    !isOpen ? "justify-center px-0 mx-2" : "",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                      active
                        ? "text-white"
                        : "opacity-70 group-hover:opacity-100",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "whitespace-nowrap transition-all duration-500",
                      isOpen
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-2 w-0 overflow-hidden",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                  {active && !isOpen && (
                    <div className="absolute right-[-4px] h-2 w-2 rounded-full bg-indigo-600 shadow-[0_0_10px_#4f46e5]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div
            className={[
              "px-4 mt-8 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 transition-all",
              isOpen ? "opacity-100" : "opacity-0 h-0 overflow-hidden",
            ].join(" ")}
          >
            Tizim
          </div>

          <nav className="space-y-1.5">
            {navOther.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-300",
                    active
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900",
                    !isOpen ? "justify-center px-0 mx-2" : "",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5 shrink-0 opacity-70 group-hover:opacity-100 group-hover:rotate-45 transition-transform" />
                  <span
                    className={[
                      "whitespace-nowrap transition-all duration-500",
                      isOpen
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-2 w-0 overflow-hidden",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => console.log("logout")}
            className={[
              "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-rose-500 transition-all duration-300 hover:bg-rose-50 dark:hover:bg-rose-950/30",
              !isOpen ? "justify-center px-0" : "",
            ].join(" ")}
          >
            <LogOut className="h-5 w-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
            <span
              className={[
                "whitespace-nowrap transition-all duration-500",
                isOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 w-0 overflow-hidden",
              ].join(" ")}
            >
              Chiqish
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
