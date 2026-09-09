import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // 1. Seed Categories
    for (const cat of INITIAL_CATEGORIES) {
      await (supabase as any).from("categories").upsert({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || "",
        icon: cat.icon || "Tag",
      });
    }

    // 2. Seed Products
    for (const p of INITIAL_PRODUCTS) {
      await (supabase as any).from("products").upsert({
        id: p.id,
        category_id: p.categoryId,
        name: p.name,
        slug: p.slug,
        description: p.description || "",
        price: p.price,
        stock: p.stock,
        image: p.image || "",
        unit: p.unit || "pcs",
        is_active: p.isActive,
      });
    }

    // 3. Seed Default Admin
    const defaultPassword = await hashPassword("admin123");
    await (supabase as any).from("users").upsert([
      {
        id: "1",
        name: "Administrator Koperasi",
        username: "admin",
        email: "admin@smkn11bdg.sch.id",
        password: defaultPassword,
        role: "admin",
        whatsapp: "081234567890",
      },
      {
        id: "2",
        name: "Petugas Kasir 11",
        username: "kasir",
        email: "kasir@smkn11bdg.sch.id",
        password: defaultPassword,
        role: "kasir",
        whatsapp: "081234567891",
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Database Supabase Cloud terhubung dan data berhasil disinkronisasi!",
    });
  } catch (error: any) {
    console.error("Error DB Init:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Gagal sinkronisasi Supabase: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
