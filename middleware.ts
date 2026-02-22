import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"]; // ochiq sahifalar

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Next static/api fayllarni tepmaymiz
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // login sahifasi ochiq
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // ✅ token cookie nomi (SENDA QANDAY BO‘LSA SHUNI QO‘Y!)
  const token =
    req.cookies.get("token")?.value ||
    req.cookies.get("access_token")?.value ||
    req.cookies.get("accessToken")?.value;

  // token yo‘q -> login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname); // qaytib kelish uchun
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // hamma sahifalarda ishlasin (api/_next dan tashqari)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
