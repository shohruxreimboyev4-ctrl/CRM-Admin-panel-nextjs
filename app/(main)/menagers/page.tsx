"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  MoreHorizontal,
  Loader2,
  Edit,
  Trash2,
  Mail,
  Search,
  Smartphone,
  AlertCircle,
} from "lucide-react";

type Manager = {
  _id?: string;
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  status?: string;
};

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070"
).replace(/\/+$/, "");

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchManagers = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setErrorMsg("");

    const token =
      getCookie("token") ||
      getCookie("accessToken") ||
      getCookie("access_token");

    if (!token) {
      setManagers([]);
      setErrorMsg("Token topilmadi. Qayta login qiling.");
      setLoading(false);
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setManagers([]);
      setErrorMsg("Internet yo‘q. Tarmoqni tekshiring.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/staff/all-managers`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setErrorMsg("Token yaroqsiz. Qayta login qiling.");
        } else {
          setErrorMsg(`Server xatosi: ${res.status}`);
        }
        setManagers([]);
        return;
      }

      const data = await res.json().catch(() => ({}));
      const list: Manager[] =
        (Array.isArray(data) && data) ||
        data?.data ||
        data?.managers ||
        data?.result ||
        [];

      setManagers(Array.isArray(list) ? list : []);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setManagers([]);
      setErrorMsg(
        `Serverga ulanish bo‘lmadi. Backend ishlayaptimi tekshiring: ${BASE_URL}`,
      );
      console.debug("Fetch xato:", err?.message ?? err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchManagers(controller.signal);
    return () => controller.abort();
  }, [fetchManagers]);

  const filteredManagers = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();

    return managers.filter((m) => {
      const fullName = `${m.first_name || ""} ${m.last_name || ""}`
        .trim()
        .toLowerCase();
      const email = (m.email || "").toLowerCase();
      const phone = (m.phone || "").toLowerCase();

      return (
        !s || fullName.includes(s) || email.includes(s) || phone.includes(s)
      );
    });
  }, [searchTerm, managers]);

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Menejerlar Boshqaruvi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Tizimdagi barcha faol menejerlar ro&apos;yxati va ularning
            statistikasi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              placeholder="Qidiruv (Ism, Email, Telefon)..."
              className="pl-10 w-full md:w-80 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-indigo-500/20 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 py-2 px-4 rounded-xl hidden sm:flex border">
            Jami: {filteredManagers.length}
          </Badge>
        </div>
      </div>

      {/* ERROR */}
      {!!errorMsg && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-rose-700 dark:text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-semibold">{errorMsg}</p>
          </div>
          <div className="mt-2">
            <Button
              variant="secondary"
              className="rounded-xl"
              onClick={() => fetchManagers()}
            >
              Qayta urinish
            </Button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <Card className="overflow-hidden border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-[2rem]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-6 px-6 font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-widest">
                  Menejer Ma&apos;lumotlari
                </TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-widest">
                  Aloqa Kanali
                </TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-widest text-center">
                  Status
                </TableHead>
                <TableHead className="text-right pr-8 font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-widest">
                  Amallar
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                      <span className="text-sm font-medium text-slate-500">
                        Ma&apos;lumotlar yuklanmoqda...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredManagers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-40 text-center opacity-60"
                  >
                    Menejer topilmadi
                  </TableCell>
                </TableRow>
              ) : (
                filteredManagers.map((m) => {
                  const id = m._id || m.id || "";
                  const initials =
                    `${m.first_name?.[0] || ""}${m.last_name?.[0] || ""}` ||
                    "M";
                  const status = (m.status || "faol").toLowerCase();

                  return (
                    <TableRow
                      key={id || `${m.email}-${initials}`}
                      className="border-b border-slate-50 dark:border-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-indigo-500/5 transition-colors group"
                    >
                      <TableCell className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                            {initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[15px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {(m.first_name || "—") +
                                " " +
                                (m.last_name || "")}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                              ID: {id ? id.slice(-8) : "—"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Mail className="h-3.5 w-3.5 text-indigo-400" />
                            {m.email || "—"}
                          </div>

                          {!!m.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                              <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                              {m.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <div
                            className={`h-2 w-2 rounded-full animate-pulse ${
                              status === "faol"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          />
                          <span
                            className={`text-[11px] font-bold uppercase tracking-wider ${
                              status === "faol"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {m.status || "faol"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right pr-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-9 w-9 p-0 rounded-xl hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                            >
                              <MoreHorizontal className="h-5 w-5 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="w-52 p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border-slate-200/60 dark:border-slate-800/60 animate-in zoom-in-95 duration-200"
                          >
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedManager(m);
                                setEditModal(true);
                              }}
                              className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-indigo-50 dark:focus:bg-indigo-500/10 transition-colors"
                            >
                              <Edit className="h-4 w-4 text-blue-500" />
                              <span className="font-semibold text-sm">
                                Tahrirlash
                              </span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1 opacity-50" />

                            <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-not-allowed opacity-50 grayscale">
                              <Trash2 className="h-4 w-4 text-rose-500" />
                              <span className="font-semibold text-sm text-rose-500">
                                O&apos;chirish (Locked)
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* EDIT MODAL */}
      <Dialog open={editModal} onOpenChange={setEditModal}>
        <DialogContent className="sm:max-w-[520px] rounded-[2.5rem] p-8 border border-slate-200/60 dark:border-white/10 bg-white/95 dark:bg-[#020617]/95 text-slate-900 dark:text-slate-100 shadow-2xl backdrop-blur-2xl">
          <DialogHeader>
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
              <Edit className="h-7 w-7 text-indigo-500" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">
              Menejerni Tahrirlash
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              O&apos;zgartirgandan so&apos;ng "Saqlash" tugmasini bosing.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            <div className="grid gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                Ism
              </label>
              <Input
                value={selectedManager?.first_name || ""}
                onChange={(e) =>
                  setSelectedManager((prev) => ({
                    ...(prev || {}),
                    first_name: e.target.value,
                  }))
                }
                className="h-12 rounded-2xl bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                Email
              </label>
              <Input
                value={selectedManager?.email || ""}
                onChange={(e) =>
                  setSelectedManager((prev) => ({
                    ...(prev || {}),
                    email: e.target.value,
                  }))
                }
                className="h-12 rounded-2xl bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 sm:justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setEditModal(false)}
              className="rounded-2xl h-12 px-6 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              Bekor qilish
            </Button>
            <Button
              onClick={() => {
                alert("Backend tomonidan o'zgartirish cheklangan!");
                setEditModal(false);
              }}
              className="rounded-2xl h-12 px-10 font-black bg-slate-900 hover:bg-slate-950 dark:bg-white dark:text-black dark:hover:bg-white/90 transition-all active:scale-95"
            >
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
