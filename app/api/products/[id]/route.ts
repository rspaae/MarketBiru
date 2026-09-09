import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

// PUT /api/products/[id] - Update produk
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = await req.json();
    const {
      name,
      categoryId,
      price,
      stock,
      unit,
      description,
      image,
      isActive,
    } = body;

    const fields: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name.trim());
    }
    if (categoryId !== undefined) {
      fields.push('category_id = ?');
      values.push(categoryId);
    }
    if (price !== undefined) {
      fields.push('price = ?');
      values.push(Number(price));
    }
    if (stock !== undefined) {
      fields.push('stock = ?');
      values.push(Number(stock));
    }
    if (unit !== undefined) {
      fields.push('unit = ?');
      values.push(unit);
    }
    if (description !== undefined) {
      fields.push('description = ?');
      values.push(description);
    }
    if (image !== undefined) {
      fields.push('image = ?');
      values.push(image);
    }
    if (isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(isActive ? 1 : 0);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data yang diubah' }, { status: 400 });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await query<ResultSetHeader>(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated
    const rows = await query<RowDataPacket[]>(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON c.id = p.category_id 
       WHERE p.id = ? LIMIT 1`,
      [id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    const r = rows[0];
    return NextResponse.json({
      success: true,
      product: {
        id: r.id,
        categoryId: r.category_id,
        categoryName: r.category_name || '',
        name: r.name,
        slug: r.slug,
        description: r.description || '',
        price: Number(r.price),
        stock: Number(r.stock),
        image: r.image || '',
        unit: r.unit || 'pcs',
        isActive: Boolean(r.is_active),
      },
    });
  } catch (err: any) {
    console.error('Products PUT error:', err);
    return NextResponse.json({ error: err.message || 'Gagal update produk' }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Hapus produk
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await query<ResultSetHeader>('DELETE FROM products WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Products DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Gagal menghapus produk' }, { status: 500 });
  }
}
