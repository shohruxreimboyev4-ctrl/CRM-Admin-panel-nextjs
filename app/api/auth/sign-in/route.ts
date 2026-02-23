import { NextResponse } from "next/server";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email va parol kerak" },
        { status: 400 },
      );
    }

    if (!API_URL) {
      return NextResponse.json(
        { message: "NEXT_PUBLIC_API_URL env topilmadi" },
        { status: 500 },
      );
    }

    const res = await fetch(`${API_URL}/api/auth/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Login xatosi" },
        { status: res.status },
      );
    }

    const token = data?.token || data?.access_token || data?.data?.token;
    const user = data?.user || data?.data?.user || data?.data || null;

    if (!token) {
      return NextResponse.json(
        { message: "Token kelmadi (backend javobini tekshiring)" },
        { status: 500 },
      );
    }

    const response = NextResponse.json(
      { success: true, token, user },
      { status: 200 },
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json(
      { message: "Server bilan aloqa uzildi" },
      { status: 500 },
    );
  }
}
