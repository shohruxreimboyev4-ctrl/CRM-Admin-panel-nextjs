"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AuthUser,
  getToken,
  readUserCache,
  subscribeUser,
  writeUserCache,
} from "@/lib/auth-store";

// ✅ app/hooks ichida tursa ham ishlaydi
export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const token = useMemo(() => getToken(), []);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070";

  // ✅ BU YERGA TOPBAR ishlatayotgan user info endpointni qo'yasan
  // Masalan: /api/staff/info/:id yoki /api/auth/profile va h.k
  const USER_INFO_URL = `${BASE_URL}/api/staff/info`; // 🔁 SHUNI 1 TA ishlaydigan URL ga almashtir

  const refresh = useCallback(async () => {
    setLoading(true);

    // 1) cache’dan
    const cached = readUserCache();
    if (cached) setUser(cached);

    // 2) backend’dan (agar ishlasa)
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(USER_INFO_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      const u = (data?.user || data?.data || data?.result || data) as AuthUser;

      if (u && typeof u === "object") {
        setUser(u);
        writeUserCache(u);
      }
    } catch {
      // jim
    } finally {
      setLoading(false);
    }
  }, [USER_INFO_URL, token]);

  useEffect(() => {
    // birinchi ochilganda
    setUser(readUserCache());
    setLoading(false);

    // event bilan sync
    const unsub = subscribeUser(() => {
      setUser(readUserCache());
    });

    // backend’dan ham yangilashga urinamiz
    refresh();

    return unsub;
  }, [refresh]);

  const setUserEverywhere = useCallback((u: AuthUser | null) => {
    setUser(u);
    writeUserCache(u);
  }, []);

  return { user, loading, refresh, setUserEverywhere };
}
