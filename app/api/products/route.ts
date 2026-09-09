import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { INITIAL_PRODUCTS } from '@/lib/data';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

// GET /api/products - Ambil semua produk dari MySQL
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('category');
  const activeOnly = searchParams.get('active') === 'true';

  try {
    let sql = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
    `;
    const params: string[] = [];
    const conditions: string[] = [];

    if (categoryId && categoryId !== 'all') {
      conditions.push('p.category_id = ?');
      params.push(categoryId);
    }

    if (activeOnly) {
      conditions.push('p.is_active = 1');
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY p.created_at DESC';

    const rows = await query<RowDataPacket[]>(sql, params);

    const products = rows.map((r) => ({
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
      createdAt: r.created_at,
    }));

    return NextResponse.json({ success: true, products, source: 'database' });
  } catch (err: any) {
    console.warn('Fallback ke data lokal untuk produk:', err.message);
    return NextResponse.json({ success: true, products: INITIAL_PRODUCTS, source: 'fallback' });
  }
}

// POST /api/products - Tambah produk baru
export async function POST(req: NextRequest) {
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

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json({ error: 'Nama, kategori, dan harga wajib diisi' }, { status: 400 });
    }

    const id = `prod-${Date.now()}`;
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Math.random().toString(36).slice(2, 6)}`;

    await query<ResultSetHeader>(
      `INSERT INTO products 
        (id, category_id, name, slug, description, price, stock, image, unit, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        categoryId,
        name.trim(),
        slug,
        description || '',
        price || 0,
        stock || 0,
        image || '',
        unit || 'pcs',
        isActive === false ? 0 : 1,
      ]
    );

    return NextResponse.json({
      success: true,
      product: {
        id,
        categoryId,
        name: name.trim(),
        slug,
        description: description || '',
        price: Number(price),
        stock: Number(stock),
        image: image || '',
        unit: unit || 'pcs',
        isActive: isActive !== false,
      },
    });
  } catch (err: any) {
    console.error('Products POST error:', err);
    return NextResponse.json({ error: err.message || 'Gagal menambah produk' }, { status: 500 });
  }
}
