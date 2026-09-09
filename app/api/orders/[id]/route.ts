import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { dbUpdateOrder, dbDeleteOrder, dbGetOrderById } from "@/lib/filedb";

export const dynamic = "force-dynamic";

function formatOrder(r: any) {
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
    items: r.order_items || r.items || [],
  };
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await req.json();
    const { status, paymentStatus, confirmPayment } = body;

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (confirmPayment) {
      updates.payment_status = "paid";
      try {
        const { data: existing } = await (supabase as any)
          .from("orders")
          .select("status")
          .eq("id", id)
          .single();
        if (existing?.status === "pending") updates.status = "processing";
      } catch (e) {}
    } else {
      if (status) updates.status = status;
      if (paymentStatus) updates.payment_status = paymentStatus;
    }

    // Update memory store
    const localUpdated = dbUpdateOrder(id, {
      ...(updates.status ? { status: updates.status } : {}),
      ...(updates.payment_status ? { paymentStatus: updates.payment_status } : {}),
    });

    // Update Supabase
    try {
      const { data, error } = await (supabase as any)
        .from("orders")
        .update(updates)
        .eq("id", id)
        .select("*, order_items(*)")
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, order: formatOrder(data) });
      }
    } catch (e) {}

    if (localUpdated) {
      return NextResponse.json({ success: true, order: localUpdated });
    }

    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal update pesanan" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    dbDeleteOrder(id);
    try {
      await (supabase as any).from("orders").delete().eq("id", id);
    } catch (e) {}
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal hapus pesanan" }, { status: 500 });
  }
}