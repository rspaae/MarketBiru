import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { INITIAL_CATEGORIES } from "@/lib/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("category");
  const activeOnly = searchParams.get("active") === "true";

  let query = (supabase as any)
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  if (categoryId && categoryId !== "all") query = query.eq("category_id", categoryId);
  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;

  if (error) {
    const { INITIAL_PRODUCTS } = await import("@/lib/data");
    return NextResponse.json({ success: true, products: INITIAL_PRODUCTS, source: "fallback" });
  }

  const products = (data || []).map((r: any) => ({
    id: r.id,
    categoryId: r.category_id,
    categoryName: r.categories?.name || INITIAL_CATEGORIES.find((c) => c.id === r.category_id)?.name || "",
    name: r.name,
    slug: r.slug,
    description: r.description || "",
    price: Number(r.price),
    stock: Number(r.stock),
    image: r.image || "",
    unit: r.unit || "pcs",
    isActive: Boolean(r.is_active),
  }));

  return NextResponse.json({ success: true, products, source: "supabase" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, categoryId, price, stock, unit, description, image, isActive } = body;

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json({ error: "Nama, kategori, dan harga wajib diisi" }, { status: 400 });
    }

    const id = `prod-${Date.now()}`;
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Math.random().toString(36).slice(2, 6)}`;
    const categoryName = INITIAL_CATEGORIES.find((c) => c.id === categoryId)?.name || "";

    const { data, error } = await (supabase as any)
      .from("products")
      .insert({ id, category_id: categoryId, name: name.trim(), slug, description: description || "", price: Number(price), stock: Number(stock) || 0, image: image || "", unit: unit || "pcs", is_active: isActive !== false })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product: { id: data.id, categoryId: data.category_id, categoryName, name: data.name, slug: data.slug, description: data.description || "", price: Number(data.price), stock: Number(data.stock), image: data.image || "", unit: data.unit || "pcs", isActive: Boolean(data.is_active) } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal menambah produk" }, { status: 500 });
  }
}