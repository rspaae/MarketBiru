import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "petugas")) {
    return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, name, username, email, role, nisn, student_class, whatsapp, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ success: false, message: "Gagal memuat data pengguna." }, { status: 500 });

  return NextResponse.json({ success: true, users: data || [], source: "supabase" });
}

export async function DELETE(req: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ success: false, message: "Hanya Admin yang berhak menghapus akun." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ success: false, message: "ID tidak valid." }, { status: 400 });
  if (String(id) === String(currentUser.id)) {
    return NextResponse.json({ success: false, message: "Tidak bisa menghapus akun sendiri." }, { status: 400 });
  }

  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) return NextResponse.json({ success: false, message: "Gagal menghapus pengguna." }, { status: 500 });

  return NextResponse.json({ success: true, message: "Akun berhasil dihapus." });
}