"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  MoreHorizontal,
  Plus,
  Search,
  Mail,
  Trash2,
  Info,
  UserSquare2,
  ChevronRight,
  Loader2,
  Edit,
  UserPlus,
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
import { Badge } from "@/components/ui/badge";
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
  return match ? match[2] : null;
}

interface Teacher {
  _id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  status?: string;
}

function joinUrl(base: string, path: string) {
  const b = (base || "").replace(/\/+$/, "");
  const p = (path || "").replace(/^\/+/, "");
  return `${b}/${p}`;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchTeachers = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const token =
        getCookie("token") ||
        getCookie("access_token") ||
        getCookie("accessToken");
      if (!token) {
        setTeachers([]);
        setErrorMsg("Token topilmadi. Qayta login qiling.");
        setLoading(false);
        return;
      }
      const BASE_URL =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070";
      const url = joinUrl(BASE_URL, "/api/teacher/get-all-teachers");
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        signal,
      });
      if (!res.ok) {
        setTeachers([]);
        return;
      }
      const data = await res.json();
      const teacherList =
        (Array.isArray(data) && data) || data?.teachers || data?.data || [];
      setTeachers(Array.isArray(teacherList) ? teacherList : []);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchTeachers(controller.signal);
    return () => controller.abort();
  }, [fetchTeachers]);

  const filteredTeachers = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    return teachers.filter((t) => {
      const first = (t.first_name || "").toLowerCase();
      const last = (t.last_name || "").toLowerCase();
      const email = (t.email || "").toLowerCase();
      const fullName = `${first} ${last}`.trim();
      return (
        (!s || fullName.includes(s) || email.includes(s)) &&
        (filterStatus === "all" ||
          (t.status || "").toLowerCase() === filterStatus.toLowerCase())
      );
    });
  }, [teachers, searchTerm, filterStatus]);

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent uppercase italic">
            Ustozlar Markazi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Tizimdagi barcha o'qituvchilar boshqaruvi
          </p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 h-11 font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95">
              <Plus className="mr-2 h-5 w-5" />
              USTOZ QO'SHISH
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-8 border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Ustoz Qo'shish
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">
                  First Name
                </label>
                <Input
                  placeholder="First name"
                  className="rounded-xl h-11 border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">
                  Last Name
                </label>
                <Input
                  placeholder="Last name"
                  className="rounded-xl h-11 border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="rounded-xl h-11 border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">
                  Ustoz Sohasi
                </label>
                <Input
                  placeholder="Frontend"
                  className="rounded-xl h-11 border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">
                  Phone
                </label>
                <Input
                  placeholder="+998 123 45 67"
                  className="rounded-xl h-11 border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="*******"
                  className="rounded-xl h-11 border-slate-200"
                />
              </div>
            </div>
            <DialogFooter>
              <Button className="w-fit bg-[#1a1614] hover:bg-[#2d2825] text-white rounded-xl px-8 h-12 font-bold ml-auto">
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white/50 dark:bg-slate-900/50 p-3 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500" />
          <Input
            placeholder="Ustozni qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-12 bg-white dark:bg-slate-950 border-slate-200 rounded-2xl">
              <SelectValue placeholder="Saralash" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="all">Barchasi</SelectItem>
              <SelectItem value="faol">Faol</SelectItem>
              <SelectItem value="nofaol">Nofaol</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl shadow-sm rounded-[2.5rem]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-6 px-8 text-left font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-widest">
                  Ustoz ma'lumotlari
                </th>
                <th className="text-left font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-widest">
                  Aloqa kanali
                </th>
                <th className="text-center font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-widest">
                  Status
                </th>
                <th className="text-right pr-10 font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-widest">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher._id}
                    className="group hover:bg-slate-50/50 dark:hover:bg-indigo-500/5 transition-all duration-300"
                  >
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg transition-transform duration-300 group-hover:scale-110">
                          {teacher.first_name?.[0]}
                          {teacher.last_name?.[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[15px] font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300 group-hover:text-indigo-600">
                            {teacher.first_name} {teacher.last_name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            ID: {teacher._id.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {teacher.email}
                    </td>
                    <td className="py-5 text-center">
                      <Badge
                        className={`rounded-full px-3 py-1 border-none ${
                          (teacher.status || "").toLowerCase() === "faol"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {teacher.status || "Nofaol"}
                      </Badge>
                    </td>
                    <td className="py-5 text-right pr-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-9 w-9 p-0 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200"
                          >
                            <MoreHorizontal className="h-5 w-5 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 p-2 rounded-2xl shadow-2xl border-slate-100 backdrop-blur-xl"
                        >
                          <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-indigo-50">
                            <Edit size={16} className="text-blue-500" />
                            <span className="font-semibold text-sm">
                              Tahrirlash
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="opacity-50" />
                          <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer text-rose-600 focus:bg-rose-50">
                            <Trash2 size={16} />
                            <span className="font-semibold text-sm">
                              O'chirish
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] px-4">
        <p>© 2026 Admin CRM • Teachers Panel</p>
        <div className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" /> System Live
        </div>
      </div>
    </div>
  );
}
