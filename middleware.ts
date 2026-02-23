import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/", "/_not-found"];

function isPublicFile(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".map") ||
    pathname.endsWith(".txt") ||
    pathname.endsWith(".xml")
  );
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

function getToken(req: NextRequest) {
  return (
    req.cookies.get("access_token")?.value ||
    req.cookies.get("accessToken")?.value ||
    req.cookies.get("token")?.value ||
    req.cookies.get("jwt")?.value
  );
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (isPublicFile(pathname)) return NextResponse.next();

  if (isPublicPath(pathname)) return NextResponse.next();

  const token = getToken(req);

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";

    if (pathname !== "/login") {
      url.searchParams.set("next", pathname + search);
    }

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
