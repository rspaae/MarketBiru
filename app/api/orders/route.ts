import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { dbCreateOrder, dbGetOrders } from "@/lib/filedb";
import { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatOrder(r: any): Order {
  return {
    id: r.id,
    orderCode: r.order_code || r.orderCode,
    studentName: r.student_name || r.studentName,
    studentClass: r.student_class || r.studentClass,
    whatsappNumber: r.whatsapp_number || r.whatsappNumber,
    deliveryMethod: r.delivery_method || r.deliveryMethod,
    deliveryFee: Number(r.delivery_fee ?? r.deliveryFee ?? 0),
    deliveryAddress: r.delivery_address || r.deliveryAddress,
    paymentMethod: r.payment_method || r.paymentMethod,
    paymentStatus: r.payment_status || r.paymentStatus,
    paymentProofUrl: r.payment_proof_url || r.paymentProofUrl,
    notes: r.notes,
    totalPrice: Number(r.total_price ?? r.totalPrice ?? 0),
    status: r.status,
    createdAt: r.created_at || r.createdAt,
    updatedAt: r.updated_at || r.updatedAt,
    items: (r.order_items || r.items || []).map((it: any) => ({
      id: it.id,
      productId: it.product_id || it.productId,
      productName: it.product_name || it.productName,
      price: Number(it.price),
      quantity: Number(it.quantity),
      subtotal: Number(it.subtotal),
    })),
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "100");

  let cloudOrders: any[] = [];
  let cloudError = null;

  try {
    let query = (supabase as any)
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
    if (error) cloudError = error;
    else if (data) cloudOrders = data;
  } catch (err: any) {
    cloudError = err;
  }

  // 1. If searching by code
  if (code) {
    if (cloudOrders.length > 0) {
      const formatted = formatOrder(cloudOrders[0]);
      dbCreateOrder(formatted);
      return NextResponse.json({ order: formatted });
    }

    // Check memory fallback
    const localMatches = dbGetOrders({ code });
    if (localMatches.length > 0) {
      return NextResponse.json({ order: localMatches[0] });
    }

    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  // 2. Listing orders
  if (cloudOrders.length > 0) {
    const formattedList = cloudOrders.map(formatOrder);
    formattedList.forEach((o) => dbCreateOrder(o));
    return NextResponse.json({ orders: formattedList });
  }

  // Fallback to local store
  const localList = dbGetOrders({ status: status || undefined, limit });
  return NextResponse.json({ orders: localList });
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

    // 1. Simpan ke Local Memory Store terlebih dahulu agar tidak pernah hilang
    const memoryOrder: Order = {
      id: orderId,
      orderCode,
      studentName,
      studentClass,
      whatsappNumber,
      deliveryMethod: deliveryMethod || "pickup",
      deliveryFee: deliveryFee || 0,
      deliveryAddress: deliveryAddress || undefined,
      paymentMethod: paymentMethod || "cash",
      paymentStatus: paymentStatus || "unpaid",
      notes: notes || undefined,
      totalPrice,
      status: status || "pending",
      createdAt: createdAt || new Date().toISOString(),
      items: items.map((item: any) => ({
        id: item.id || `oi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
    };
    dbCreateOrder(memoryOrder);

    // 2. Simpan ke Supabase Cloud
    try {
      await (supabase as any).from("orders").upsert({
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

      const orderItemsData = items.map((item: any) => ({
        id: item.id || `oi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        order_id: orderId,
        product_id: item.productId,
        product_name: item.productName,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));

      await (supabase as any).from("order_items").upsert(orderItemsData);
    } catch (cloudErr) {
      console.warn("Supabase order insert warning:", cloudErr);
    }

    return NextResponse.json({ success: true, orderCode });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal menyimpan pesanan" }, { status: 500 });
  }
}