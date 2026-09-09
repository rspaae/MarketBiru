/**
 * lib/supabase.ts
 * Supabase client singleton untuk API Routes (Server-side)
 * Digunakan oleh semua route handler sebagai pengganti MySQL.
 */
import { createClient } from "@supabase/supabase-js";

// Singleton lazy Supabase client
declare global {
  // eslint-disable-next-line no-var
  var __supabase: any;
}

export function getSupabase(): any {
  if (!global.__supabase) {
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wjgrgaxouxzglxcphdoz.supabase.co";
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      "sb_publishable__XdrdbSU4GDyap9FKwQlPA_I_Yvoxy8";
    global.__supabase = createClient<any>(url, key);
  }
  return global.__supabase;
}

export const supabase: any = new Proxy(
  {},
  {
    get(_target, prop) {
      return getSupabase()[prop];
    },
  }
);