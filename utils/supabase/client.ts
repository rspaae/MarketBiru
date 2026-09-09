import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wjgrgaxouxzglxcphdoz.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable__XdrdbSU4GDyap9FKwQlPA_I_Yvoxy8";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );