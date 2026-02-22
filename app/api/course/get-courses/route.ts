import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const is_freeze = url.searchParams.get("is_freeze") ?? "false";
  const search = url.searchParams.get("search") ?? "";

  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "https://admin-crm.onrender.com";

  // clientdan kelgan Authorization headerni olamiz
  const auth = req.headers.get("authorization") || "";

  const upstream = new URL(`${BASE_URL}/api/course/get-courses`);
  upstream.searchParams.set("is_freeze", is_freeze);
  if (search.trim()) upstream.searchParams.set("search", search.trim());

  const res = await fetch(upstream.toString(), {
    headers: {
      Accept: "application/json",
      ...(auth ? { Authorization: auth } : {}),
    },
    cache: "no-store",
  });

  const text = await res.text(); // JSON bo‘lmasa ham yiqilmasin

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
    },
  });
}
