"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Snowflake,
  Flame,
  Clock,
  Users,
  Loader2,
  MoreVertical,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ✅ Cookie funksiyasi
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

// ✅ debounce (har harfda API urmasin)
function useDebouncedValue<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ✅ React child bo‘lib ketadigan object muammosini 100% yopadi
function safeText(v: any, fallback = "—") {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "string") return v.trim() ? v : fallback;
  if (typeof v === "number" || typeof v === "boolean") return String(v);

  if (typeof v === "object") {
    if (typeof v.name === "string" && v.name.trim()) return v.name;
    if (typeof v.title === "string" && v.title.trim()) return v.title;
    if (typeof v.label === "string" && v.label.trim()) return v.label;
    // oxirgi chora: objectni chiqarib yubormaymiz
    return fallback;
  }

  return fallback;
}

function safeNumber(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

type Course = {
  _id?: string;
  name?: any; // backend object yuborishi mumkin
  price?: number | string;
  duration?: any; // backend object yuborishi mumkin
  description?: any;
  is_freeze?: boolean;
  students_count?: number;
};

function normalizeCourses(data: any): Course[] {
  const list = data?.courses || data?.data || data?.result || data || [];
  return Array.isArray(list) ? list : [];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebouncedValue(searchTerm, 500);
  const abortRef = useRef<AbortController | null>(null);

  const fetchCourses = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    try {
      const token =
        getCookie("token") ||
        getCookie("accessToken") ||
        getCookie("access_token");

      const BASE_URL =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070";

      // ✅ query safe
      const params = new URLSearchParams();
      params.set("is_freeze", "false");
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

      const url = `${BASE_URL}/api/course/get-courses?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        console.error("Ma'lumot olishda xatolik:", {
          status: res.status,
          statusText: res.statusText,
          data,
          url,
        });
        setCourses([]);
        return;
      }

      setCourses(normalizeCourses(data));
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("Kurslarni yuklashda xato:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCourses();
    return () => abortRef.current?.abort();
  }, [fetchCourses]);

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-slate-50/30 min-h-screen dark:bg-transparent">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-slate-950 to-blue-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            O'quv Kurslari
          </h1>
          <p className="text-slate-500 text-sm font-semibold italic">
            Mavjud barcha faol kurslar va tariflar
          </p>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 h-12 font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95">
          <Plus className="mr-2 h-5 w-5" /> Kurs Qo'shish
        </Button>
      </div>

      {/* --- SEARCH & STATS --- */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900/40 p-2 rounded-[1.8rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder="Kurs nomi bo'yicha qidirish..."
            className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 py-2.5 px-6 rounded-2xl border font-black uppercase text-[10px] tracking-widest">
          Jami Kurslar: {courses.length}
        </Badge>
      </div>

      {/* --- COURSES GRID --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-slate-400 font-bold animate-pulse uppercase text-xs tracking-[0.2em]">
            Kurslar yuklanmoqda...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => {
            const id = course._id ?? `course-${idx}`;
            const price = safeNumber(course.price, 0);

            return (
              <Card
                key={id}
                className="group relative overflow-hidden rounded-[2.5rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-100 dark:shadow-none transition-all hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="p-8 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <Flame size={24} />
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-10 w-10 rounded-full p-0"
                        >
                          <MoreVertical size={20} className="text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-2xl p-2 w-48 shadow-2xl"
                      >
                        <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer font-bold text-xs uppercase">
                          <Edit2 size={14} className="text-blue-500" />{" "}
                          Tahrirlash
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer font-bold text-xs uppercase text-orange-500">
                          <Snowflake size={14} /> Muzlatish
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer font-bold text-xs uppercase text-rose-500">
                          <Trash2 size={14} /> O'chirish
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-tight group-hover:text-blue-600 transition-colors">
                    {safeText(course.name, "Noma'lum kurs")}
                  </h3>

                  <p className="text-slate-400 text-sm mt-2 font-medium line-clamp-2 italic">
                    {safeText(
                      course.description,
                      "Ushbu kurs haqida qo'shimcha ma'lumot kiritilmagan.",
                    )}
                  </p>
                </div>

                {/* Card Body */}
                <div className="px-8 py-4 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500">
                    <Clock size={12} className="text-blue-500" />{" "}
                    {safeText(course.duration, "Noma'lum")}
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500">
                    <Users size={12} className="text-blue-500" />{" "}
                    {safeNumber(course.students_count, 0)} Talaba
                  </div>
                </div>

                {/* Card Footer (Price) */}
                <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Kurs narxi:
                  </span>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                    {price.toLocaleString("ru-RU")}{" "}
                    <small className="text-[10px]">UZS</small>
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && courses.length === 0 && (
        <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-400 font-bold uppercase text-sm tracking-widest italic">
            Hozircha hech qanday kurs topilmadi
          </p>
        </div>
      )}
    </div>
  );
}
