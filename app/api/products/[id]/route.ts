import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { INITIAL_CATEGORIES } from "@/lib/data";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await req.json();
    const { name, categoryId, price, stock, unit, description, image, isActive } = body;

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name.trim();
    if (categoryId !== undefined) updates.category_id = categoryId;
    if (price !== undefined) updates.price = Number(price);
    if (stock !== undefined) updates.stock = Number(stock);
    if (unit !== undefined) updates.unit = unit;
    if (description !== undefined) updates.description = description;
    if (image !== undefined) updates.image = image;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select("*, categories(name)")
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });

    return NextResponse.json({
      success: true,
      product: {
        id: data.id,
        categoryId: data.category_id,
        categoryName: (data as any).categories?.name || "",
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        price: Number(data.price),
        stock: Number(data.stock),
        image: data.image || "",
        unit: data.unit || "pcs",
        isActive: Boolean(data.is_active),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal update produk" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal menghapus produk" }, { status: 500 });
  }
}