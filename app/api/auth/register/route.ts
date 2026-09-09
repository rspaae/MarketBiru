import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hashPassword, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, username, email, password, student_class, nisn, whatsapp, role = "siswa", autoLogin = true } = body;

    if (!name || !username || !password) {
      return NextResponse.json({ success: false, message: "Nama, username, dan password wajib diisi!" }, { status: 400 });
    }

    if (role === "siswa" && !student_class) {
      return NextResponse.json({ success: false, message: "Pilihan kelas wajib dipilih!" }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, "");
    const cleanEmail = (email || `${cleanUsername}@siswa.smkn11bdg.sch.id`).trim().toLowerCase();

    // Cek duplikat
    const { data: existing } = await (supabase as any)
      .from("users")
      .select("id")
      .or(`username.eq.${cleanUsername},email.eq.${cleanEmail}${nisn ? `,nisn.eq.${nisn}` : ""}`)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: false, message: "Username, Email, atau NISN sudah terdaftar." }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const { data: newUser, error } = await (supabase as any)
      .from("users")
      .insert({
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        role,
        nisn: nisn ? nisn.trim() : null,
        student_class: student_class || null,
        whatsapp: whatsapp ? whatsapp.trim() : null,
      })
      .select()
      .single();

    if (error) throw error;

    const authUser = {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role as "admin" | "petugas" | "kasir" | "siswa",
      nisn: newUser.nisn || undefined,
      student_class: newUser.student_class || undefined,
      whatsapp: newUser.whatsapp || undefined,
    };

    const response = NextResponse.json({ success: true, message: `Akun ${name} berhasil didaftarkan!`, user: authUser });

    if (autoLogin) {
      const token = await createSessionToken(authUser);
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Terjadi kesalahan sistem." }, { status: 500 });
  }
}