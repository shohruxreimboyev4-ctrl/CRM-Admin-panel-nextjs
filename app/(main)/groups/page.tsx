"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Calendar,
  Users,
  Loader2,
  Clock,
  UserCheck,
  History,
  CheckCircle2,
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

function formatDateTime(input: any) {
  if (!input) return "—";

  if (typeof input === "string" && /^\d{2}\.\d{2}\.\d{4}/.test(input))
    return input;

  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);

  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);

    const token =
      getCookie("token") ||
      getCookie("accessToken") ||
      getCookie("access_token");

    const BASE_URL =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070";

    try {
      const res = await fetch(
        `${BASE_URL}/api/group/get-all-group?search=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const data = await res.json();

      const result =
        data?.groups ||
        data?.data ||
        data?.result ||
        (Array.isArray(data) ? data : []);

      setGroups(result);
    } catch (err) {
      console.error("Fetch xatosi:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-slate-50/30 dark:bg-transparent min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-slate-950 to-indigo-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Guruhlar Boshqaruvi
          </h1>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0f172a] hover:bg-black text-white rounded-2xl px-8 h-12 font-bold shadow-xl">
              <Plus className="h-5 w-5 mr-2" /> Guruh Qo&apos;shish
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[560px] rounded-[2.5rem] p-8 border border-border bg-background text-foreground shadow-2xl">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-black tracking-tight">
                Yangi guruh
              </DialogTitle>
              <p className="text-sm text-muted-foreground font-medium">
                Guruh ma&apos;lumotlarini kiriting
              </p>
            </DialogHeader>

            <div className="mt-6 grid gap-5">
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                  Guruh nomi
                </label>
                <Input
                  placeholder="Masalan: .NET N1"
                  className="h-12 rounded-2xl bg-background/50 border border-input text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/40"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                  Ustoz (ID yoki ism)
                </label>
                <Input
                  placeholder="Masalan: Davron01"
                  className="h-12 rounded-2xl bg-background/50 border border-input text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/40"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                  Boshlanish sanasi/vaqti
                </label>
                <Input
                  placeholder="20.04.2025, 05:00:00"
                  className="h-12 rounded-2xl bg-background/50 border border-input text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/40"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                  Tugash sanasi/vaqti
                </label>
                <Input
                  placeholder="12.05.2025, 09:30:24"
                  className="h-12 rounded-2xl bg-background/50 border border-input text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/40"
                />
              </div>
            </div>

            <DialogFooter className="mt-8 flex gap-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="h-12 rounded-2xl px-6"
              >
                Bekor qilish
              </Button>

              <Button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="h-12 rounded-2xl px-8 font-black"
              >
                Saqlash
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900/40 p-2 rounded-[1.8rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Qidirish..."
            className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Badge className="bg-slate-100 dark:bg-indigo-500/10 py-2.5 px-6 rounded-2xl border font-black uppercase text-[10px]">
          Jami: {groups.length}
        </Badge>
      </div>

      <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-[#020617]/60 rounded-[2.5rem]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <tr className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-black">
                <th className="py-6 px-8 text-left w-16">№</th>
                <th className="text-left">Guruh nomi</th>
                <th className="text-left">Mas&apos;ul Ustoz</th>
                <th className="text-center">O&apos;quvchilar</th>
                <th className="text-left">Muddat</th>
                <th className="text-right pr-10">Amallar</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
              {!loading &&
                groups.map((group, index) => {
                  const gName =
                    group.group_name || group.name || group.title || "—";

                  const teacher = group.teacher_id || group.teacher;
                  const teacherFullName =
                    typeof teacher === "object" && teacher !== null
                      ? `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim() ||
                        "Tayinlanmagan"
                      : "Tayinlanmagan";

                  const startedRaw =
                    group.start_date ||
                    group.startDate ||
                    group.started_at ||
                    group.startedAt ||
                    group.begin_at ||
                    group.beginAt ||
                    null;

                  const endedRaw =
                    group.end_date ||
                    group.endDate ||
                    group.ended_at ||
                    group.endedAt ||
                    group.finish_at ||
                    group.finishAt ||
                    null;

                  const startedAt = formatDateTime(startedRaw);
                  const endedAt = formatDateTime(endedRaw);

                  return (
                    <tr
                      key={group._id || index}
                      className="group hover:bg-slate-50/80 dark:hover:bg-indigo-500/5"
                    >
                      <td className="py-6 px-8 text-xs font-black text-slate-300">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      <td className="py-6">
                        <span className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
                          {gName}
                        </span>
                      </td>

                      <td className="py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 dark:border-none">
                            <UserCheck size={14} />
                          </div>
                          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            {teacherFullName}
                          </span>
                        </div>
                      </td>

                      <td className="py-6 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs shadow-lg shadow-slate-200 dark:shadow-none border border-slate-800 dark:border-slate-200">
                          <Users size={12} />
                          {group.students_count || group.count || 0}
                        </div>
                      </td>

                      <td className="py-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 bg-emerald-500/10 w-fit px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            <Calendar size={12} />
                            <span className="opacity-90">Boshlangan:</span>
                            <span className="text-slate-200">{startedAt}</span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-black text-rose-400 bg-rose-500/10 w-fit px-2.5 py-1 rounded-lg border border-rose-500/20">
                            <Clock size={12} />
                            <span className="opacity-90">Tugagan:</span>
                            <span className="text-slate-200">{endedAt}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-6 text-right pr-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-9 w-9 rounded-xl border border-transparent hover:border-slate-200 transition-all"
                            >
                              <MoreHorizontal className="h-5 w-5 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="w-60 p-2 rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
                          >
                            <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer">
                              <History className="h-4 w-4 text-indigo-500" />
                              <span className="font-bold text-xs uppercase">
                                Tugash vaqtini belgilash
                              </span>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <span className="font-bold text-xs uppercase">
                                Guruhni tugatish
                              </span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1 opacity-50" />

                            <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer text-rose-600">
                              <Trash2 className="h-4 w-4" />
                              <span className="font-bold text-xs uppercase">
                                Guruhni o&apos;chirish
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}

              {loading && (
                <tr>
                  <td colSpan={6} className="py-32 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] px-4 opacity-40">
        <p>© 2026 Admin CRM • All Rights Reserved</p>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
          System Active
        </div>
      </div>
    </div>
  );
}
