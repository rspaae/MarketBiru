import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

// GET /api/orders - Ambil semua pesanan (admin/kasir), atau filter by ?code=
// GET /api/orders?code=MB11-xxx - Lookup satu pesanan berdasarkan kode
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    if (code) {
      // Lookup satu order berdasarkan order_code
      const orders = await query<RowDataPacket[]>(
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
         WHERE o.order_code = ?
         GROUP BY o.id
         LIMIT 1`,
        [code.toUpperCase()]
      );

      if (!orders.length) {
        return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
      }

      const order = formatOrder(orders[0]);
      return NextResponse.json({ order });
    }

    // Ambil semua orders dengan filter status opsional
    let sql = `SELECT o.*, 
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
       LEFT JOIN order_items oi ON oi.order_id = o.id`;

    const params: string[] = [];
    if (status && status !== 'all') {
      sql += ' WHERE o.status = ?';
      params.push(status);
    }

    sql += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT ${limit}`;

    const orders = await query<RowDataPacket[]>(sql, params);
    return NextResponse.json({ orders: orders.map(formatOrder) });
  } catch (err: any) {
    console.error('Orders GET error:', err);
    return NextResponse.json({ error: err.message || 'Database error' }, { status: 500 });
  }
}

// POST /api/orders - Buat pesanan baru (dari checkout siswa)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      orderCode,
      userId,
      studentName,
      studentClass,
      whatsappNumber,
      deliveryMethod,
      deliveryFee,
      deliveryAddress,
      paymentMethod,
      paymentStatus,
      notes,
      totalPrice,
      status,
      items,
      createdAt,
    } = body;

    if (!orderCode || !studentName || !studentClass || !items?.length) {
      return NextResponse.json({ error: 'Data pesanan tidak lengkap' }, { status: 400 });
    }

    // Insert main order
    await query<ResultSetHeader>(
      `INSERT INTO orders 
        (id, order_code, user_id, student_name, student_class, whatsapp_number, 
         delivery_method, delivery_fee, delivery_address, payment_method, payment_status, 
         notes, total_price, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         student_name = VALUES(student_name),
         student_class = VALUES(student_class),
         updated_at = CURRENT_TIMESTAMP`,
      [
        id,
        orderCode,
        userId || null,
        studentName,
        studentClass,
        whatsappNumber,
        deliveryMethod || 'pickup',
        deliveryFee || 0,
        deliveryAddress || null,
        paymentMethod || 'cash',
        paymentStatus || 'unpaid',
        notes || null,
        totalPrice,
        status || 'pending',
        createdAt ? new Date(createdAt) : new Date(),
      ]
    );

    // Insert order items
    for (const item of items) {
      await query<ResultSetHeader>(
        `INSERT IGNORE INTO order_items 
          (id, order_id, product_id, product_name, price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id || `oi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          id,
          item.productId,
          item.productName,
          item.price,
          item.quantity,
          item.subtotal,
        ]
      );
    }

    return NextResponse.json({ success: true, orderCode });
  } catch (err: any) {
    console.error('Orders POST error:', err);
    return NextResponse.json({ error: err.message || 'Gagal menyimpan pesanan' }, { status: 500 });
  }
}

// Helper: format row dari MySQL menjadi objek Order yang konsisten dengan lib/types
function formatOrder(row: RowDataPacket) {
  let items = [];
  try {
    if (row.items_json) {
      // GROUP_CONCAT returns a string, parse it as JSON array
      items = JSON.parse(`[${row.items_json}]`);
    }
  } catch (_) {}

  return {
    id: row.id,
    orderCode: row.order_code,
    userId: row.user_id,
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
