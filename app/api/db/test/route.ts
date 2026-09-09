import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase.from("products").select("count").limit(1);
    if (error) throw error;
    return NextResponse.json({ connected: true, message: "Koneksi Supabase berhasil!", source: "supabase" });
  } catch (err: any) {
    return NextResponse.json({ connected: false, message: err.message || "Gagal koneksi Supabase." }, { status: 500 });
  }
}