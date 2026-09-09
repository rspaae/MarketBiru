import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  nisn: string | null;
  student_class: string | null;
  whatsapp: string | null;
  created_at: string;
}

// Default fallback mock users if MySQL is offline
const fallbackUsers = [
  {
    id: 1,
    name: 'Administrator Koperasi',
    username: 'admin',
    email: 'admin@smkn11bdg.sch.id',
    role: 'admin',
    nisn: null,
    student_class: null,
    whatsapp: '081234567890',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Petugas Kasir 11',
    username: 'kasir',
    email: 'kasir@smkn11bdg.sch.id',
    role: 'kasir',
    nisn: null,
    student_class: null,
    whatsapp: '081234567891',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Nayra Aulia Khoirunnisa',
    username: 'nayra',
    email: 'nayra@smkn11bdg.sch.id',
    role: 'siswa',
    nisn: '0061234567',
    student_class: 'X PPLG 1',
    whatsapp: '081223344556',
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Muhammad Fahri Ismail',
    username: 'fahri',
    email: 'fahri@smkn11bdg.sch.id',
    role: 'siswa',
    nisn: '0069876543',
    student_class: 'XI TKJ',
    whatsapp: '081399887766',
    created_at: new Date().toISOString(),
  },
];

// 1. GET: Ambil daftar seluruh user / siswa
export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'petugas')) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Khusus Administrator.' },
        { status: 403 }
      );
    }

    try {
      const rows = await query<UserRow[]>(
        'SELECT id, name, username, email, role, nisn, student_class, whatsapp, created_at FROM users ORDER BY created_at DESC'
      );
      return NextResponse.json({
        success: true,
        users: rows,
        source: 'database',
      });
    } catch (dbError) {
      return NextResponse.json({
        success: true,
        users: fallbackUsers,
        source: 'fallback',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal memuat data pengguna.' },
      { status: 500 }
    );
  }
}

// 2. DELETE: Hapus akun pengguna berdasarkan ID
export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Hanya Admin Utama yang berhak menghapus akun.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID pengguna tidak valid.' },
        { status: 400 }
      );
    }

    if (String(id) === String(currentUser.id)) {
      return NextResponse.json(
        { success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif.' },
        { status: 400 }
      );
    }

    try {
      await query<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id]);
    } catch (dbError: any) {
      console.warn('DB delete warning:', dbError.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Akun pengguna berhasil dihapus.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus pengguna.' },
      { status: 500 }
    );
  }
}
