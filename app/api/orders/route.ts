import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function formatOrder(r: any) {
  return {
    id: r.id,
    orderCode: r.order_code,
    userId: r.user_id,
    studentName: r.student_name,
    studentClass: r.student_class,
    whatsappNumber: r.whatsapp_number,
    deliveryMethod: r.delivery_method,
    deliveryFee: Number(r.delivery_fee),
    deliveryAddress: r.delivery_address,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    paymentProofUrl: r.payment_proof_url,
    notes: r.notes,
    totalPrice: Number(r.total_price),
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    items: r.order_items || [],
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "100");

  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (code) {
    query = query.eq("order_code", code.toUpperCase());
  } else if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (code) {
    if (!data || data.length === 0)
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ order: formatOrder(data[0]) });
  }

  return NextResponse.json({ orders: (data || []).map(formatOrder) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id, orderCode, userId, studentName, studentClass, whatsappNumber,
      deliveryMethod, deliveryFee, deliveryAddress, paymentMethod, paymentStatus,
      notes, totalPrice, status, items, createdAt,
    } = body;

    if (!orderCode || !studentName || !studentClass || !items?.length) {
      return NextResponse.json({ error: "Data pesanan tidak lengkap" }, { status: 400 });
    }

    const orderId = id || `order-${Date.now()}`;

    const { error: orderError } = await supabase.from("orders").upsert({
      id: orderId,
      order_code: orderCode,
      user_id: userId || null,
      student_name: studentName,
      student_class: studentClass,
      whatsapp_number: whatsappNumber,
      delivery_method: deliveryMethod || "pickup",
      delivery_fee: deliveryFee || 0,
      delivery_address: deliveryAddress || null,
      payment_method: paymentMethod || "cash",
      payment_status: paymentStatus || "unpaid",
      notes: notes || null,
      total_price: totalPrice,
      status: status || "pending",
      created_at: createdAt || new Date().toISOString(),
    });

    if (orderError) throw orderError;

    // Insert order items
    const orderItemsData = items.map((item: any) => ({
      id: item.id || `oi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      order_id: orderId,
      product_id: item.productId,
      product_name: item.productName,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase.from("order_items").upsert(orderItemsData);
    if (itemsError) throw itemsError;

    return NextResponse.json({ success: true, orderCode });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal menyimpan pesanan" }, { status: 500 });
  }
}