import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

// PATCH /api/orders/[id] - Update status/payment pesanan
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = await req.json();
    const { status, paymentStatus, confirmPayment } = body;

    if (confirmPayment) {
      // Konfirmasi pembayaran transfer
      await query<ResultSetHeader>(
        `UPDATE orders 
         SET payment_status = 'paid', 
             status = IF(status = 'pending', 'processing', status),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [id]
      );
    } else {
      const fields: string[] = [];
      const values: (string | null)[] = [];

      if (status) {
        fields.push('status = ?');
        values.push(status);
      }
      if (paymentStatus) {
        fields.push('payment_status = ?');
        values.push(paymentStatus);
      }

      if (!fields.length) {
        return NextResponse.json({ error: 'Tidak ada field yang diupdate' }, { status: 400 });
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      await query<ResultSetHeader>(
        `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Fetch updated order
    const rows = await query<RowDataPacket[]>(
      `SELECT o.*, 
        GROUP_CONCAT(
          JSON_OBJECT(
            'id', oi.id,
            'productId', oi.product_id,
            'productName', oi.product_name,
            'price', oi.price,
            'quantity', oi.quantity,
            'subtotal', oi.subtotal
          ) ORDER BY oi.id
        ) as items_json
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = ?
       GROUP BY o.id`,
      [id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: formatOrder(rows[0]) });
  } catch (err: any) {
    console.error('Orders PATCH error:', err);
    return NextResponse.json({ error: err.message || 'Gagal update pesanan' }, { status: 500 });
  }
}

// DELETE /api/orders/[id] - Hapus pesanan
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    // order_items will cascade delete if FK is set, otherwise delete manually
    await query<ResultSetHeader>('DELETE FROM order_items WHERE order_id = ?', [id]);
    await query<ResultSetHeader>('DELETE FROM orders WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Orders DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Gagal hapus pesanan' }, { status: 500 });
  }
}

function formatOrder(row: RowDataPacket) {
  let items = [];
  try {
    if (row.items_json) {
      items = JSON.parse(`[${row.items_json}]`);
    }
  } catch (_) {}

  return {
    id: row.id,
    orderCode: row.order_code,
    studentName: row.student_name,
    studentClass: row.student_class,
    whatsappNumber: row.whatsapp_number,
    deliveryMethod: row.delivery_method,
    deliveryFee: Number(row.delivery_fee),
    deliveryAddress: row.delivery_address,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    paymentProofUrl: row.payment_proof_url,
    notes: row.notes,
    totalPrice: Number(row.total_price),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items,
  };
}
