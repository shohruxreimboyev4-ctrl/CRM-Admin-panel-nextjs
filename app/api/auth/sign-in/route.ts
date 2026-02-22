import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const res = await fetch("http://localhost:7070/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Login xatosi" },
        { status: res.status },
      );
    }

    const token = data.token;

    const response = NextResponse.json(
      { success: true, user: data.user },
      { status: 200 },
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
