/**
 * lib/db.ts
 * Supabase DB interface
 */
import { supabase } from "@/lib/supabase";

export { supabase };

export async function testConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const { error } = await (supabase as any).from("products").select("count").limit(1);
    if (error) throw error;
    return { connected: true, message: "Koneksi Supabase PostgreSQL Cloud terhubung dengan sukses!" };
  } catch (error: any) {
    return {
      connected: false,
      message: `Gagal terhubung ke Supabase Cloud: ${error.message}.`,
    };
  }
}
