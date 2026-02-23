"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";

type LoginStatus = "idle" | "loading" | "success" | "error";

export default function LoginClient() {
  const router = useRouter();
  const search = useSearchParams();
  const nextPath = search.get("next") || "/";

  const [status, setStatus] = useState<LoginStatus>("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    setStatus("loading");

    try {
      // ✅ MUHIM: Relative URL — NEXT_PUBLIC_BASE_URL kerak emas
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data?.message || "Xatolik yuz berdi");
        return;
      }

      // Server route token + user qaytaryapti (sen route.ts’da shunday qilding)
      // Cookie serverda httpOnly set bo’lgani uchun clientda setCookie qilish shart emas.
      // Lekin UI/behavior buzilmasin deb, oldingi logikani saqlamaymiz — shunchaki redirect qilamiz.
      setStatus("success");
      router.replace(nextPath);
    } catch {
      setStatus("error");
      setErrorMsg("Server bilan aloqa uzildi.");
    }
  }

  const loading = status === "loading";

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#f8fafc] dark:bg-[#020617] overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-500/10 dark:bg-purple-500/20 blur-[120px]" />
      </div>

      <div className="absolute top-6 right-6 z-20">
        <ModeToggle />
      </div>

      <div className="w-full max-w-[420px] z-10 animate-in fade-in zoom-in duration-500">
        <Card className="border border-white/40 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-950 dark:bg-indigo-600 mb-4 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform">
                <span className="text-white text-xl font-black">CRM</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Xush kelibsiz
              </h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
                Ma&apos;lumotlaringizni kiriting
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              name="login-form"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1"
                >
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="example@crm.uz"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="h-12 pl-11 rounded-2xl border-slate-200/60 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1"
                >
                  Parol
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="h-12 pl-11 pr-11 rounded-2xl border-slate-200/60 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {status === "error" && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-xs animate-in slide-in-from-top-1">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p className="font-semibold">{errorMsg}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center">
                    Tizimga kirish <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Xavfsiz ulanish yoqilgan 🔒
            </div>
          </div>
        </Card>

        <p className="mt-8 text-center text-[10px] text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase font-bold">
          © 2026 NextGen CRM Solution
        </p>
      </div>
    </div>
  );
}
