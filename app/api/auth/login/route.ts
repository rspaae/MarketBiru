import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyPassword, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

interface UserRow {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  role: "admin" | "petugas" | "kasir" | "siswa";
  nisn?: string | null;
  student_class?: string | null;
  whatsapp?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username dan password wajib diisi!" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, name, username, email, password, role, nisn, student_class, whatsapp")
      .or(`username.eq.${username},email.eq.${username},nisn.eq.${username}`)
      .limit(1);

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: false, message: "Username atau password salah." }, { status: 401 });
    }

    const dbUser = data[0] as UserRow;
    const isValid = await verifyPassword(password, dbUser.password);

    if (!isValid) {
      return NextResponse.json({ success: false, message: "Username atau password salah." }, { status: 401 });
    }

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role,
      nisn: dbUser.nisn || undefined,
      student_class: dbUser.student_class || undefined,
      whatsapp: dbUser.whatsapp || undefined,
    };

    const token = await createSessionToken(user);
    const response = NextResponse.json({ success: true, message: `Selamat datang, ${user.name}!`, user });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan sistem." }, { status: 500 });
  }
}