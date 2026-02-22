"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Search,
  Loader2,
  CalendarDays,
  Users,
  Wallet,
  Plus,
  CreditCard,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

// ✅ Cookie
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function useDebouncedValue<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function safeText(v: any, fallback = "—") {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "string") return v.trim() ? v : fallback;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object") {
    if (typeof v.name === "string" && v.name.trim()) return v.name;
    if (typeof v.title === "string" && v.title.trim()) return v.title;
    if (typeof v.label === "string" && v.label.trim()) return v.label;
    if (typeof v.first_name === "string" || typeof v.last_name === "string") {
      const full = `${v.first_name || ""} ${v.last_name || ""}`.trim();
      return full || fallback;
    }
    return fallback;
  }
  return fallback;
}

function safeNumber(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function formatMonthLabel(month: string) {
  if (!/^\d{4}-\d{2}$/.test(month)) return month;
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "long",
  }).format(d);
}

function normalizeDebtors(data: any): any[] {
  const list =
    data?.debtors || data?.students || data?.data || data?.result || data || [];
  return Array.isArray(list) ? list : [];
}

function pickStudent(row: any) {
  return row?.student || row?.student_id || row?.studentId || row;
}

function pickGroup(row: any) {
  return (
    row?.group ||
    row?.group_id ||
    row?.groupId ||
    row?.group_name ||
    row?.groupName
  );
}

function pickDebt(row: any) {
  return (
    row?.debt_amount ??
    row?.debtAmount ??
    row?.amount ??
    row?.debt ??
    row?.total ??
    row?.sum ??
    0
  );
}

export default function Payment() {
  const defaultMonth = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }, []);

  const [month, setMonth] = useState(defaultMonth);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const debouncedQ = useDebouncedValue(q, 350);
  const abortRef = useRef<AbortController | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070";

  // ✅ MUHIM: buni backend endpointingga moslab o‘zgartirasan
  // Masalan: "/api/payment/create" yoki "/api/payment/add-payment"
  const PAYMENT_CREATE_URL = `${BASE_URL}/api/payment/create`;

  // ✅ Modal state + form
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    groupId: "",
    amount: "",
    method: "cash", // cash | card | transfer
    month: defaultMonth, // YYYY-MM
  });

  const fetchDebtors = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    try {
      const token =
        getCookie("token") ||
        getCookie("accessToken") ||
        getCookie("access_token");

      const params = new URLSearchParams();
      params.set("month", month);

      const url = `${BASE_URL}/api/payment/get-debtors-student?${params.toString()}`;

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
        console.error("Payment debtors fetch error:", {
          status: res.status,
          statusText: res.statusText,
          url,
          data,
        });
        setRows([]);
        return;
      }

      setRows(normalizeDebtors(data));
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("Fetch xatosi:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, month]);

  useEffect(() => {
    fetchDebtors();
    return () => abortRef.current?.abort();
  }, [fetchDebtors]);

  const filtered = useMemo(() => {
    if (!debouncedQ.trim()) return rows;
    const s = debouncedQ.toLowerCase();
    return rows.filter((row) => {
      const st = pickStudent(row);
      const gr = pickGroup(row);
      const fullName =
        `${safeText(st?.first_name, "")} ${safeText(st?.last_name, "")}`.toLowerCase();
      const phone = safeText(st?.phone, "").toLowerCase();
      const groupName = safeText(
        gr?.group_name ?? gr?.name ?? gr,
        "",
      ).toLowerCase();
      return fullName.includes(s) || phone.includes(s) || groupName.includes(s);
    });
  }, [rows, debouncedQ]);

  const totalDebtors = filtered.length;
  const totalDebtSum = useMemo(() => {
    return filtered.reduce((acc, row) => acc + safeNumber(pickDebt(row), 0), 0);
  }, [filtered]);

  // ✅ Create payment submit
  const onSubmitPayment = useCallback(async () => {
    const token =
      getCookie("token") ||
      getCookie("accessToken") ||
      getCookie("access_token");

    const amountNum = safeNumber(form.amount, NaN);

    if (!form.studentId.trim()) {
      alert("Student ID kiriting");
      return;
    }
    if (!form.groupId.trim()) {
      alert("Group ID kiriting");
      return;
    }
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      alert("To‘g‘ri miqdor kiriting");
      return;
    }
    if (!/^\d{4}-\d{2}$/.test(form.month)) {
      alert("Oy formati noto‘g‘ri (YYYY-MM)");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(PAYMENT_CREATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json",
        },
        body: JSON.stringify({
          student_id: form.studentId, // ✅ backend shunaqa kutsa
          group_id: form.groupId,
          amount: amountNum,
          method: form.method,
          month: form.month,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        console.error("Create payment error:", { status: res.status, data });
        alert(data?.message || "To‘lov qo‘shishda xatolik");
        return;
      }

      // ✅ success
      setOpen(false);
      setForm((p) => ({ ...p, amount: "", studentId: "", groupId: "" }));
      // debtors ro‘yxatini qayta yuklab olamiz
      fetchDebtors();
    } catch (e) {
      console.error(e);
      alert("Network xatolik");
    } finally {
      setSaving(false);
    }
  }, [PAYMENT_CREATE_URL, form, fetchDebtors]);

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-slate-50/30 dark:bg-transparent min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-slate-950 to-indigo-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            To&apos;lovlar
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold italic">
            Qarzdor o&apos;quvchilar ro&apos;yxati (oy bo&apos;yicha)
          </p>
        </div>

        {/* ✅ MODAL BUTTON */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0f172a] hover:bg-black text-white rounded-2xl px-8 h-12 font-bold shadow-xl">
              <Plus className="h-5 w-5 mr-2" />
              To&apos;lov qo&apos;shish
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[560px] rounded-[2.5rem] p-8 border border-border bg-background text-foreground shadow-2xl">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-black tracking-tight">
                Yangi to&apos;lov
              </DialogTitle>
              <p className="text-sm text-muted-foreground font-medium">
                Student va guruh ID, miqdor hamda oy kiriting
              </p>
            </DialogHeader>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                  Student ID
                </label>
                <Input
                  value={form.studentId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, studentId: e.target.value }))
                  }
                  placeholder="Masalan: 683fe0469c8f403fb51c4d8f"
                  className="h-12 rounded-2xl font-bold"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                  Group ID
                </label>
                <Input
                  value={form.groupId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, groupId: e.target.value }))
                  }
                  placeholder="Masalan: 65a1b2c3d4..."
                  className="h-12 rounded-2xl font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                    Miqdor (UZS)
                  </label>
                  <Input
                    inputMode="numeric"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, amount: e.target.value }))
                    }
                    placeholder="Masalan: 500000"
                    className="h-12 rounded-2xl font-bold"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                    Oy (YYYY-MM)
                  </label>
                  <Input
                    type="month"
                    value={form.month}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, month: e.target.value }))
                    }
                    className="h-12 rounded-2xl font-black"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                  To&apos;lov usuli
                </label>

                <div className="grid grid-cols-3 gap-3">
                  <Button
                    type="button"
                    variant={form.method === "cash" ? "default" : "outline"}
                    onClick={() => setForm((p) => ({ ...p, method: "cash" }))}
                    className="h-11 rounded-2xl font-black uppercase text-[11px] tracking-widest"
                  >
                    Cash
                  </Button>

                  <Button
                    type="button"
                    variant={form.method === "card" ? "default" : "outline"}
                    onClick={() => setForm((p) => ({ ...p, method: "card" }))}
                    className="h-11 rounded-2xl font-black uppercase text-[11px] tracking-widest"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Card
                  </Button>

                  <Button
                    type="button"
                    variant={form.method === "transfer" ? "default" : "outline"}
                    onClick={() =>
                      setForm((p) => ({ ...p, method: "transfer" }))
                    }
                    className="h-11 rounded-2xl font-black uppercase text-[11px] tracking-widest"
                  >
                    Transfer
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-8 flex gap-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-12 rounded-2xl px-6"
              >
                <X className="h-4 w-4 mr-2" />
                Bekor qilish
              </Button>

              <Button
                type="button"
                onClick={onSubmitPayment}
                disabled={saving}
                className="h-12 rounded-2xl px-8 font-black"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  "Saqlash"
                )}
              </Button>
            </DialogFooter>

            <p className="mt-4 text-[10px] text-muted-foreground font-semibold">
              ⚠️ Agar backend endpoint boshqacha bo‘lsa, faqat{" "}
              <span className="font-black">PAYMENT_CREATE_URL</span> ni moslab
              qo‘ying.
            </p>
          </DialogContent>
        </Dialog>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-white/80 dark:bg-slate-900/40 p-2 rounded-[1.8rem] border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <Input
            placeholder="Student / telefon / guruh bo‘yicha qidirish..."
            className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 font-bold"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="w-full lg:w-[220px]">
          <div className="relative">
            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="pl-11 h-12 rounded-2xl font-black bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>

        <div className="flex gap-2 w-full lg:w-auto justify-between lg:justify-end">
          <Badge className="bg-slate-100 dark:bg-indigo-500/10 py-2.5 px-6 rounded-2xl border font-black uppercase text-[10px] tracking-widest">
            <Users className="h-3.5 w-3.5 mr-2" />
            Jami: {filtered.length}
          </Badge>

          <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 py-2.5 px-6 rounded-2xl border border-indigo-100 font-black uppercase text-[10px] tracking-widest">
            <Wallet className="h-3.5 w-3.5 mr-2" />
            {safeNumber(
              filtered.reduce(
                (acc, row) => acc + safeNumber(pickDebt(row), 0),
                0,
              ),
              0,
            ).toLocaleString("ru-RU")}{" "}
            UZS
          </Badge>
        </div>
      </div>

      {/* TABLE */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-[#020617]/60 rounded-[2.5rem]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <tr className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-black">
                <th className="py-6 px-8 text-left">Talaba</th>
                <th className="text-left">Guruh</th>
                <th className="text-left">Miqdor</th>
                <th className="text-left">Oy</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-28 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
                    <p className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                      Yuklanmoqda...
                    </p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <p className="text-slate-400 font-black uppercase text-sm tracking-widest italic">
                      Qarzdorlar topilmadi
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => {
                  const st = pickStudent(row);
                  const gr = pickGroup(row);

                  const first = safeText(st?.first_name, "");
                  const last = safeText(st?.last_name, "");
                  const fullName =
                    `${first} ${last}`.trim() || safeText(st?.name, "—");
                  const phone = safeText(st?.phone, "—");
                  const groupName = safeText(
                    gr?.group_name ?? gr?.name ?? gr,
                    "—",
                  );
                  const debt = safeNumber(pickDebt(row), 0);

                  const initials =
                    `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() ||
                    "U";

                  return (
                    <tr
                      key={row?._id ?? st?._id ?? `${month}-${idx}`}
                      className="hover:bg-slate-50/80 dark:hover:bg-indigo-500/5 transition-colors"
                    >
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-600 text-white flex items-center justify-center font-black shadow-lg shadow-slate-900/10">
                            {initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[15px] font-black text-slate-900 dark:text-slate-100">
                              {fullName}
                            </span>
                            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                              {phone}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-6">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {groupName}
                        </span>
                      </td>

                      <td className="py-6">
                        <span className="inline-flex items-center rounded-2xl px-4 py-2 text-xs font-black tracking-widest bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border border-rose-100 dark:border-rose-500/20">
                          {debt.toLocaleString("ru-RU")} UZS
                        </span>
                      </td>

                      <td className="py-6">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                          {formatMonthLabel(month)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
