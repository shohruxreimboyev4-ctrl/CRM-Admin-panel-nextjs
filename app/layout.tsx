"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "@/components/Header";

import { ThemeProvider, useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, User as UserIcon } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_CONFIG = { name: "Admin CRM", description: "CRM Dashboard" };

const TITLES: Record<string, string> = {
  "/": "Asosiy",
  "/menagers": "Menejerlar",
  "/admins": "Adminlar",
  "/teachers": "O'qituvchilar",
  "/students": "Talabalar",
  "/groups": "Guruhlar",
  "/courses": "Kurslar",
  "/payment": "To'lovlar",
  "/settings": "Sozlamalar",
};

type UserType = {
  first_name?: string;
  last_name?: string;
  fullName?: string;
  role?: string;
  image?: string | null;
};

function pickTitle(pathname: string) {
  const key =
    Object.keys(TITLES).find((k) =>
      k === "/" ? pathname === "/" : pathname.startsWith(k),
    ) || "";
  return TITLES[key] || "CRM Panel";
}

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

function readUserFromCookie(): UserType | null {
  const raw = getCookie("user");
  if (!raw) return null;

  try {
    const decoded = decodeURIComponent(raw);
    return JSON.parse(decoded) as UserType;
  } catch {
    return null;
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const hideHeader = pathname === "/login";

  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [checking, setChecking] = useState(true);

  const pageTitle = useMemo(() => pickTitle(pathname), [pathname]);

  useEffect(() => {
    document.title = `${pageTitle} | ${SITE_CONFIG.name}`;
  }, [pageTitle]);

  useEffect(() => {
    if (hideHeader) {
      setChecking(false);
      return;
    }

    const token =
      getCookie("token") ||
      getCookie("access_token") ||
      getCookie("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    const userData = readUserFromCookie();
    setUser(userData);
    setChecking(false);
  }, [hideHeader, router]);

  if (!hideHeader && checking) {
    return (
      <html lang="uz">
        <body className={`${inter.variable} antialiased bg-background`} />
      </html>
    );
  }

  return (
    <html lang="uz" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-dvh bg-background">
            {!hideHeader && <Header isOpen={isOpen} user={user} />}

            <div className="flex min-w-0 flex-1 flex-col">
              {!hideHeader && (
                <Topbar
                  pageTitle={pageTitle}
                  setIsOpen={setIsOpen}
                  user={user}
                />
              )}

              <main>{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

function Topbar({
  pageTitle,
  setIsOpen,
  user,
}: {
  pageTitle: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: UserType | null;
}) {
  const { theme, setTheme } = useTheme();

  const fullName = useMemo(() => {
    if (user?.fullName) return user.fullName;
    if (user?.first_name) return `${user.first_name} ${user?.last_name || ""}`;
    return "Foydalanuvchi";
  }, [user]);

  const roleName = user?.role || "Menejer";
  const avatarUrl = user?.image || null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-500 ease-in-out">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen((p) => !p)}
            className="rounded-md p-2 hover:bg-muted transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center gap-3 rounded-2xl border  p-1.5 pl-1.5 pr-4 transition hover:bg-accent">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted border">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-start text-left leading-none">
                  <span className="text-[14px] font-bold text-foreground capitalize">
                    {fullName}
                  </span>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <UserIcon className="h-3 w-3" />
                    <span className="capitalize">{roleName}</span>
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Sozlamalar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => {
                  document.cookie = "token=; Max-Age=0; path=/;";
                  document.cookie = "user=; Max-Age=0; path=/;";
                  window.location.href = "/login";
                }}
              >
                Chiqish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
