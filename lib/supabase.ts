/**
 * lib/supabase.ts
 * Supabase client singleton untuk API Routes (Server-side)
 * Digunakan oleh semua route handler sebagai pengganti MySQL.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wjgrgaxouxzglxcphdoz.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable__XdrdbSU4GDyap9FKwQlPA_I_Yvoxy8";

// Singleton untuk mencegah multiple instance di Next.js hot reload
declare global {
  // eslint-disable-next-line no-var
  var __supabase: any;
}

export const supabase: any =
  global.__supabase ??
  createClient<any>(supabaseUrl, supabaseKey);

if (process.env.NODE_ENV !== "production") {
  global.__supabase = supabase;
}