"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Calendar, Loader2, Mail, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getToken } from "@/lib/auth-store";
import { useAuthUser } from "@/app/hooks/useAuthUser";
function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export default function ProfilePage() {
  const { user, loading, setUserEverywhere, refresh } = useAuthUser();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070";
  const EDIT_PROFILE_URL = `${BASE_URL}/api/auth/edit-profile`;

  const token = useMemo(() => getToken(), []);

  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    setFirstName(user?.first_name || "");
    setLastName(user?.last_name || "");
    setEmail(user?.email || "");
  }, [user?.first_name, user?.last_name, user?.email]);

  const onSave = useCallback(async () => {
    if (!token) {
      alert("Token topilmadi. Qayta login qiling.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(EDIT_PROFILE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || "Profilni yangilashda xatolik");
        return;
      }

      const updated = data?.user || data?.data || data?.result || null;

      if (updated && typeof updated === "object") {
        setUserEverywhere({ ...user, ...updated });
      } else {
        setUserEverywhere({
          ...(user || {}),
          first_name: firstName,
          last_name: lastName,
          email,
        });
        refresh();
      }

      alert("Yangilandi ✅");
    } catch (e) {
      console.error(e);
      alert("Network xatolik");
    } finally {
      setSaving(false);
    }
  }, [
    token,
    EDIT_PROFILE_URL,
    firstName,
    lastName,
    email,
    user,
    setUserEverywhere,
    refresh,
  ]);

  const avatarSrc = user?.image || "/avatar.png";

  return (
    <div className="p-4 sm:p-8 space-y-8 min-h-screen bg-slate-50/30 dark:bg-transparent">
      {loading ? (
        <div className="py-28 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-500" />
        </div>
      ) : (
        <>
          <Card className="rounded-[2.5rem] border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative h-20 w-20 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100">
                  <Image
                    src={avatarSrc}
                    alt="avatar"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {(user?.first_name || "—") + " " + (user?.last_name || "")}
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                    <Mail className="h-4 w-4" />
                    {user?.email || "—"}
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                    <Calendar className="h-4 w-4" />
                    Qo&apos;shilgan: {formatDate(user?.createdAt)}
                  </div>
                </div>
              </div>

              <Badge className="bg-rose-500 text-white rounded-xl px-4 py-2 font-black uppercase w-fit">
                {user?.role || "USER"}
              </Badge>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Profil ma&apos;lumotlari
              </h2>
              <p className="text-sm text-slate-500 font-semibold">
                O&apos;zgartirish kiritib, backendga yuborasiz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Ism
                </label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-12 rounded-2xl font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Familiya
                </label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-12 rounded-2xl font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Email
                </label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-2xl font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Rol
                </label>
                <Input
                  value={user?.role || ""}
                  disabled
                  className="h-12 rounded-2xl font-bold opacity-80"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={onSave}
                disabled={saving}
                className="rounded-2xl font-black"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    O&apos;zgartirish
                  </>
                )}
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
