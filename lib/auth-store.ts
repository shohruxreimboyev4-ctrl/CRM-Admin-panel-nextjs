export type AuthUser = {
  _id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  image?: string | null;
  createdAt?: string;
};

const LS_KEY = "crm_auth_user_v1";
const EVT = "crm-auth-user-updated";

export function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function getToken() {
  return (
    getCookie("token") || getCookie("accessToken") || getCookie("access_token")
  );
}

export function readUserCache(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function writeUserCache(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (!user) localStorage.removeItem(LS_KEY);
    else localStorage.setItem(LS_KEY, JSON.stringify(user));
  } catch {}
  window.dispatchEvent(new Event(EVT));
}

export function subscribeUser(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}
