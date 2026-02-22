"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  ChevronRight,
  Loader2,
  Edit,
  RotateCcw,
  Info,
  Smartphone,
  GraduationCap,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

interface Student {
  _id?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  groups_count?: number;
  group_count?: number;
  groups?: any[];
  status?: string;
}

// ✅ API’dan kelgan response formatlari turlicha bo‘lishi mumkin — universal parser
function normalizeStudents(payload: any): Student[] {
  const list = payload?.students ?? payload?.data ?? payload;
  return Array.isArray(list) ? list : [];
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // ✅ so‘nggi requestni bekor qilish uchun (unmount / tez-tez filter o‘zgarishi)
  const abortRef = useRef<AbortController | null>(null);

  const fetchStudents = useCallback(async () => {
    // oldingi request bo‘lsa bekor qilamiz
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    // ✅ BASE_URL yo‘q bo‘lsa crash emas
    if (!BASE_URL) {
      console.warn("NEXT_PUBLIC_BASE_URL topilmadi. .env ni tekshir.");
      setStudents([]);
      setLoading(false);
      return;
    }

    const token = getCookie("token");

    // ✅ query toza yig‘iladi
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (searchTerm.trim()) params.set("search", searchTerm.trim());

    const url = `${BASE_URL}/api/student/get-all-students${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: controller.signal,
        cache: "no-store",
      });

      // ✅ res json bo‘lmasa ham ushlab qolamiz
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        console.error("Students fetch error:", {
          status: res.status,
          statusText: res.statusText,
          data,
          url,
        });
        setStudents([]);
        return;
      }

      setStudents(normalizeStudents(data));
    } catch (err: any) {
      // Abort bo‘lsa xato deb ko‘rsatmaymiz
      if (err?.name === "AbortError") return;
      console.error("Xatolik:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, BASE_URL]);

  useEffect(() => {
    fetchStudents();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchStudents]);

  // ✅ status ranglarini xavfsiz qilish
  const statusDot = (s?: string) => {
    if (s === "faol") return "bg-emerald-500";
    if (s === "tatilda") return "bg-amber-500";
    if (s === "yakunladi") return "bg-slate-500";
    return "bg-indigo-500";
  };

  const statusText = (s?: string) => {
    if (s === "faol") return "text-emerald-600";
    if (s === "tatilda") return "text-amber-600";
    if (s === "yakunladi") return "text-slate-600";
    return "text-indigo-600";
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent uppercase italic">
            Studentlar ro'yxati
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
            O'quvchilar va ularning guruhlarini boshqarish
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-black text-white rounded-2xl px-6 h-12 font-bold shadow-[0_10px_20px_rgba(0,0,0,0.15)] transition-all active:scale-95 flex gap-2">
                <Plus className="h-5 w-5" /> Student Qo'shish
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-8 border-none shadow-2xl dark:bg-slate-950">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold italic">
                  Student Qo'shish
                </DialogTitle>
              </DialogHeader>

              {/* ⚠️ bu modal hozir UI uchun. backend ulashni xohlasang aytasan */}
              <div className="grid gap-5 py-4">
                <div className="space-y-1.5 uppercase tracking-tighter">
                  <label className="text-[11px] font-bold text-slate-500 ml-1">
                    Ism
                  </label>
                  <Input
                    placeholder="Davron"
                    className="rounded-xl h-12 border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1.5 uppercase tracking-tighter">
                  <label className="text-[11px] font-bold text-slate-500 ml-1">
                    Familiya
                  </label>
                  <Input
                    placeholder="Raimjonov"
                    className="rounded-xl h-12 border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1.5 uppercase tracking-tighter">
                  <label className="text-[11px] font-bold text-slate-500 ml-1">
                    Guruh
                  </label>
                  <Input
                    placeholder="Frontend N1"
                    className="rounded-xl h-12 border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1.5 uppercase tracking-tighter">
                  <label className="text-[11px] font-bold text-slate-500 ml-1">
                    Telefon raqam
                  </label>
                  <Input
                    placeholder="+998900000000"
                    className="rounded-xl h-12 border-slate-200 bg-slate-50/50"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full bg-[#1a1614] hover:bg-black text-white rounded-xl h-12 font-bold transition-all shadow-lg">
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white/50 dark:bg-slate-900/50 p-3 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 shadow-sm backdrop-blur-md">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <Input
            placeholder="Student qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 text-slate-700 font-medium"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 bg-white dark:bg-slate-950 border-slate-200 rounded-2xl shadow-sm font-bold text-[13px]">
              <SelectValue placeholder="Holat" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
              <SelectItem value="all">Barchasi</SelectItem>
              <SelectItem value="faol">Faol</SelectItem>
              <SelectItem value="tatilda">Tatilda</SelectItem>
              <SelectItem value="yakunladi">Yakunladi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <tr className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                <th className="py-6 px-8 text-left">Talaba Ma'lumotlari</th>
                <th className="text-left">Aloqa</th>
                <th className="text-center">Guruhlar</th>
                <th className="text-center">Status</th>
                <th className="text-right pr-10">Amallar</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-400" />
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-sm font-bold text-slate-500">
                      Student topilmadi
                    </p>
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => {
                  const id = student._id ?? `fallback-${idx}`;
                  const fn = student.first_name ?? "";
                  const ln = student.last_name ?? "";

                  return (
                    <tr
                      key={id}
                      className="group hover:bg-slate-50/50 dark:hover:bg-indigo-500/5 transition-all duration-300"
                    >
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-500 flex items-center justify-center text-white font-bold shadow-lg shadow-slate-500/20">
                            {(fn[0] ?? "").toUpperCase()}
                            {(ln[0] ?? "").toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[15px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                              {fn} {ln}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ID:{" "}
                              {(student._id ?? "------")
                                .slice(-6)
                                .toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                          <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                          {student.phone ?? "-"}
                        </div>
                      </td>

                      <td className="py-5 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                          <GraduationCap size={14} />
                          <span className="text-sm font-bold">
                            {student.groups_count ??
                              student.group_count ??
                              student.groups?.length ??
                              0}
                          </span>
                        </div>
                      </td>

                      <td className="py-5 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <div
                            className={`h-2 w-2 rounded-full animate-pulse ${statusDot(
                              student.status,
                            )}`}
                          />
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-widest ${statusText(
                              student.status,
                            )}`}
                          >
                            {student.status ?? "unknown"}
                          </span>
                        </div>
                      </td>

                      <td className="py-5 text-right pr-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-9 w-9 p-0 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                            >
                              <MoreHorizontal className="h-5 w-5 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="w-52 p-2 rounded-2xl shadow-2xl border-slate-100/60 backdrop-blur-xl bg-white/95"
                          >
                            <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-indigo-50 transition-colors">
                              <Edit size={16} className="text-blue-500" />
                              <span className="font-bold text-sm text-slate-700 uppercase tracking-tighter">
                                Tahrirlash
                              </span>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-amber-50">
                              <RotateCcw size={16} className="text-amber-500" />
                              <span className="font-bold text-sm text-slate-700 uppercase tracking-tighter">
                                Qaytarish
                              </span>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-blue-50">
                              <Info size={16} className="text-indigo-500" />
                              <span className="font-bold text-sm text-slate-700 uppercase tracking-tighter">
                                Info
                              </span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="opacity-50" />

                            <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer text-rose-600 focus:bg-rose-50">
                              <Trash2 size={16} />
                              <span className="font-bold text-sm uppercase tracking-tighter">
                                O'chirish
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] px-4 opacity-60 italic">
        <p>© 2026 Admin CRM • Elite Academy</p>
        <div className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" /> System Stable
        </div>
      </div>
    </div>
  );
}
