import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function formatOrder(r: any) {
  return {
    id: r.id,
    orderCode: r.order_code,
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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await req.json();
    const { status, paymentStatus, confirmPayment } = body;

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (confirmPayment) {
      updates.payment_status = "paid";
      // Cek status sebelumnya untuk auto-advance
      const { data: existing } = await supabase.from("orders").select("status").eq("id", id).single();
      if (existing?.status === "pending") updates.status = "processing";
    } else {
      if (status) updates.status = status;
      if (paymentStatus) updates.payment_status = paymentStatus;
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select("*, order_items(*)")
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });

    return NextResponse.json({ success: true, order: formatOrder(data) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal update pesanan" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    // order_items CASCADE delete otomatis via FK
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal hapus pesanan" }, { status: 500 });
  }
}