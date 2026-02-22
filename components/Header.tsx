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
  UserCircle2,
  X,
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
  onClose?: () => void; // ✅ mobile overlay uchun (optional)
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

const navOther = [
  { href: "/settings", label: "Sozlamalar", icon: Settings },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
];

export default function Header({ isOpen, onClose }: HeaderProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ✅ MOBILE OVERLAY (faqat open bo‘lsa) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] sm:hidden"
        />
      )}

      <aside
        className={[
          // ✅ mobile: fixed drawer, desktop: sticky
          "fixed sm:sticky top-0 left-0 z-50 sm:z-40 h-screen shrink-0",
          "border-r border-slate-200/60 dark:border-slate-800/60",
          "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-500 ease-in-out",

          // ✅ width: 300px ekran uchun ham mos
          isOpen ? "w-[240px] min-[360px]:w-[270px] sm:w-[280px]" : "w-[86px]",

          // ✅ mobile closed -> yashirin (drawer yopiq)
          !isOpen ? "-translate-x-full sm:translate-x-0" : "translate-x-0",
        ].join(" ")}
      >
        {/* TOP BRAND */}
        <div className="px-4 min-[360px]:px-6 py-6 sm:py-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <Sparkles className="h-6 w-6 text-white" />
            </div>

            <div
              className={[
                "font-black tracking-tighter text-lg sm:text-xl bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent italic uppercase transition-all duration-500",
                isOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 w-0 overflow-hidden",
              ].join(" ")}
            >
              Admin CRM
            </div>
          </div>

          {/* ✅ mobile close button */}
          {isOpen && (
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
          )}
        </div>

        {/* BODY */}
        <div className="px-3 min-[360px]:px-4 flex flex-col h-[calc(100vh-92px)] sm:h-[calc(100vh-100px)] justify-between pb-5 sm:pb-6">
          <div>
            <div
              className={[
                "px-4 mb-3 sm:mb-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 transition-all",
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
                    onClick={() => {
                      // ✅ mobile’da link bosilganda yopilsin
                      if (
                        typeof window !== "undefined" &&
                        window.innerWidth < 640
                      )
                        onClose?.();
                    }}
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
                "px-4 mt-7 sm:mt-8 mb-3 sm:mb-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 transition-all",
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
                    title={!isOpen ? item.label : undefined}
                    onClick={() => {
                      if (
                        typeof window !== "undefined" &&
                        window.innerWidth < 640
                      )
                        onClose?.();
                    }}
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

          {/* LOGOUT */}
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
    </>
  );
}
