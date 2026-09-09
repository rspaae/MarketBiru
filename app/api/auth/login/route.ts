import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, createSessionToken, AUTH_COOKIE_NAME, AuthUser } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'petugas' | 'kasir' | 'siswa';
  nisn?: string;
  student_class?: string;
  whatsapp?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username / NISN / Email dan password wajib diisi!' },
        { status: 400 }
      );
    }

    let user: AuthUser | null = null;
    let isPasswordValid = false;

    try {
      // 1. Coba verifikasi user dari database MySQL Laragon
      const rows = await query<UserRow[]>(
        'SELECT id, name, username, email, password, role, nisn, student_class, whatsapp FROM users WHERE username = ? OR email = ? OR nisn = ? LIMIT 1',
        [username, username, username]
      );

      if (rows && rows.length > 0) {
        const dbUser = rows[0];
        isPasswordValid = await verifyPassword(password, dbUser.password);
        if (isPasswordValid) {
          user = {
            id: dbUser.id,
            name: dbUser.name,
            username: dbUser.username,
            email: dbUser.email,
            role: dbUser.role || 'siswa',
            nisn: dbUser.nisn || undefined,
            student_class: dbUser.student_class || undefined,
            whatsapp: dbUser.whatsapp || undefined,
          };
        }
      }
    } catch (dbError: any) {
      console.warn('Gagal koneksi ke DB MySQL (fallback demo login aktif jika kredensial cocok):', dbError.message);
      
      // Fallback akun default jika MySQL Laragon belum diimport
      if (
        (username === 'admin' || username === 'admin@smkn11bdg.sch.id') &&
        (password === 'admin123' || password === 'admin')
      ) {
        isPasswordValid = true;
        user = {
          id: 1,
          name: 'Administrator Koperasi',
          username: 'admin',
          email: 'admin@smkn11bdg.sch.id',
          role: 'admin',
        };
      } else if (
        (username === 'kasir' || username === 'kasir@smkn11bdg.sch.id') &&
        (password === 'admin123' || password === 'kasir')
      ) {
        isPasswordValid = true;
        user = {
          id: 2,
          name: 'Petugas Kasir 11',
          username: 'kasir',
          email: 'kasir@smkn11bdg.sch.id',
          role: 'kasir',
        };
      } else if (
        (username === 'nayra' || username === '0061234567' || username === 'siswa') &&
        (password === 'admin123' || password === 'siswa123')
      ) {
        isPasswordValid = true;
        user = {
          id: 3,
          name: 'Nayra Aulia Khoirunnisa',
          username: 'nayra',
          email: 'nayra@smkn11bdg.sch.id',
          role: 'siswa',
          nisn: '0061234567',
          student_class: 'X PPLG 1',
          whatsapp: '081223344556',
        };
      } else if (
        (username === 'fahri' || username === '0069876543') &&
        (password === 'admin123' || password === 'siswa123')
      ) {
        isPasswordValid = true;
        user = {
          id: 4,
          name: 'Muhammad Fahri Ismail',
          username: 'fahri',
          email: 'fahri@smkn11bdg.sch.id',
          role: 'siswa',
          nisn: '0069876543',
          student_class: 'XI TKJ',
          whatsapp: '081399887766',
        };
      }
    }

    if (!user || !isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Username / NISN atau password yang Anda masukkan salah.' },
        { status: 401 }
      );
    }

    // Buat JWT session token
    const token = await createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      message: `Selamat datang kembali, ${user.name}!`,
      user,
    });

    // Pasang secure cookie (7 hari)
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Error Login API:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat proses login.' },
      { status: 500 }
    );
  }
}
